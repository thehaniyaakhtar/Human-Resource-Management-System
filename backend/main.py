from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import re

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

class SignUpRequest(BaseModel):
    company_name: str
    name: str
    email: EmailStr
    phone: str
    password: str
    confirm_password: str
    role: str = "employee"
    company_logo: Optional[str] = None

class SignInRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

def generate_employee_id(company_name: str, full_name: str, year: int, company_serials: dict) -> str:
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
        email: str = payload.get("sub")
        if email is None or email not in fake_db:
            raise HTTPException(status_code=401, detail="Invalid token")
        return fake_db[email]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/auth/signup", response_model=TokenResponse)
async def signup(body: SignUpRequest):
    if body.email in fake_db:
        raise HTTPException(status_code=400, detail="Email already registered")
    if body.password != body.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(body.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    year = datetime.utcnow().year
    employee_id = generate_employee_id(body.company_name, body.name, year, company_serials)
    user = {
        "employee_id": employee_id,
        "email": body.email,
        "name": body.name,
        "company_name": body.company_name,
        "phone": body.phone,
        "role": body.role,
        "hashed_password": hash_password(body.password),
        "created_at": datetime.utcnow().isoformat(),
    }
    fake_db[body.email] = user
    token = create_token({"sub": body.email, "role": body.role})
    safe_user = {k: v for k, v in user.items() if k != "hashed_password"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}

@app.post("/auth/signin", response_model=TokenResponse)
async def signin(body: SignInRequest):
    user = fake_db.get(body.email)
    if not user or not verify_password(body.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": body.email, "role": user["role"]})
    safe_user = {k: v for k, v in user.items() if k != "hashed_password"}
    return {"access_token": token, "token_type": "bearer", "user": safe_user}

@app.get("/auth/me")
async def me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "hashed_password"}

@app.get("/health")
async def health():
    return {"status": "ok"}
