from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import Base, engine
from app.routes import task_routes

# This line creates all database tables (like "tasks") if they don't exist yet.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Task Manager API")

# CORS settings: this allows your React frontend (running on a different port)
# to send requests to this backend without the browser blocking them.
origins = [
    "http://localhost:5173",  # default Vite dev server address
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Plug in all the task-related endpoints we built in task_routes.py
app.include_router(task_routes.router)

@app.get("/")
def root():
    return {"message": "Smart Task Manager API is running"}