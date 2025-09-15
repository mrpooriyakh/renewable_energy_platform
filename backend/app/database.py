from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import redis.asyncio as redis
from app.config import settings

# Async Database Engine
async_engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,
    future=True
)

# Sync Database Engine (for Alembic migrations)
sync_engine = create_engine(
    settings.database_url_sync,
    echo=settings.debug
)

# Session makers
AsyncSessionLocal = async_sessionmaker(
    bind=async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

SessionLocal = sessionmaker(
    bind=sync_engine,
    autocommit=False,
    autoflush=False
)

# Base class for models
Base = declarative_base()

# Redis connection (optional for local development)
async def get_redis():
    try:
        return redis.from_url(settings.redis_url, decode_responses=True)
    except Exception as e:
        print(f"Redis connection failed: {e}. Running without Redis for local development.")
        return None

# Async database dependency
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Sync database dependency (for migrations)
def get_sync_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()