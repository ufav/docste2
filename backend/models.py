from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime, Text, func, Table
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from database import Base
from database import metadata


class Company(Base):    # справочник
    __tablename__ = 'companies'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(256), nullable=False)
    name_native = Column(String(256))
    role = Column(Integer)


class Project(Base):    # справочник
    __tablename__ = 'projects'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    number = Column(String(128), nullable=False)
    name = Column(String(512), nullable=False)
    name_native = Column(String(512))


class Facility(Base):    # справочник
    __tablename__ = 'facilities'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(512), nullable=False)
    name_native = Column(String(512))


class Language(Base):    # справочник
    __tablename__ = 'languages'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(512), nullable=False)
    name_native = Column(String(512))


class Department(Base):    # справочник
    __tablename__ = 'departments'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(256), nullable=False)
    name_native = Column(String(256))
    company_id = Column(Integer, index=True)


class Discipline(Base):    # справочник
    __tablename__ = 'disciplines'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(16))
    name = Column(String(256), nullable=False)
    name_native = Column(String(256))
    department_id = Column(Integer)


class DocumentType(Base):    # справочник
    __tablename__ = 'document_types'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(16))
    name = Column(String(256))
    name_native = Column(String(256))


class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(64), nullable=False)
    password = Column(String(64), nullable=False)
    email = Column(String(64), nullable=False)
    role_id = Column(Integer, nullable=False)
    department_id = Column(Integer)
    active = Column(Integer)


class UserRole(Base):    # справочник
    __tablename__ = 'user_roles'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(64), nullable=False)


class Action(Base):    # справочник
    __tablename__ = 'actions'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(128))
    name_native = Column(String(128))


class DocumentPrefix(Base):
    __tablename__ = 'document_prefixes'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    prefix = Column(String(16))


class RevisionStatus(Base):    # справочник
    __tablename__ = 'revision_statuses'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(32))
    name_native = Column(String(32))


class RevisionDescription(Base):    # справочник
    __tablename__ = 'revision_descriptions'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(16))
    description = Column(String(512))
    description_native = Column(String(512))
    phase = Column(String(16))


class RevisionStep(Base):    # справочник
    __tablename__ = 'revision_steps'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    code = Column(String(16))
    description = Column(String(512))
    description_native = Column(String(512))
    description_long = Column(Text)


class CompanyParticipating(Base):
    __tablename__ = 'company_participating'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    company_id = Column(Integer, index=True)
    project_id = Column(Integer, index=True)


class ProjectDisciplineDoctypeReference(Base):
    __tablename__ = 'project_discipline_doctype_reference'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(Integer, index=True)
    discipline_id = Column(Integer, index=True)
    type_id = Column(Integer, index=True)


class Document(Base):
    __tablename__ = 'documents'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created = Column(DateTime(timezone=True), default=func.now())
    modified = Column(DateTime(timezone=True))
    deleted = Column(Integer, default=0)
    number = Column(String(128), nullable=False, index=True)
    title = Column(String(512), nullable=False)
    title_native = Column(String(512))
    remarks = Column(Text)
    project_id = Column(Integer, nullable=False, index=True)
    discipline_id = Column(Integer, nullable=False, index=True)
    type_id = Column(Integer, nullable=False, index=True)
    revision_status_id = Column(Integer, nullable=False, index=True)
    revision_description_id = Column(Integer, nullable=False, index=True)
    revision_step_id = Column(Integer, nullable=False, index=True)
    revision_number = Column(String(8), nullable=False, index=True)
    language_id = Column(Integer, nullable=False, index=True)
    folder_id = Column(Integer, nullable=False, index=True)
    user_id = Column(Integer, nullable=False, index=True)


class UserProjectAccess(Base):
    __tablename__ = 'user_project_access'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer)
    project_id = Column(Integer)


class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created = Column(DateTime(timezone=True), default=func.now())
    user_id = Column(Integer, index=True)
    action_id = Column(Integer, index=True)
    description = Column(String(512))
    description_native = Column(String(512))


class UploadedFile(Base):
    __tablename__ = 'uploaded_files'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created = Column(DateTime(timezone=True), default=func.now())
    modified = Column(DateTime(timezone=True))
    deleted = Column(Integer, default=0)
    path = Column(String(2048), index=True)


class Transmittal(Base):
    __tablename__ = 'transmittals'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    created = Column(DateTime(timezone=True), default=func.now())
    modified = Column(DateTime(timezone=True))
    deleted = Column(Integer, default=0)
    number = Column(String(128), nullable=False, index=True)
    direction = Column(Boolean, nullable=True)  # To, From
    recieved = Column(DateTime(timezone=True))
    responsed = Column(DateTime(timezone=True))
    issued = Column(DateTime(timezone=True))
    remarks = Column(Text)
    document_id = Column(Integer, nullable=False, index=True)


class Folder(Base):    # справочник
    __tablename__ = 'folders'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, nullable=False, index=True)
    project_id = Column(Integer, nullable=False, index=True)
    deleted = Column(Integer, default=0)


users = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("username", String, unique=True, index=True),
    Column("password", String),
    Column("role_id", Integer, index=True),
)
