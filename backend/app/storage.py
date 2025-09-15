import os
import uuid
import aiofiles
from typing import Optional, Tuple
from datetime import datetime, timedelta
from minio import Minio
from minio.error import S3Error
from fastapi import HTTPException, UploadFile
from app.config import settings
import magic
import hashlib


class FileStorageService:
    """Handle file uploads and storage with MinIO/S3."""
    
    def __init__(self):
        self.client = Minio(
            settings.minio_endpoint,
            access_key=settings.minio_access_key,
            secret_key=settings.minio_secret_key,
            secure=settings.minio_secure
        )
        self.bucket_name = settings.minio_bucket_name
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist."""
        try:
            if not self.client.bucket_exists(self.bucket_name):
                self.client.make_bucket(self.bucket_name)
                print(f"Created bucket: {self.bucket_name}")
        except S3Error as e:
            print(f"Error creating bucket: {e}")
    
    def _validate_file(self, file: UploadFile) -> Tuple[bool, str]:
        """Validate file type and size."""
        # Check file size
        if file.size > settings.max_file_size * 1024 * 1024:  # Convert MB to bytes
            return False, f"File size exceeds {settings.max_file_size}MB limit"
        
        # Check file extension
        file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        if file_extension not in settings.allowed_file_types:
            return False, f"File type '{file_extension}' is not allowed"
        
        return True, "Valid"
    
    def _generate_file_path(self, original_filename: str, user_id: str, module_id: str) -> str:
        """Generate unique file path for storage."""
        file_extension = original_filename.split('.')[-1] if '.' in original_filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Organize files by date and module
        date_path = datetime.now().strftime("%Y/%m/%d")
        file_path = f"uploads/{date_path}/{module_id}/{user_id}/{unique_filename}"
        
        return file_path
    
    async def upload_file(
        self, 
        file: UploadFile, 
        user_id: str, 
        module_id: str,
        content_type: str = None
    ) -> dict:
        """Upload file to MinIO storage."""
        
        # Validate file
        is_valid, message = self._validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Generate file path
        file_path = self._generate_file_path(file.filename, user_id, module_id)
        
        try:
            # Read file content
            content = await file.read()
            
            # Detect MIME type
            mime_type = magic.from_buffer(content, mime=True)
            
            # Upload to MinIO
            self.client.put_object(
                self.bucket_name,
                file_path,
                data=content,
                length=len(content),
                content_type=mime_type or file.content_type
            )
            
            # Generate file URL
            file_url = self.get_file_url(file_path)
            
            # Calculate file hash for integrity
            file_hash = hashlib.md5(content).hexdigest()
            
            return {
                "file_path": file_path,
                "file_url": file_url,
                "file_name": file.filename,
                "file_size": len(content),
                "mime_type": mime_type,
                "file_hash": file_hash
            }
            
        except S3Error as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
    
    def get_file_url(self, file_path: str, expires_hours: int = 24) -> str:
        """Generate presigned URL for file access."""
        try:
            url = self.client.presigned_get_object(
                self.bucket_name,
                file_path,
                expires=timedelta(hours=expires_hours)
            )
            return url
        except S3Error as e:
            raise HTTPException(status_code=404, detail=f"File not found: {str(e)}")
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from storage."""
        try:
            self.client.remove_object(self.bucket_name, file_path)
            return True
        except S3Error as e:
            print(f"Error deleting file {file_path}: {e}")
            return False
    
    def file_exists(self, file_path: str) -> bool:
        """Check if file exists in storage."""
        try:
            self.client.stat_object(self.bucket_name, file_path)
            return True
        except S3Error:
            return False


# Global file storage service instance
file_storage = FileStorageService()


# Local file storage (alternative for development)
class LocalFileStorage:
    """Local file storage for development."""
    
    def __init__(self, upload_dir: str = "uploads"):
        self.upload_dir = upload_dir
        os.makedirs(upload_dir, exist_ok=True)
    
    async def upload_file(
        self, 
        file: UploadFile, 
        user_id: str, 
        module_id: str,
        content_type: str = None
    ) -> dict:
        """Upload file to local storage."""
        
        # Create directory structure
        date_path = datetime.now().strftime("%Y/%m/%d")
        upload_path = os.path.join(self.upload_dir, date_path, module_id, user_id)
        os.makedirs(upload_path, exist_ok=True)
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_path, unique_filename)
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            content = await file.read()
            await f.write(content)
        
        # Generate file URL (relative path)
        relative_path = os.path.relpath(file_path, self.upload_dir).replace('\\', '/')
        file_url = f"/files/{relative_path}"
        
        return {
            "file_path": file_path,
            "file_url": file_url,
            "file_name": file.filename,
            "file_size": len(content),
            "mime_type": file.content_type
        }


# Choose storage backend based on environment
def get_storage_service():
    """Get appropriate storage service based on configuration."""
    if settings.debug and not settings.minio_access_key:
        return LocalFileStorage()
    return file_storage