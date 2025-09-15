from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models import UserRole, ContentType, SubmissionStatus


# Base schemas
class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# User schemas
class UserBase(BaseSchema):
    username: str = Field(..., min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.STUDENT
    student_id: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseSchema):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime


class UserLogin(BaseSchema):
    username: str
    password: str


class Token(BaseSchema):
    access_token: str
    token_type: str
    user: UserResponse


# Module schemas
class ModuleBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon: str = "📚"
    color: Optional[str] = None
    order_index: int = 0
    is_active: bool = True


class ModuleCreate(ModuleBase):
    pass


class ModuleUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None
    order_index: Optional[int] = None
    is_active: Optional[bool] = None


class ModuleResponse(ModuleBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by_id: UUID
    content_count: Optional[int] = 0


# Content Item schemas
class ContentItemBase(BaseSchema):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    content_type: ContentType
    duration: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[datetime] = None
    points: int = 0
    is_published: bool = True
    order_index: int = 0


class ContentItemCreate(ContentItemBase):
    module_id: UUID


class ContentItemUpdate(BaseSchema):
    title: Optional[str] = None
    description: Optional[str] = None
    duration: Optional[str] = None
    instructions: Optional[str] = None
    due_date: Optional[datetime] = None
    points: Optional[int] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None


class ContentItemResponse(ContentItemBase):
    id: UUID
    module_id: UUID
    uploaded_by_id: UUID
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    uploaded_by: Optional[UserResponse] = None


# File upload response
class FileUploadResponse(BaseSchema):
    file_path: str
    file_url: str
    file_name: str
    file_size: int
    mime_type: Optional[str] = None
    file_hash: Optional[str] = None


# Submission schemas
class SubmissionBase(BaseSchema):
    submission_text: Optional[str] = None
    content_item_id: UUID


class SubmissionCreate(SubmissionBase):
    pass


class SubmissionUpdate(BaseSchema):
    submission_text: Optional[str] = None
    grade: Optional[float] = None
    feedback: Optional[str] = None
    status: Optional[SubmissionStatus] = None


class SubmissionResponse(SubmissionBase):
    id: UUID
    student_id: UUID
    file_name: Optional[str] = None
    file_url: Optional[str] = None
    status: SubmissionStatus
    grade: Optional[float] = None
    feedback: Optional[str] = None
    submitted_at: datetime
    updated_at: datetime
    graded_at: Optional[datetime] = None
    graded_by_id: Optional[UUID] = None
    student: Optional[UserResponse] = None
    content_item: Optional[ContentItemResponse] = None


# Enrollment schemas
class EnrollmentBase(BaseSchema):
    module_id: UUID
    user_id: UUID


class EnrollmentCreate(BaseSchema):
    module_id: UUID


class EnrollmentResponse(EnrollmentBase):
    id: UUID
    enrolled_at: datetime
    progress: float
    is_active: bool
    module: Optional[ModuleResponse] = None


# Dashboard statistics
class DashboardStats(BaseSchema):
    total_students: int = 0
    active_students: int = 0
    total_modules: int = 0
    total_content_items: int = 0
    total_submissions: int = 0
    pending_submissions: int = 0
    average_progress: float = 0.0


class StudentProgress(BaseSchema):
    user_id: UUID
    username: str
    full_name: str
    modules_enrolled: int = 0
    average_progress: float = 0.0
    total_submissions: int = 0
    last_activity: Optional[datetime] = None


# Activity Log
class ActivityLogResponse(BaseSchema):
    id: UUID
    action: str
    description: Optional[str] = None
    created_at: datetime
    user_id: UUID
    content_item_id: Optional[UUID] = None


# WebSocket message schemas
class WebSocketMessage(BaseSchema):
    type: str  # "notification", "content_update", "submission", etc.
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class NotificationMessage(BaseSchema):
    title: str
    message: str
    type: str = "info"  # info, success, warning, error
    user_id: Optional[UUID] = None
    module_id: Optional[UUID] = None
    content_item_id: Optional[UUID] = None


# Error response
class ErrorResponse(BaseSchema):
    detail: str
    code: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


# Success response
class SuccessResponse(BaseSchema):
    message: str
    data: Optional[dict] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)