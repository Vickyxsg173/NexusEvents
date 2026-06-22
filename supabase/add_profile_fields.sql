-- Add new social fields and username to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS instagram TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS resume_url TEXT,
ADD COLUMN IF NOT EXISTS gender TEXT;

-- Create the "resumes" storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to resumes
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'resumes' );

-- Allow authenticated users to upload resumes
DROP POLICY IF EXISTS "Auth Upload Access" ON storage.objects;
CREATE POLICY "Auth Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'resumes' AND auth.role() = 'authenticated' );

-- Allow users to update their own resumes
DROP POLICY IF EXISTS "Auth Update Access" ON storage.objects;
CREATE POLICY "Auth Update Access" 
ON storage.objects FOR UPDATE 
WITH CHECK ( bucket_id = 'resumes' AND auth.role() = 'authenticated' );
