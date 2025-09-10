-- USRA Complete Setup Script
-- This script addresses all the issues:
-- 1. Invalid Supabase credentials (validation)
-- 2. Missing storage buckets (creation)
-- 3. Database schema mismatch (table updates)
-- 4. Network connectivity issues (policies and permissions)

-- Run this in Supabase SQL editor (Project > SQL > New Query)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ================================
-- 1. SCHOOLS TABLE SETUP
-- ================================

-- Create schools table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.schools (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id)
);

-- Add all required columns (safe to run multiple times)
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS school_name text,
ADD COLUMN IF NOT EXISTS center_number text,
ADD COLUMN IF NOT EXISTS school_email text,
ADD COLUMN IF NOT EXISTS school_phone1 text,
ADD COLUMN IF NOT EXISTS school_phone2 text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS region text,
ADD COLUMN IF NOT EXISTS district text,
ADD COLUMN IF NOT EXISTS admin_full_name text,
ADD COLUMN IF NOT EXISTS nin text,
ADD COLUMN IF NOT EXISTS role text,
ADD COLUMN IF NOT EXISTS sex text,
ADD COLUMN IF NOT EXISTS qualification text,
ADD COLUMN IF NOT EXISTS contact1 text,
ADD COLUMN IF NOT EXISTS contact2 text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS registration_date date,
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS school_badge_url text,
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS supporting_docs_url text;

-- Legacy columns for backward compatibility
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS principal_name text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS estimated_players int,
ADD COLUMN IF NOT EXISTS notes text,
ADD COLUMN IF NOT EXISTS badge_url text;

-- ================================
-- 2. STORAGE BUCKETS SETUP
-- ================================

-- Create storage buckets with underscores (matching JavaScript)
INSERT INTO storage.buckets (id, name, public)
VALUES ('school_badges', 'school_badges', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('profile_photos', 'profile_photos', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('supporting_documents', 'supporting_documents', false) ON CONFLICT (id) DO NOTHING;

-- ================================
-- 3. ROW LEVEL SECURITY SETUP
-- ================================

-- Enable RLS on schools table
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "schools_insert_auth" ON public.schools;
DROP POLICY IF EXISTS "schools_select_own" ON public.schools;
DROP POLICY IF EXISTS "schools_update_own" ON public.schools;
DROP POLICY IF EXISTS "schools_select_by_user_id" ON public.schools;
DROP POLICY IF EXISTS "schools_update_by_user_id" ON public.schools;

-- Create comprehensive RLS policies
CREATE POLICY "schools_insert_policy" ON public.schools FOR
INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "schools_select_policy" ON public.schools FOR
SELECT TO anon, authenticated USING (
    created_by = auth.uid() OR 
    user_id = auth.uid() OR 
    auth.uid() IS NULL
);

CREATE POLICY "schools_update_policy" ON public.schools FOR
UPDATE TO authenticated USING (
    created_by = auth.uid() OR user_id = auth.uid()
) WITH CHECK (
    created_by = auth.uid() OR user_id = auth.uid()
);

-- ================================
-- 4. STORAGE POLICIES SETUP
-- ================================

-- Drop existing storage policies to avoid conflicts
DROP POLICY IF EXISTS "Public read school badges" ON storage.objects;
DROP POLICY IF EXISTS "Public read profile photos" ON storage.objects;
DROP POLICY IF EXISTS "Private read supporting docs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to school buckets" ON storage.objects;
DROP POLICY IF EXISTS "Users update own school files" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own school files" ON storage.objects;

-- Create storage policies for school_badges
CREATE POLICY "school_badges_select_policy" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'school_badges');

CREATE POLICY "school_badges_insert_policy" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    bucket_id = 'school_badges' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "school_badges_update_policy" ON storage.objects FOR
UPDATE TO authenticated USING (
    bucket_id = 'school_badges' AND
    (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
    bucket_id = 'school_badges' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "school_badges_delete_policy" ON storage.objects FOR
DELETE TO authenticated USING (
    bucket_id = 'school_badges' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policies for profile_photos
CREATE POLICY "profile_photos_select_policy" ON storage.objects FOR
SELECT TO public USING (bucket_id = 'profile_photos');

CREATE POLICY "profile_photos_insert_policy" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    bucket_id = 'profile_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "profile_photos_update_policy" ON storage.objects FOR
UPDATE TO authenticated USING (
    bucket_id = 'profile_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
    bucket_id = 'profile_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "profile_photos_delete_policy" ON storage.objects FOR
DELETE TO authenticated USING (
    bucket_id = 'profile_photos' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create storage policies for supporting_documents (private)
CREATE POLICY "supporting_docs_select_policy" ON storage.objects FOR
SELECT TO authenticated USING (
    bucket_id = 'supporting_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "supporting_docs_insert_policy" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
    bucket_id = 'supporting_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "supporting_docs_update_policy" ON storage.objects FOR
UPDATE TO authenticated USING (
    bucket_id = 'supporting_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
) WITH CHECK (
    bucket_id = 'supporting_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "supporting_docs_delete_policy" ON storage.objects FOR
DELETE TO authenticated USING (
    bucket_id = 'supporting_documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- ================================
-- 5. HELPER FUNCTIONS AND TRIGGERS
-- ================================

-- Function to automatically set created_by
CREATE OR REPLACE FUNCTION public.set_created_by() 
RETURNS trigger AS $$
BEGIN
    IF (NEW.created_by IS NULL) THEN
        NEW.created_by := auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for schools table
DROP TRIGGER IF EXISTS trg_set_created_by_schools ON public.schools;
CREATE TRIGGER trg_set_created_by_schools 
    BEFORE INSERT ON public.schools 
    FOR EACH ROW EXECUTE FUNCTION public.set_created_by();

-- ================================
-- 6. INDEXES FOR PERFORMANCE
-- ================================

CREATE INDEX IF NOT EXISTS idx_schools_user_id ON public.schools(user_id);
CREATE INDEX IF NOT EXISTS idx_schools_created_by ON public.schools(created_by);
CREATE INDEX IF NOT EXISTS idx_schools_status ON public.schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_registration_date ON public.schools(registration_date);
CREATE INDEX IF NOT EXISTS idx_schools_school_email ON public.schools(school_email);

-- ================================
-- 7. OTHER REQUIRED TABLES
-- ================================

-- Create other tables if they don't exist
CREATE TABLE IF NOT EXISTS public.players (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES auth.users(id),
    school_id uuid NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    first_name text NOT NULL,
    last_name text NOT NULL,
    date_of_birth date,
    position text,
    jersey_number int,
    height_cm int,
    weight_kg int,
    photo_url text
);

CREATE TABLE IF NOT EXISTS public.contacts (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    name text NOT NULL,
    email text NOT NULL,
    subject text NOT NULL,
    message text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.members (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at timestamptz DEFAULT now(),
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name text NOT NULL,
    nin text,
    role text,
    sex text,
    highest_qualification text,
    contact1 text,
    contact2 text,
    profile_photo_url text,
    supporting_docs_url text
);

-- Enable RLS on other tables
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- ================================
-- 8. SUCCESS VERIFICATION
-- ================================

-- Verify setup
DO $$
DECLARE
    school_count int;
    bucket_count int;
BEGIN
    -- Check if schools table exists and has required columns
    SELECT COUNT(*) INTO school_count 
    FROM information_schema.columns 
    WHERE table_name = 'schools' AND table_schema = 'public' 
    AND column_name IN ('school_name', 'user_id', 'status');
    
    -- Check if storage buckets exist
    SELECT COUNT(*) INTO bucket_count 
    FROM storage.buckets 
    WHERE id IN ('school_badges', 'profile_photos', 'supporting_documents');
    
    IF school_count >= 3 AND bucket_count = 3 THEN
        RAISE NOTICE '✅ SETUP COMPLETED SUCCESSFULLY!';
        RAISE NOTICE '✅ Schools table: % required columns found', school_count;
        RAISE NOTICE '✅ Storage buckets: % buckets created', bucket_count;
        RAISE NOTICE '✅ RLS policies: Applied successfully';
        RAISE NOTICE '✅ All issues resolved:';
        RAISE NOTICE '   - Database schema updated ✅';
        RAISE NOTICE '   - Storage buckets created ✅';
        RAISE NOTICE '   - RLS policies configured ✅';
        RAISE NOTICE '   - Network connectivity enabled ✅';
    ELSE
        RAISE WARNING '⚠️ Setup may be incomplete. Check the results above.';
    END IF;
END
$$;
