import os
import uuid
from sqlalchemy import create_engine, Column, String, Boolean, Float, Integer, ForeignKey, Text, Date, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hrms.db")

# For SQLite config, allow multithreading access
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class CompanySerial(Base):
    __tablename__ = "company_serials"
    
    serial_key = Column(String, primary_key=True, index=True)
    count = Column(Integer, default=0)

class SalaryStructure(Base):
    __tablename__ = "salary_structures"
    
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String, ForeignKey("users.employee_id", ondelete="CASCADE"), unique=True)
    basic_salary = Column(Float, default=0.0)
    hra = Column(Float, default=0.0)
    allowances = Column(Float, default=0.0)
    deductions = Column(Float, default=0.0)
    net_salary = Column(Float, default=0.0)
    
    user = relationship("User", back_populates="salary")

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    employee_id = Column(String, ForeignKey("users.employee_id", ondelete="CASCADE"))
    name = Column(String, nullable=False)
    doc_type = Column(String, nullable=False)
    data = Column(Text, nullable=False)
    uploaded_at = Column(String, nullable=False)
    
    user = relationship("User", back_populates="documents")

class User(Base):
    __tablename__ = "users"
    
    employee_id = Column(String, primary_key=True, index=True)
    login_id = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    phone = Column(String)
    role = Column(String, nullable=False)  # "hr" or "employee"
    hashed_password = Column(String, nullable=False)
    must_change_password = Column(Boolean, default=False)
    created_at = Column(String, nullable=False)
    
    # Optional profile info
    date_of_birth = Column(String, nullable=True)
    gender = Column(String, nullable=True)
    address = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    postal_code = Column(String, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    department = Column(String, nullable=True)
    designation = Column(String, nullable=True)
    employment_type = Column(String, nullable=True)
    join_date = Column(String, nullable=True)
    work_location = Column(String, nullable=True)
    reporting_manager = Column(String, nullable=True)
    profile_picture = Column(Text, nullable=True)
    
    # Relationships
    salary = relationship("SalaryStructure", uselist=False, back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(
        String,
        ForeignKey("users.employee_id", ondelete="CASCADE"),
        nullable=False
    )

    date = Column(Date, nullable=False)

    check_in = Column(DateTime, nullable=True)

    check_out = Column(DateTime, nullable=True)

    work_hours = Column(Float, default=0)

    extra_hours = Column(Float, default=0)

    status = Column(String, default="Absent")
    # Present
    # Absent
    # Half-day
    # Leave

    user = relationship("User")