# Renewable Energy Learning Platform

A simple learning management system built with React and Supabase.

## Features

- **Authentication**: Role-based login system
- **Teacher Admin Panel**: Upload content with title, description, and files
- **Student Portal**: View and download uploaded content
- **Real-time Updates**: Content appears instantly when uploaded
- **File Management**: Support for various file types

## Demo Credentials

- **Student**: `admin` / `admin`
- **Teacher**: `admin1` / `admin1`

## Quick Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Run development server: `npm run dev`

## Database Schema

The application requires a `content` table in Supabase with the following structure:

```sql
CREATE TABLE content (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  file_url text,
  file_name text,
  uploaded_by text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read
CREATE POLICY "Allow read access" ON content FOR SELECT USING (true);

-- Allow all authenticated users to insert
CREATE POLICY "Allow insert access" ON content FOR INSERT WITH CHECK (true);

-- Allow users to delete their own content
CREATE POLICY "Allow delete own content" ON content FOR DELETE USING (uploaded_by = auth.email());
```

## Storage Setup

1. Create a storage bucket named `content-files` in Supabase
2. Set bucket to public
3. Enable the following policies:
   - Allow authenticated users to upload
   - Allow public access to download

## Deployment

The application is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will deploy automatically.

## Technology Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Supabase (Database + Authentication + Storage)
- **Deployment**: Vercel
