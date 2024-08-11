from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import asyncpg
from async_lru import alru_cache
from typing import List
from pydantic import BaseModel
import os
from dotenv import load_dotenv
from fileProperties import get_mime_type, generate_uid
from database import database
from models import users

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:8080",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120


class UserCreate(BaseModel):
    username: str
    password: str
    role_id: int


async def get_user_by_username(username: str):
    query = users.select().where(users.c.username == username)
    return await database.fetch_one(query)


async def create_user(user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    query = users.insert().values(username=user.username, password=hashed_password, role_id=user.role_id)
    user_id = await database.execute(query)  # Capture the inserted user ID
    return {"id": user_id, "username": user.username, "role_id": user.role_id}  # Return the user data including ID


@app.post("/register")
async def register_user(user: UserCreate):
    db_user = await get_user_by_username(username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    return await create_user(user=user)


async def authenticate_user(username: str, password: str):
    user = await get_user_by_username(username)
    if not user:
        return False
    if not pwd_context.verify(password, user['password']):
        return False
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@app.post("/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['username'], "id": user['id'], "role_id": user['role_id']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "id": user['id'], "role_id": user['role_id']}


async def verify_token(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=403, detail="Token is invalid or expired")
        return {"username": username}
    except JWTError:
        raise HTTPException(status_code=403, detail="Token is invalid or expired")


class PasswordChange(BaseModel):
    user_id: int
    current_password: str
    new_password: str
    confirm_new_password: str


@app.post("/change-password")
async def change_password(password_data: PasswordChange):
    db_user = await get_user_by_id(password_data.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    if not pwd_context.verify(password_data.current_password, db_user['password']):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if password_data.new_password != password_data.confirm_new_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    hashed_new_password = pwd_context.hash(password_data.new_password)
    query = users.update().where(users.c.id == db_user['id']).values(password=hashed_new_password)
    await database.execute(query)
    return {"message": "Password updated successfully"}


async def get_user_by_id(user_id: int):
    query = users.select().where(users.c.id == user_id)
    return await database.fetch_one(query)


@app.get("/verify-token/{token}")
async def verify_user_token(token: str):
    return await verify_token(token=token)


@app.on_event("startup")
async def startup():
    await database.connect()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


async def db_connect():
    return await asyncpg.connect(
        user="postgres",
        password="123",
        database="docste",
        host="localhost"
    )


@alru_cache
@app.get('/api/data')
async def get_data(folder_id: int):
    try:
        conn = await db_connect()
        rows = await conn.fetch(
            '''
            SELECT d.id,
            d.number document_number,
            d.title document_title,
            d.title_native document_title_native,
            d.remarks,
            p."name" project,
            di."name" discipline,
            dt."name" document_type,
            rs1."name" revision_status,
            rs2.description revision_step,
            l."name" language,
            rd.description revision_description,
            d.revision_number,
            TO_CHAR(d.created, 'YYYY-MM-DD HH24:MI:SS') created,
            CAST(d.modified AS TIMESTAMP) modified
            FROM documents d
            LEFT JOIN projects p ON p.id = d.project_id
            LEFT JOIN disciplines di ON di.id = d.discipline_id
            LEFT JOIN document_types dt ON dt.id = d.type_id
            LEFT JOIN revision_statuses rs1 ON rs1.id = d.revision_status_id
            LEFT JOIN revision_steps rs2 ON rs2.id = d.revision_step_id
            LEFT JOIN languages l ON l.id = d.language_id
            LEFT JOIN revision_descriptions rd ON rd.id = d.revision_description_id
            WHERE d.deleted = 0 AND
            d.folder_id = $1
            ORDER BY d.id
            '''
            , folder_id)
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/disciplines')
async def get_disciplines():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' SELECT * FROM disciplines ORDER BY id ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/document_types')
async def get_document_types():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' SELECT * FROM document_types ORDER BY id ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/revision_statuses')
async def get_revision_statuses():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' SELECT * FROM revision_statuses ORDER BY id ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/revision_steps')
async def get_revision_steps():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' SELECT * FROM revision_steps ORDER BY id ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/revision_descriptions')
async def get_revision_descriptions():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' SELECT * FROM revision_descriptions ORDER BY id ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/languages')
async def get_languages():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' SELECT * FROM languages ORDER BY id ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/addnewdoc')
async def post_addnewdoc(document: dict):
    try:
        conn = await db_connect()
        print("Received document:", document)
        document['discipline'] = int(document['discipline'])
        document['document_type'] = int(document['document_type'])
        document['revision_status'] = int(document['revision_status'])
        document['revision_step'] = int(document['revision_step'])
        document['revision_description'] = int(document['revision_description'])
        document['folder_id'] = int(document['folder_id'])
        document['user_id'] = int(document['user_id'])
        print("Converted document:", document)
        query = '''
            INSERT INTO documents (
                number,
                title,
                title_native,
                remarks,
                discipline_id,
                type_id,
                revision_status_id,
                revision_step_id,
                revision_description_id,
                language_id,
                revision_number,
                folder_id,
                user_id
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING id
        '''
        result = await conn.fetchrow(
            query,
            document['document_number'],
            document['document_title'],
            document['document_title_native'],
            document['remarks'],
            document['discipline'],
            document['document_type'],
            document['revision_status'],
            document['revision_step'],
            document['revision_description'],
            document['language'],
            document['revision_number'],
            document['folder_id'],
            document['user_id']
        )
        await conn.close()
        return {'message': 'Document added successfully', 'document_id': result['id']}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.put('/api/upddoc/{id}')
async def put_upddoc(id: int, update_data: dict):
    try:
        conn = await db_connect()
        set_clause = ', '.join([f'{column} = ${i + 2}' for i, (column, value) in enumerate(
            update_data.items())])  # Создаем строку для запроса UPDATE на основе переданных данных обновления
        query = f'''
            UPDATE documents
            SET {set_clause}
            WHERE id = $1
        '''
        values = [id] + list(update_data.values())  # Формируем список значений для передачи в запрос UPDATE
        await conn.execute(query, *values)
        await conn.close()
        return {'message': 'Document updated successfully'}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.put('/api/deldoc/{id}')
async def put_deldoc(id: int):
    try:
        conn = await db_connect()
        query = '''
            UPDATE documents
            SET deleted = 1
            WHERE id = $1
        '''
        await conn.execute(query, id)
        await conn.close()
        return {'message': 'Document deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put('/api/deldocfil/{id}')
async def put_deldocfil(id: int):
    try:
        conn = await db_connect()
        query = '''
            UPDATE uploaded_files
            SET deleted = 1
            WHERE document_id = $1
        '''
        await conn.execute(query, id)
        await conn.close()
        return {'message': 'Document files deleted successfully'}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/addfiles')
async def add_files(document_id: int, files: List[UploadFile] = File(...)):
    try:
        for file in files:
            # Сохраняем файл на сервере
            path = f'./uploads/{file.filename}'
            with open(path, 'wb') as buffer:
                buffer.write(await file.read())

            # Добавляем запись в таблицу document_files
            conn = await db_connect()
            query = '''
                INSERT INTO uploaded_files (document_id, path)
                VALUES ($1, $2)
            '''
            await conn.execute(query, document_id, path)
            await conn.close()

        return {'message': 'Files added successfully'}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


class FileData(BaseModel):
    uid: str
    file_name: str
    mime_type: str
    file_size: int
    status: str
    url: str


@app.get('/api/getfiles/{document_id}', response_model=List[FileData])
async def get_files(document_id: int):
    try:
        conn = await db_connect()
        query = '''
            SELECT path
            FROM uploaded_files
            WHERE document_id = $1 AND
            deleted = 0
        '''
        rows = await conn.fetch(query, document_id)
        await conn.close()

        files = []
        for row in rows:
            uid = generate_uid()
            file_name = os.path.basename(row['path'])
            mime_type = get_mime_type(os.path.splitext(row['path'])[1])
            file_size = os.path.getsize(row['path'])  # Получаем размер файла в байтах
            status = 'done'
            url = 'http://127.0.0.1:8000/api/files/' + file_name
            files.append(FileData(uid=uid, file_name=file_name, mime_type=mime_type, file_size=file_size, status=status,
                                  url=url))

        return files

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/files/{filename}')
async def read_uploaded_file(filename: str):
    file_path = os.path.join('./uploads/', filename)
    if os.path.exists(file_path):
        media_type = get_mime_type(os.path.splitext(filename)[1].lower())
        print(media_type)
        return FileResponse(file_path, media_type=media_type)
    else:
        raise HTTPException(status_code=404, detail='Файл не найден')


@alru_cache
@app.get('/api/projects')
async def get_projects():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' SELECT id, number, name, name_native FROM projects ORDER BY id ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/folders/{project_id}')
async def get_folders(project_id: int):
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' 
            WITH RECURSIVE folder_tree AS (
                SELECT id, name, parent_id
                FROM folders
                WHERE project_id = $1 AND parent_id IS NULL AND deleted = 0
                UNION ALL
                SELECT f.id, f.name, f.parent_id
                FROM folders f
                INNER JOIN folder_tree ft ON ft.id = f.parent_id
                WHERE f.deleted = 0
            )
            SELECT id, name, parent_id
            FROM folder_tree;
        ''', project_id)
        await conn.close()

        def build_tree(folders):
            tree = []
            lookup = {folder['id']: {**folder, 'title': folder['name'], 'key': folder['id'], 'children': []} for folder
                      in folders}
            for folder in folders:
                if folder['parent_id']:
                    lookup[folder['parent_id']]['children'].append(lookup[folder['id']])
                else:
                    tree.append(lookup[folder['id']])
            return tree

        return build_tree(rows)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post('/api/addfolder')
async def post_addfolder(folder: dict):
    try:
        conn = await db_connect()
        print("Received folder:", folder)
        if 'parent_id' in folder and folder['parent_id'] is not None:
            folder['parent_id'] = int(folder['parent_id'])
        folder['project_id'] = int(folder['project_id'])
        folder['deleted'] = int(folder['deleted'])
        print("Converted folder:", folder)
        query = '''
            INSERT INTO folders (
                name,
                parent_id,
                project_id,
                deleted
            )
            VALUES ($1, $2, $3, $4)
            RETURNING id
        '''
        result = await conn.fetchrow(
            query,
            folder['name'],
            folder.get('parent_id'),
            folder['project_id'],
            folder['deleted']
        )
        await conn.close()
        return {'message': 'Folder added successfully', 'folder_id': result['id']}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.put('/api/folders/{folder_id}')
async def update_folder(folder_id: int, update_data: dict):
    try:
        conn = await db_connect()

        # Создаем строку для запроса UPDATE на основе переданных данных обновления
        set_clause = ', '.join([f'{column} = ${i + 2}' for i, (column, value) in enumerate(update_data.items())])

        query = f'''
            UPDATE folders
            SET {set_clause}
            WHERE id = $1
        '''

        # Формируем список значений для передачи в запрос UPDATE
        values = [folder_id] + list(update_data.values())

        await conn.execute(query, *values)
        await conn.close()

        return {'message': 'Folder updated successfully'}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.delete('/api/folders/{folder_id}')
async def delete_folder(folder_id: int):
    try:
        conn = await db_connect()
        await conn.execute('''
            UPDATE folders 
            SET deleted = 1 
            WHERE id = $1
        ''', folder_id)
        await conn.close()
        return {"message": "Folder deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DisciplineReference(BaseModel):
    project_id: int
    discipline_id: int


@app.post("/api/save_discipline_references")
async def save_discipline_references(references: List[DisciplineReference]):
    try:
        conn = await db_connect()
        query = '''
            INSERT INTO project_discipline_doctype_reference (
                project_id,
                discipline_id
            )
            VALUES ($1, $2)
            RETURNING id
        '''
        async with conn.transaction():
            for ref in references:
                await conn.execute(query, ref.project_id, ref.discipline_id)
        await conn.close()
        return {'message': 'References added successfully'}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/api/get_discipline_references/{project_id}')
async def get_discipline_references(project_id: int):
    try:
        conn = await db_connect()
        query = '''
            SELECT CAST(p.id AS TEXT) AS id,
                   CAST(p.project_id AS TEXT) AS project_id,
                   CAST(p.discipline_id AS TEXT) AS discipline_id,
                   d.code,
                   d."name"
            FROM project_discipline_doctype_reference p
            LEFT JOIN disciplines d ON d.id = p.discipline_id
            WHERE p.project_id = $1
        '''
        rows = await conn.fetch(query, project_id)
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/users')
async def get_users():
    try:
        conn = await db_connect()
        rows = await conn.fetch('''
            select u.id,
            u.username,
            u.role_id,
            r."name" role
            from users u 
            left join user_roles r on r.id = u.role_id
            where u.active = 1
            ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/roles')
async def get_roles():
    try:
        conn = await db_connect()
        rows = await conn.fetch(''' select * from user_roles ''')
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UserUpdate(BaseModel):
    role_id: int


@app.put("/api/users/{user_id}")
async def update_user(user_id: int, user_update: UserUpdate, db=Depends(db_connect)):
    try:
        await db.execute('''
            UPDATE users
            SET role_id = $1
            WHERE id = $2
        ''', user_update.role_id, user_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ProjectAccess(BaseModel):
    user_id: int
    project_id: int


@app.post("/api/add_users_project_access")
async def add_users_project_access(references: List[ProjectAccess]):
    try:
        conn = await db_connect()
        query = '''
            INSERT INTO user_project_access (
                user_id,
                project_id
            )
            VALUES ($1, $2)
            RETURNING id
        '''
        async with conn.transaction():
            for ref in references:
                await conn.execute(query, ref.user_id, ref.project_id)
        await conn.close()
        return {'message': 'References added successfully'}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@alru_cache
@app.get('/api/user_projects')
async def get_user_projects(id: int = Query(..., description="ID пользователя")):
    try:
        conn = await db_connect()
        rows = await conn.fetch('''
            SELECT
            p.id,
            p.number,
            p.name,
            p.name_native
            FROM projects p 
            LEFT JOIN user_project_access upa ON upa.project_id = p.id 
            LEFT JOIN users u ON u.id = upa.user_id
            WHERE u.id = $1
        ''', id)
        await conn.close()
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class UserProjectAccess(BaseModel):
    project_id: int


@app.get("/api/user_project_access/{user_id}", response_model=List[UserProjectAccess])
async def get_user_project_access(user_id: int):
    try:
        conn = await db_connect()
        query = '''
            SELECT project_id
            FROM user_project_access
            WHERE user_id = $1
        '''
        result = await conn.fetch(query, user_id)
        await conn.close()
        return [{"project_id": row["project_id"]} for row in result]
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/user-deactivate/{user_id}")
async def user_deactivate(user_id: int, db=Depends(db_connect)):
    try:
        await db.execute('''
            UPDATE users
            SET active = 0
            WHERE id = $1
        ''', user_id)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
