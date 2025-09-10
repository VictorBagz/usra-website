-- USRA Schools Table Update Script
-- Run this in Supabase SQL editor to add missing columns
-- This script is safe to run multiple times (uses IF NOT EXISTS)

-- Add all missing columns to the schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_name text,
ADD COLUMN IF NOT EXISTS school_phone1 text,
ADD COLUMN IF NOT EXISTS school_phone2 text,
ADD COLUMN IF NOT EXISTS admin_full_name text,
ADD COLUMN IF NOT EXISTS nin text,
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS sex text,
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS registration_date date,
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS school_badge_url text,
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS supporting_docs_url text;

-- Update existing columns to match JavaScript expectations
-- Note: The existing columns (name, email, phone, etc.) are kept for backward compatibility
-- The JavaScript code will use the new column names

-- Create storage buckets with underscores to match JavaScript code
INSERT INTO storage.buckets (id, name, public)
VALUES ('school_badges', 'school_badges', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_photos', 'profile_photos', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('supporting_documents', 'supporting_documents', false) ON CONFLICT (id) DO NOTHING;

-- Remove old bucket policies if they exist (for buckets with hyphens)
DROP POLICY IF EXISTS "Public read badges" ON storage.objects;
DROP POLICY IF EXISTS "Public read profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to own folders" ON storage.objects;
DROP POLICY IF EXISTS "Users update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own files" ON storage.objects;

-- Create new storage policies for buckets with underscores
CREATE POLICY "Public read school badges" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'school_badges');

CREATE POLICY "Public read profile photos" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'profile_photos');

CREATE POLICY "Private read supporting docs" ON storage.objects FOR
SELECT TO authenticated USING (
    bucket_id = 'supporting_documents' 
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload to school buckets" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    bucket_id IN ('school_badges', 'profile_photos', 'supporting_documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users update own school files" ON storage.objects FOR
UPDATE TO authenticated USING (
    bucket_id IN ('school_badges', 'profile_photos', 'supporting_documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
    bucket_id IN ('school_badges', 'profile_photos', 'supporting_documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own school files" ON storage.objects FOR
DELETE TO authenticated USING (
    bucket_id IN ('school_badges', 'profile_photos', 'supporting_documents')
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Add index for better performance on user_id lookups
CREATE INDEX IF NOT EXISTS idx_schools_user_id ON public.schools(user_id);
CREATE INDEX IF NOT EXISTS idx_schools_status ON public.schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_registration_date ON public.schools(registration_date);

-- Update RLS policies to include user_id column access
CREATE POLICY IF NOT EXISTS "schools_select_by_user_id" ON public.schools FOR
SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "schools_update_by_user_id" ON public.schools FOR
UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Verify the table structure (optional - for debugging)
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'schools' AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Schools table update completed successfully!';
    RAISE NOTICE 'All required columns have been added.';
    RAISE NOTICE 'Storage buckets created: school_badges, profile_photos, supporting_documents';
    RAISE NOTICE 'RLS policies updated for new structure.';
END
$$;
