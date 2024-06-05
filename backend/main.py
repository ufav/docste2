from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
import asyncpg
import asyncio
from async_lru import alru_cache
from typing import List, Dict, Optional
from starlette.responses import RedirectResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os
import io
from fileProperties import get_mime_type, generate_uid

app = FastAPI()

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


async def db_connect():
    return await asyncpg.connect(
        user="postgres",
        password="123",
        database="docste",
        host="localhost"
    )


@alru_cache
@app.get('/api/data')
async def get_data():
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
            WHERE d.deleted = 0
            ORDER BY d.id
            '''
        )
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

        # Преобразование значений в целые числа
        document['discipline'] = int(document['discipline'])
        document['document_type'] = int(document['document_type'])
        document['revision_status'] = int(document['revision_status'])
        document['revision_step'] = int(document['revision_step'])
        document['revision_description'] = int(document['revision_description'])

        # Логирование для диагностики
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
                revision_number
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
            document['revision_number']
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
