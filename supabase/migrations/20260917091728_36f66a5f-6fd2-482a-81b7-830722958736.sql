ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS headline text,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS city text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Africa/Nairobi',
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS pronouns text,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS life_stage text,
  ADD COLUMN IF NOT EXISTS relationship_status text,
  ADD COLUMN IF NOT EXISTS family_situation text,
  ADD COLUMN IF NOT EXISTS focus_areas text[] NOT NULL DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS goals text,
  ADD COLUMN IF NOT EXISTS referral_source text,
  ADD COLUMN IF NOT EXISTS whatsapp text,
  ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS preferred_contact text NOT NULL DEFAULT 'email',
  ADD COLUMN IF NOT EXISTS support_person_name text,
  ADD COLUMN IF NOT EXISTS support_person_phone text,
  ADD COLUMN IF NOT EXISTS sms_notifications boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS weekly_digest boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS reminder_time text NOT NULL DEFAULT 'evening',
  ADD COLUMN IF NOT EXISTS marketing_opt_in boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS profile_visibility text NOT NULL DEFAULT 'private',
  ADD COLUMN IF NOT EXISTS last_active_at timestamptz,
  ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.touch_profile_activity()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.profiles
     SET last_active_at = now(),
         login_count = login_count + 1
   WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION public.touch_profile_activity() FROM public;
GRANT EXECUTE ON FUNCTION public.touch_profile_activity() TO authenticated;

CREATE POLICY "Students read own avatars" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Students upload own avatars" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Students update own avatars" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Students delete own avatars" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);