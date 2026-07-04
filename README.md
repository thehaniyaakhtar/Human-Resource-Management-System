# HRMS Auth System

## Stack
- **Frontend**: Vite + React, framer-motion, react-router-dom, axios, lucide-react
- **Backend**: FastAPI, JWT (python-jose), bcrypt (passlib)

## Run Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

## Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on http://localhost:5173  
Backend API at http://localhost:8000  
API docs at http://localhost:8000/docs

## Features
- Sign Up with company name, logo upload, name, email, phone, role, password
- Auto-generated Employee ID: `{CompanyInitials}{NameCode}{Year}{Serial}` e.g. `OIJODO20260001`
- Sign In with email + password
- JWT access tokens (8h expiry)
- Password strength indicator
- Role selector: Employee / HR Officer / Admin
- Protected dashboard route
- Persistent auth via localStorage
