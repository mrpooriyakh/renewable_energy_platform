from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from app.database import Base
import uuid
from datetime import datetime
import enum


class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    ADMIN = "admin"


class ContentType(str, enum.Enum):
    VIDEO = "video"
    TEXTBOOK = "textbook"
    PROJECT = "project"
    ASSIGNMENT = "assignment"
    QUIZ = "quiz"


class SubmissionStatus(str, enum.Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    GRADED = "graded"
    LATE = "late"


# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Profile info
    student_id = Column(String(20), unique=True, nullable=True)
    department = Column(String(100), nullable=True)
    year = Column(Integer, nullable=True)
    
    # Relationships
    created_modules = relationship("Module", back_populates="created_by", foreign_keys="Module.created_by_id")
    content_items = relationship("ContentItem", back_populates="uploaded_by")
    submissions = relationship("Submission", back_populates="student", foreign_keys="Submission.student_id")
    graded_submissions = relationship("Submission", back_populates="graded_by", foreign_keys="Submission.graded_by_id")
    enrollments = relationship("Enrollment", back_populates="user")


# Course Module Model
class Module(Base):
    __tablename__ = "modules"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(10), default="📚")
    color = Column(String(100), nullable=True)
    order_index = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    created_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    created_by = relationship("User", back_populates="created_modules", foreign_keys=[created_by_id])
    content_items = relationship("ContentItem", back_populates="module", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="module")


# Content Item Model (Videos, PDFs, etc.)
class ContentItem(Base):
    __tablename__ = "content_items"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    content_type = Column(Enum(ContentType), nullable=False)
    
    # File information
    file_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_size = Column(Integer, nullable=True)  # in bytes
    file_url = Column(String(500), nullable=True)
    mime_type = Column(String(100), nullable=True)
    
    # Content specific fields
    duration = Column(String(20), nullable=True)  # For videos
    instructions = Column(Text, nullable=True)  # For assignments/projects
    due_date = Column(DateTime, nullable=True)  # For assignments
    points = Column(Integer, default=0)  # For quizzes/assignments
    
    # Status and ordering
    is_published = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    module_id = Column(String(36), ForeignKey("modules.id"), nullable=False)
    uploaded_by_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    
    # Relationships
    module = relationship("Module", back_populates="content_items")
    uploaded_by = relationship("User", back_populates="content_items")
    submissions = relationship("Submission", back_populates="content_item")


# Student Enrollment Model
class Enrollment(Base):
    __tablename__ = "enrollments"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    progress = Column(Float, default=0.0)  # 0-100%
    is_active = Column(Boolean, default=True)
    
    # Foreign Keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    module_id = Column(String(36), ForeignKey("modules.id"), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="enrollments")
    module = relationship("Module", back_populates="enrollments")


# Assignment Submission Model
class Submission(Base):
    __tablename__ = "submissions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_text = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=True)
    file_path = Column(String(500), nullable=True)
    file_url = Column(String(500), nullable=True)
    
    # Grading
    status = Column(Enum(SubmissionStatus), default=SubmissionStatus.PENDING)
    grade = Column(Float, nullable=True)  # 0-100
    feedback = Column(Text, nullable=True)
    graded_at = Column(DateTime, nullable=True)
    
    # Timestamps
    submitted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign Keys
    student_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content_item_id = Column(String(36), ForeignKey("content_items.id"), nullable=False)
    graded_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    student = relationship("User", back_populates="submissions", foreign_keys=[student_id])
    content_item = relationship("ContentItem", back_populates="submissions")
    graded_by = relationship("User", back_populates="graded_submissions", foreign_keys=[graded_by_id])


# Activity Log Model (for tracking user actions)
class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    action = Column(String(100), nullable=False)  # "uploaded_file", "submitted_assignment", etc.
    description = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign Keys
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    content_item_id = Column(String(36), ForeignKey("content_items.id"), nullable=True)
    
    # Relationships
    user = relationship("User")
    content_item = relationship("ContentItem")