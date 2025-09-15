import os
import uuid
import aiofiles
from typing import Optional, Tuple
from datetime import datetime
from fastapi import HTTPException, UploadFile
from app.config import settings
import shutil


class LocalFileStorageService:
    """Handle file uploads and storage locally for development."""
    
    def __init__(self):
        self.storage_path = settings.local_storage_path
        self._ensure_directory_exists()
    
    def _ensure_directory_exists(self):
        """Create storage directory if it doesn't exist."""
        try:
            os.makedirs(self.storage_path, exist_ok=True)
            print(f"Storage directory ready: {self.storage_path}")
        except Exception as e:
            print(f"Error creating storage directory: {e}")
    
    def _validate_file(self, file: UploadFile) -> Tuple[bool, str]:
        """Validate file type and size."""
        # Check file size (if available)
        if hasattr(file, 'size') and file.size and file.size > settings.max_file_size * 1024 * 1024:
            return False, f"File size exceeds {settings.max_file_size}MB limit"
        
        # Check file extension
        if not file.filename:
            return False, "No filename provided"
            
        file_extension = file.filename.split('.')[-1].lower() if '.' in file.filename else ''
        if file_extension not in settings.allowed_file_types:
            return False, f"File type '{file_extension}' is not allowed"
        
        return True, "Valid"
    
    def _generate_file_path(self, original_filename: str, user_id: str, module_id: str) -> str:
        """Generate unique file path for storage."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = original_filename.split('.')[-1] if '.' in original_filename else ''
        unique_filename = f"{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # Create subdirectory structure
        subdirectory = os.path.join(self.storage_path, module_id[:8])
        os.makedirs(subdirectory, exist_ok=True)
        
        return os.path.join(subdirectory, unique_filename)
    
    async def upload_file(self, file: UploadFile, user_id: str, module_id: str) -> dict:
        """Upload file to local storage."""
        try:
            # Validate file
            is_valid, message = self._validate_file(file)
            if not is_valid:
                raise HTTPException(status_code=400, detail=message)
            
            # Generate file path
            file_path = self._generate_file_path(file.filename, user_id, module_id)
            
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                # Read file in chunks to handle large files
                while content := await file.read(1024):
                    await f.write(content)
            
            # Get file size
            file_size = os.path.getsize(file_path)
            
            # Generate file URL (relative to storage path)
            relative_path = os.path.relpath(file_path, self.storage_path)
            file_url = f"/uploads/{relative_path.replace(os.sep, '/')}"
            
            return {
                "file_name": file.filename,
                "file_path": file_path,
                "file_url": file_url,
                "file_size": file_size,
                "mime_type": file.content_type or "application/octet-stream"
            }
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")
    
    async def delete_file(self, file_path: str) -> bool:
        """Delete file from local storage."""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            print(f"Error deleting file {file_path}: {e}")
            return False
    
    def get_file_url(self, file_path: str) -> str:
        """Get public URL for file."""
        if not file_path:
            return ""
        
        # Convert absolute path to relative URL
        if os.path.isabs(file_path):
            relative_path = os.path.relpath(file_path, self.storage_path)
            return f"/uploads/{relative_path.replace(os.sep, '/')}"
        return file_path


# Global storage service instance
def get_storage_service():
    """Get the appropriate storage service based on configuration."""
    if settings.development_mode and settings.use_local_storage:
        return LocalFileStorageService()
    else:
        # For production, we would return MinioStorageService or S3StorageService
        return LocalFileStorageService()  # Fallback to local for now