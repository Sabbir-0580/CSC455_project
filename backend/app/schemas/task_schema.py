from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Shared fields used when creating OR reading a task
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

# Used when the CLIENT sends data to CREATE a new task
class TaskCreate(TaskBase):
    completed: Optional[bool] = False

# Used when we SEND a task back to the client (includes fields the DB generates)
class TaskResponse(TaskBase):
    id: int
    completed: bool

    class Config:
        from_attributes = True