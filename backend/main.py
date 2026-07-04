from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional, List
import secrets
import string
import uuid

app = FastAPI(title="HRMS Auth API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "hrms-secret-key-change-in-production-2024"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/signin")

fake_db: dict = {}
company_serials: dict = {}

class HRSignUpRequest(BaseModel):
    company_name: str
    name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str
    company_logo: Optional[str] = None

class DocumentItem(BaseModel):
    name: str
    doc_type: str
    data: str

class SalaryStructure(BaseModel):
    basic_salary: float = 0
    hra: float = 0
    allowances: float = 0
    deductions: float = 0

class CreateEmployeeRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    employment_type: Optional[str] = None
    join_date: Optional[str] = None
    work_location: Optional[str] = None
    reporting_manager: Optional[str] = None
    salary: Optional[SalaryStructure] = None
    documents: Optional[List[DocumentItem]] = None
    profile_picture: Optional[str] = None

class SignInRequest(BaseModel):
    login_id: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_new_password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

def generate_employee_id(company_name: str, full_name: str, year: int) -> str:
    words = company_name.strip().split()
    company_code = "".join(w[0].upper() for w in words[:3]) if len(words) >= 2 else company_name[:2].upper()
    name_parts = full_name.strip().split()
    first_two = (name_parts[0][:2] if len(name_parts) > 0 else "XX").upper()
    last_two = (name_parts[-1][:2] if len(name_parts) > 1 else "XX").upper()
    name_code = first_two + last_two
    serial_key = f"{company_code}_{year}"
    company_serials[serial_key] = company_serials.get(serial_key, 0) + 1
    serial = str(company_serials[serial_key]).zfill(4)
    return f"{company_code}{name_code}{year}{serial}"

def generate_temp_password(length: int = 12) -> str:
    chars = string.ascii_letters + string.digits + "!@#$"
    return "".join(secrets.choice(chars) for _ in range(length))

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode()[:72], bcrypt.gensalt()).decode()

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode()[:72], hashed.encode())

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        login_id: str = payload.get("sub")
        if login_id is None or login_id not in fake_db:
            raise HTTPException(status_code=401, detail="Invalid token")
        return fake_db[login_id]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_hr(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "hr":
        raise HTTPException(status_code=403, detail="HR/Admin access only")
    return current_user

def safe(user: dict) -> dict:
    return {k: v for k, v in user.items() if k != "hashed_password"}

def safe_list_item(user: dict) -> dict:
    salary = user.get("salary") or {}
    return {
        "employee_id": user["employee_id"],
        "name": user["name"],
        "email": user["email"],
        "phone": user.get("phone"),
        "department": user.get("department"),
        "designation": user.get("designation"),
        "employment_type": user.get("employment_type"),
        "join_date": user.get("join_date"),
        "profile_picture": user.get("profile_picture"),
        "document_count": len(user.get("documents") or []),
        "created_at": user.get("created_at"),
    }

def safe_detail(user: dict) -> dict:
    data = safe(user)
    docs = data.get("documents") or []
    data["documents"] = [
        {k: v for k, v in doc.items() if k != "data"} for doc in docs
    ]
    return data

def compute_net_salary(salary: dict) -> dict:
    basic = float(salary.get("basic_salary") or 0)
    hra = float(salary.get("hra") or 0)
    allowances = float(salary.get("allowances") or 0)
    deductions = float(salary.get("deductions") or 0)
    return {
        **salary,
        "net_salary": round(basic + hra + allowances - deductions, 2),
    }

@app.post("/auth/hr/signup", response_model=TokenResponse)
async def hr_signup(body: HRSignUpRequest):
    if body.email in fake_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    if body.password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    year = datetime.utcnow().year
    employee_id = generate_employee_id(body.company_name, body.name, year)
    user = {
        "employee_id": employee_id,
        "login_id": employee_id,
        "email": body.email,
        "name": body.name,
        "company_name": body.company_name,
        "phone": body.phone,
        "role": "hr",
        "hashed_password": hash_password(body.password),
        "must_change_password": False,
        "created_at": datetime.utcnow().isoformat(),
    }
    fake_db[employee_id] = user
    token = create_token({"sub": employee_id, "role": "hr"})
    return {"access_token": token, "token_type": "bearer", "user": safe(user)}

@app.post("/auth/employees", response_model=dict)
async def create_employee(body: CreateEmployeeRequest, hr: dict = Depends(require_hr)):
    for u in fake_db.values():
        if u.get("email") == body.email and u.get("company_name") == hr["company_name"]:
            raise HTTPException(status_code=400, detail="Email already registered for this company")
    year = datetime.utcnow().year
    employee_id = generate_employee_id(hr["company_name"], body.name, year)
    if employee_id in fake_db:
        raise HTTPException(status_code=400, detail="Employee ID collision, try again")
    temp_password = generate_temp_password()
    now = datetime.utcnow().isoformat()
    documents = []
    if body.documents:
        for doc in body.documents:
            documents.append({
                "id": str(uuid.uuid4()),
                "name": doc.name,
                "doc_type": doc.doc_type,
                "data": doc.data,
                "uploaded_at": now,
            })
    salary = None
    if body.salary:
        salary = compute_net_salary(body.salary.model_dump())
    user = {
        "employee_id": employee_id,
        "login_id": employee_id,
        "email": body.email,
        "name": body.name,
        "company_name": hr["company_name"],
        "phone": body.phone,
        "role": "employee",
        "hashed_password": hash_password(temp_password),
        "must_change_password": True,
        "created_at": now,
        "date_of_birth": body.date_of_birth,
        "gender": body.gender,
        "address": body.address,
        "city": body.city,
        "state": body.state,
        "postal_code": body.postal_code,
        "emergency_contact_name": body.emergency_contact_name,
        "emergency_contact_phone": body.emergency_contact_phone,
        "department": body.department,
        "designation": body.designation,
        "employment_type": body.employment_type,
        "join_date": body.join_date,
        "work_location": body.work_location,
        "reporting_manager": body.reporting_manager,
        "salary": salary,
        "documents": documents,
        "profile_picture": body.profile_picture,
    }
    fake_db[employee_id] = user
    return {**safe(user), "temp_password": temp_password}

@app.get("/employees")
async def list_employees(q: Optional[str] = None, hr: dict = Depends(require_hr)):
    employees = [
        safe_list_item(u) for u in fake_db.values()
        if u.get("role") == "employee" and u.get("company_name") == hr["company_name"]
    ]
    employees.sort(key=lambda e: e.get("created_at") or "", reverse=True)
    if q:
        q_lower = q.lower().strip()
        employees = [
            e for e in employees
            if q_lower in e["name"].lower()
            or q_lower in e["email"].lower()
            or q_lower in e["employee_id"].lower()
            or q_lower in (e.get("department") or "").lower()
            or q_lower in (e.get("designation") or "").lower()
        ]
    return {"employees": employees, "total": len(employees)}

@app.get("/employees/{employee_id}")
async def get_employee(employee_id: str, hr: dict = Depends(require_hr)):
    user = fake_db.get(employee_id)
    if not user or user.get("role") != "employee" or user.get("company_name") != hr["company_name"]:
        raise HTTPException(status_code=404, detail="Employee not found")
    return safe_detail(user)

@app.post("/auth/signin", response_model=TokenResponse)
async def signin(body: SignInRequest):
    user = fake_db.get(body.login_id)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": body.login_id, "role": user["role"]})
    return {"access_token": token, "token_type": "bearer", "user": safe(user)}

@app.post("/auth/change-password")
async def change_password(body: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    if not verify_password(body.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if body.new_password != body.confirm_new_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    if len(body.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    current_user["hashed_password"] = hash_password(body.new_password)
    current_user["must_change_password"] = False
    return {"message": "Password changed successfully"}

@app.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    return safe(current_user)

@app.get("/health")
async def health():
    return {"status": "ok"}
