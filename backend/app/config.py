from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    # Database - Default to SQLite for local development
    database_url: str = "sqlite+aiosqlite:///./renewable_energy.db"
    database_url_sync: str = "sqlite:///./renewable_energy.db"
    
    # Redis
    redis_url: str = "redis://localhost:6379/0"
    
    # Security
    secret_key: str = "change-this-super-secret-key-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # File Storage
    minio_endpoint: str = "localhost:9000"
    minio_access_key: str = "minioadmin"
    minio_secret_key: str = "minioadmin"
    minio_bucket_name: str = "renewable-energy-files"
    minio_secure: bool = False
    
    # AWS S3 (Alternative)
    aws_access_key_id: Optional[str] = None
    aws_secret_access_key: Optional[str] = None
    aws_region: str = "us-east-1"
    s3_bucket_name: str = "renewable-energy-files"
    
    # Application
    debug: bool = True
    cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004", 
        "http://localhost:5173",
        "https://renewable-energy-platform-n9g3.vercel.app"
    ]
    
    # Local development options
    development_mode: bool = True
    use_local_storage: bool = True
    local_storage_path: str = "./uploads"
    max_file_size: int = 50  # MB
    allowed_file_types: List[str] = [
        "pdf", "mp4", "mov", "avi", "wmv",
        "ppt", "pptx", "doc", "docx", 
        "txt", "md", "jpg", "jpeg", "png"
    ]
    
    # Celery
    celery_broker_url: str = "redis://localhost:6379/1"
    celery_result_backend: str = "redis://localhost:6379/1"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()