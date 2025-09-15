from fastapi import FastAPI, HTTPException, Depends, status, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from sqlalchemy.orm import selectinload
from datetime import datetime, timedelta
from typing import List, Optional
import redis.asyncio as redis
from contextlib import asynccontextmanager

from app.config import settings
from app.database import get_db, get_redis, async_engine, Base
from app.models import User, Module, ContentItem, Submission, Enrollment, UserRole, ContentType
from app.schemas import *
from app.auth import *
from app.storage_local import get_storage_service

# Create tables on startup
async def create_tables():
    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await create_tables()
    print("Database tables created successfully!")
    yield
    # Shutdown
    print("Shutting down...")

# Initialize FastAPI app
app = FastAPI(
    title="Renewable Energy Learning Platform API",
    description="Rock-hard backend for managing renewable energy educational content",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (for local development)
if settings.debug:
    app.mount("/files", StaticFiles(directory="uploads"), name="files")

# Storage service
storage = get_storage_service()


# ================ AUTHENTICATION ENDPOINTS ================

@app.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = await authenticate_user(db, user_data.username, user_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )


@app.post("/auth/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if user exists
    result = await db.execute(select(User).where(User.username == user_data.username))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        role=user_data.role,
        student_id=user_data.student_id,
        department=user_data.department,
        year=user_data.year
    )
    
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    
    return UserResponse.model_validate(db_user)


@app.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse.model_validate(current_user)


# ================ MODULE MANAGEMENT ================

@app.get("/modules", response_model=List[ModuleResponse])
async def get_modules(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all modules with content count."""
    result = await db.execute(
        select(Module, func.count(ContentItem.id).label("content_count"))
        .outerjoin(ContentItem)
        .where(Module.is_active == True)
        .group_by(Module.id)
        .order_by(Module.order_index, Module.created_at)
    )
    
    modules_with_count = result.all()
    return [
        ModuleResponse(
            **module.__dict__,
            content_count=count
        )
        for module, count in modules_with_count
    ]


@app.post("/modules", response_model=ModuleResponse)
async def create_module(
    module_data: ModuleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):
    """Create a new module (teachers only)."""
    db_module = Module(
        title=module_data.title,
        description=module_data.description,
        icon=module_data.icon,
        color=module_data.color,
        order_index=module_data.order_index,
        is_active=module_data.is_active,
        created_by_id=current_user.id
    )
    
    db.add(db_module)
    await db.commit()
    await db.refresh(db_module)
    
    return ModuleResponse.model_validate(db_module)


@app.get("/modules/{module_id}/content", response_model=List[ContentItemResponse])
async def get_module_content(
    module_id: str,
    content_type: Optional[ContentType] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all content items for a module."""
    query = select(ContentItem).where(
        ContentItem.module_id == module_id,
        ContentItem.is_published == True
    ).options(selectinload(ContentItem.uploaded_by))
    
    if content_type:
        query = query.where(ContentItem.content_type == content_type)
    
    query = query.order_by(ContentItem.order_index, ContentItem.created_at)
    
    result = await db.execute(query)
    content_items = result.scalars().all()
    
    return [ContentItemResponse.model_validate(item) for item in content_items]


# ================ CONTENT MANAGEMENT ================

@app.post("/content", response_model=ContentItemResponse)
async def create_content_item(
    content_data: ContentItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):
    """Create a new content item (teachers only)."""
    # Verify module exists
    result = await db.execute(select(Module).where(Module.id == content_data.module_id))
    module = result.scalar_one_or_none()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    db_content = ContentItem(
        title=content_data.title,
        description=content_data.description,
        content_type=content_data.content_type,
        duration=content_data.duration,
        instructions=content_data.instructions,
        due_date=content_data.due_date,
        points=content_data.points,
        is_published=content_data.is_published,
        order_index=content_data.order_index,
        module_id=content_data.module_id,
        uploaded_by_id=current_user.id
    )
    
    db.add(db_content)
    await db.commit()
    await db.refresh(db_content)
    
    return ContentItemResponse.model_validate(db_content)


@app.post("/content/{content_id}/upload", response_model=ContentItemResponse)
async def upload_content_file(
    content_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):
    """Upload a file for a content item (teachers only)."""
    # Get content item
    result = await db.execute(
        select(ContentItem).where(
            ContentItem.id == content_id,
            ContentItem.uploaded_by_id == current_user.id
        )
    )
    content_item = result.scalar_one_or_none()
    if not content_item:
        raise HTTPException(status_code=404, detail="Content item not found")
    
    # Upload file
    file_info = await storage.upload_file(
        file, 
        str(current_user.id), 
        str(content_item.module_id),
        content_item.content_type.value
    )
    
    # Update content item with file info
    content_item.file_name = file_info["file_name"]
    content_item.file_path = file_info["file_path"]
    content_item.file_url = file_info["file_url"]
    content_item.file_size = file_info["file_size"]
    content_item.mime_type = file_info.get("mime_type")
    content_item.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(content_item)
    
    # Send real-time notification to students
    await notify_content_update(content_item.module_id, content_item.id)
    
    return ContentItemResponse.model_validate(content_item)


@app.put("/content/{content_id}", response_model=ContentItemResponse)
async def update_content_item(
    content_id: str,
    content_data: ContentItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):
    """Update a content item (teachers only)."""
    result = await db.execute(
        select(ContentItem).where(
            ContentItem.id == content_id,
            ContentItem.uploaded_by_id == current_user.id
        )
    )
    content_item = result.scalar_one_or_none()
    if not content_item:
        raise HTTPException(status_code=404, detail="Content item not found")
    
    # Update fields
    for field, value in content_data.model_dump(exclude_unset=True).items():
        setattr(content_item, field, value)
    
    content_item.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(content_item)
    
    return ContentItemResponse.model_validate(content_item)


@app.delete("/content/{content_id}", response_model=SuccessResponse)
async def delete_content_item(
    content_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):
    """Delete a content item (teachers only)."""
    result = await db.execute(
        select(ContentItem).where(
            ContentItem.id == content_id,
            ContentItem.uploaded_by_id == current_user.id
        )
    )
    content_item = result.scalar_one_or_none()
    if not content_item:
        raise HTTPException(status_code=404, detail="Content item not found")
    
    # Delete file from storage
    if content_item.file_path:
        storage.delete_file(content_item.file_path)
    
    await db.delete(content_item)
    await db.commit()
    
    return SuccessResponse(message="Content item deleted successfully")


# ================ DASHBOARD & ANALYTICS ================

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):
    """Get dashboard statistics (teachers only)."""
    
    # Count students
    student_count = await db.execute(
        select(func.count(User.id)).where(User.role == UserRole.STUDENT, User.is_active == True)
    )
    total_students = student_count.scalar()
    
    # Count active students (those who logged in recently)
    active_students = await db.execute(
        select(func.count(User.id)).where(
            User.role == UserRole.STUDENT,
            User.is_active == True,
            User.updated_at >= datetime.utcnow() - timedelta(days=7)
        )
    )
    active_count = active_students.scalar()
    
    # Count modules and content
    module_count = await db.execute(select(func.count(Module.id)).where(Module.is_active == True))
    total_modules = module_count.scalar()
    
    content_count = await db.execute(
        select(func.count(ContentItem.id)).where(ContentItem.is_published == True)
    )
    total_content = content_count.scalar()
    
    # Count submissions
    submission_count = await db.execute(select(func.count(Submission.id)))
    total_submissions = submission_count.scalar()
    
    pending_count = await db.execute(
        select(func.count(Submission.id)).where(Submission.status == "pending")
    )
    pending_submissions = pending_count.scalar()
    
    return DashboardStats(
        total_students=total_students,
        active_students=active_count,
        total_modules=total_modules,
        total_content_items=total_content,
        total_submissions=total_submissions,
        pending_submissions=pending_submissions,
        average_progress=75.0  # TODO: Calculate actual progress
    )


# ================ REAL-TIME NOTIFICATIONS ================

async def notify_content_update(module_id: str, content_id: str):
    """Send real-time notification about content updates."""
    try:
        redis_client = await get_redis()
        message = {
            "type": "content_update",
            "module_id": str(module_id),
            "content_id": str(content_id),
            "timestamp": datetime.utcnow().isoformat()
        }
        await redis_client.publish("content_updates", str(message))
    except Exception as e:
        print(f"Error sending notification: {e}")


# ================ HEALTH CHECK ================

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.utcnow()}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "🌱 Renewable Energy Learning Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )