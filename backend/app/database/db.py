from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# This is the location of our SQLite database file.
# It will create a file called "tasks.db" inside the Backend folder.
SQLALCHEMY_DATABASE_URL = "sqlite:///./tasks.db"

# The "engine" is what actually manages the connection to the database.
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# A "session" is like a temporary workspace we use to talk to the database
# (adding, reading, updating, deleting data).
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# "Base" is a starting point that all our database models (tables) will inherit from.
Base = declarative_base()