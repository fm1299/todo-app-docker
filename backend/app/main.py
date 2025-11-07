from fastapi import FastAPI, Depends, HTTPException, status, Header
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlmodel import select
from app.db import create_db_and_tables, engine, getEngine
from app.models import User, Todo
from app.auth import get_password_hash, verify_password, create_access_token, decode_token
from pydantic import BaseModel
from typing import List, Optional
from sqlmodel import Session

app = FastAPI(title="TodoApp")

# Configure CORS to explicitly allow the frontend origin
# You can override by setting CORS_ALLOW_ORIGINS to a comma-separated list

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

class UserCreate(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None

def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing authorization header")
    try:
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid auth scheme")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    return payload["sub"]

@app.post("/auth/register", response_model=TokenResponse)
def register(user: UserCreate):
    from app.db import engine
    with Session(getEngine()) as conn:
        existing = conn.exec(select(User).where(User.username == user.username)).first()
        if existing:
            raise HTTPException(status_code=400, detail="User already exists")
        hashed = get_password_hash(user.password)
        u = User(username=user.username, hashed_password=hashed)
        conn.add(u)
        conn.commit()
        conn.refresh(u)
        token = create_access_token({"sub": u.username})
        return {"access_token": token}

@app.post("/auth/login", response_model=TokenResponse)
def login(user: UserCreate):
    with Session(getEngine()) as conn:
        db_user = conn.exec(select(User).where(User.username == user.username)).first()
        if not db_user or not verify_password(user.password, db_user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        token = create_access_token({"sub": db_user.username})
        return {"access_token": token}

@app.post("/todos", response_model=dict)
def create_todo(todo: TodoCreate, current_user: str = Depends(get_current_user)):
    with Session(getEngine()) as conn:
        user = conn.exec(select(User).where(User.username == current_user)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        t = Todo(title=todo.title, description=todo.description, owner_id=user.id)
        conn.add(t)
        conn.commit()
        conn.refresh(t)
        return {"id": t.id, "title": t.title, "description": t.description, "completed": t.completed}

@app.get("/todos", response_model=List[dict])
def list_todos(current_user: str = Depends(get_current_user)):
    with Session(getEngine()) as conn:
        user = conn.exec(select(User).where(User.username == current_user)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        rows = conn.exec(select(Todo).where(Todo.owner_id == user.id)).all()
        return [{"id": r.id, "title": r.title, "description": r.description, "completed": r.completed} for r in rows]

@app.put("/todos/{todo_id}/toggle", response_model=dict)
def toggle_todo(todo_id: int, current_user: str = Depends(get_current_user)):
    with Session(getEngine()) as conn:
        user = conn.exec(select(User).where(User.username == current_user)).first()
        t = conn.exec(select(Todo).where(Todo.id == todo_id, Todo.owner_id == user.id)).first()
        if not t:
            raise HTTPException(status_code=404, detail="Todo not found")
        t.completed = not t.completed
        conn.add(t)
        conn.commit()
        conn.refresh(t)
        return {"id": t.id, "completed": t.completed}
