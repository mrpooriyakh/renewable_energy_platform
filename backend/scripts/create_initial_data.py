#!/usr/bin/env python3
"""
Create initial data for the Renewable Energy Platform.
This script creates default users, modules, and sample content.
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import User, Module, ContentItem, UserRole, ContentType
from app.auth import get_password_hash


async def create_initial_users():
    """Create initial users (admin and student accounts)."""
    print("Creating initial users...")
    
    async with AsyncSessionLocal() as db:
        # Check if users already exist
        result = await db.execute(select(User).where(User.username.in_(["admin", "admin1"])))
        existing_users = result.scalars().all()
        
        if existing_users:
            print("Users already exist, skipping user creation")
            return
        
        # Create student user (admin/admin)
        student_user = User(
            username="admin",
            full_name="Student User",
            email="student@example.com",
            hashed_password=get_password_hash("admin"),
            role=UserRole.STUDENT,
            student_id="ST2024001",
            department="Engineering",
            year=3,
            is_active=True
        )
        
        # Create teacher user (admin1/admin1)
        teacher_user = User(
            username="admin1",
            full_name="Professor Smith",
            email="teacher@example.com",
            hashed_password=get_password_hash("admin1"),
            role=UserRole.TEACHER,
            department="Renewable Energy Department",
            is_active=True
        )
        
        db.add(student_user)
        db.add(teacher_user)
        await db.commit()
        
        print("Created initial users:")
        print("   - Student: admin/admin")
        print("   - Teacher: admin1/admin1")


async def create_initial_modules():
    """Create initial renewable energy modules."""
    print("Creating initial modules...")
    
    async with AsyncSessionLocal() as db:
        # Check if modules already exist
        result = await db.execute(select(Module))
        existing_modules = result.scalars().all()
        
        if existing_modules:
            print("Modules already exist, skipping module creation")
            return
        
        # Get the teacher user
        result = await db.execute(select(User).where(User.username == "admin1"))
        teacher = result.scalar_one()
        
        modules_data = [
            {
                "title": "Solar PV",
                "description": "Photovoltaic Systems & Technology",
                "icon": "☀️",
                "color": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                "order_index": 1
            },
            {
                "title": "Wind Power",
                "description": "Wind Turbines & Energy Generation", 
                "icon": "💨",
                "color": "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                "order_index": 2
            },
            {
                "title": "Hydropower",
                "description": "Water-based Energy Systems",
                "icon": "💧", 
                "color": "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
                "order_index": 3
            },
            {
                "title": "Geothermal",
                "description": "Earth's Heat Energy Systems",
                "icon": "🌋",
                "color": "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
                "order_index": 4
            },
            {
                "title": "Solar Thermal", 
                "description": "Heat Collection & Storage Systems",
                "icon": "🔥",
                "color": "linear-gradient(135deg, #ea580c 0%, #c2410c 100%)",
                "order_index": 5
            }
        ]
        
        for module_data in modules_data:
            module = Module(
                title=module_data["title"],
                description=module_data["description"],
                icon=module_data["icon"],
                color=module_data["color"],
                order_index=module_data["order_index"],
                created_by_id=teacher.id,
                is_active=True
            )
            db.add(module)
        
        await db.commit()
        print(f"Created {len(modules_data)} initial modules")


async def create_sample_content():
    """Create sample content for each module."""
    print("Creating sample content...")
    
    async with AsyncSessionLocal() as db:
        # Check if content already exists
        result = await db.execute(select(ContentItem))
        existing_content = result.scalars().all()
        
        if existing_content:
            print("Content already exists, skipping content creation")
            return
        
        # Get teacher and modules
        result = await db.execute(select(User).where(User.username == "admin1"))
        teacher = result.scalar_one()
        
        result = await db.execute(select(Module).order_by(Module.order_index))
        modules = result.scalars().all()
        
        sample_content = {
            "Solar PV": [
                {
                    "title": "Introduction to Solar PV",
                    "description": "Basic concepts and principles of photovoltaic systems",
                    "content_type": ContentType.VIDEO,
                    "duration": "15 min",
                    "order_index": 1
                },
                {
                    "title": "Solar Energy Engineering Handbook",
                    "description": "Comprehensive guide to PV systems design and implementation",
                    "content_type": ContentType.TEXTBOOK,
                    "order_index": 2
                },
                {
                    "title": "Assignment 1: Solar Irradiance Calculation",
                    "description": "Calculate daily solar irradiance for your location",
                    "content_type": ContentType.ASSIGNMENT,
                    "instructions": "Use the provided formulas to calculate the daily solar irradiance for your geographic location. Consider factors like latitude, season, and atmospheric conditions.",
                    "due_date": datetime.utcnow() + timedelta(days=14),
                    "points": 100,
                    "order_index": 3
                },
                {
                    "title": "Quiz 1: PV Fundamentals",
                    "description": "Test your knowledge of solar PV basics",
                    "content_type": ContentType.QUIZ,
                    "points": 50,
                    "order_index": 4
                }
            ],
            "Wind Power": [
                {
                    "title": "Wind Energy Fundamentals", 
                    "description": "Basic principles of wind energy conversion",
                    "content_type": ContentType.VIDEO,
                    "duration": "18 min",
                    "order_index": 1
                },
                {
                    "title": "Wind Turbine Design Project",
                    "description": "Design a small wind turbine for residential use",
                    "content_type": ContentType.PROJECT,
                    "instructions": "Design a wind turbine suitable for residential use. Consider blade design, generator selection, and tower specifications.",
                    "points": 150,
                    "order_index": 2
                }
            ]
        }
        
        content_count = 0
        for module in modules:
            if module.title in sample_content:
                for content_data in sample_content[module.title]:
                    content_item = ContentItem(
                        title=content_data["title"],
                        description=content_data["description"],
                        content_type=content_data["content_type"],
                        duration=content_data.get("duration"),
                        instructions=content_data.get("instructions"),
                        due_date=content_data.get("due_date"),
                        points=content_data.get("points", 0),
                        order_index=content_data["order_index"],
                        module_id=module.id,
                        uploaded_by_id=teacher.id,
                        is_published=True
                    )
                    db.add(content_item)
                    content_count += 1
        
        await db.commit()
        print(f"Created {content_count} sample content items")


async def main():
    """Main function to create all initial data."""
    print("Initializing Renewable Energy Platform Database...")
    print("=" * 50)
    
    try:
        await create_initial_users()
        await create_initial_modules()
        await create_sample_content()
        
        print("=" * 50)
        print("Database initialization completed successfully!")
        print()
        print("Login Credentials:")
        print("   Student: admin / admin")
        print("   Teacher: admin1 / admin1")
        print()
        print("Your backend is ready!")
        
    except Exception as e:
        print(f"Error during initialization: {e}")
        raise


if __name__ == "__main__":
    asyncio.run(main())