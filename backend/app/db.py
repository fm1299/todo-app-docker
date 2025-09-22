from sqlmodel import create_engine, SQLModel, Session
from dotenv import load_dotenv
import os

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:917657@localhost/todo_db")

engine = create_engine(DATABASE_URL)

def create_db_and_tables():
    from app.models import User, Todo
    SQLModel.metadata.create_all(engine)

def getEngine():
    return engine


def get_session():
    with Session(engine) as session:
        return session