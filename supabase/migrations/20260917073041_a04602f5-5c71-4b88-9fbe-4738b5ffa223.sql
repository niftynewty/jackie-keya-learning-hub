CREATE TYPE public.course_category AS ENUM ('fresh_start', 'blended_family');
CREATE TYPE public.enrollment_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE public.payment_provider AS ENUM ('paystack', 'mpesa_direct');
CREATE TYPE public.payment_status AS ENUM ('pending', 'successful', 'failed');

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT '',
  avatar_url text,
  phone text,
  email_notifications boolean NOT NULL DEFAULT true,
  learning_reminders boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Students create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Students update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_profile_for_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(COALESCE(NEW.email, ''), '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER create_profile_after_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_new_user();

CREATE TABLE public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  short_description text NOT NULL,
  description text NOT NULL,
  outcome text NOT NULL,
  audience text NOT NULL,
  category public.course_category NOT NULL,
  thumbnail_url text,
  price_kes integer NOT NULL CHECK (price_kes >= 0),
  original_price_kes integer CHECK (original_price_kes IS NULL OR original_price_kes >= price_kes),
  duration_minutes integer NOT NULL DEFAULT 0 CHECK (duration_minutes >= 0),
  access_days integer NOT NULL DEFAULT 42 CHECK (access_days > 0),
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published courses are public" ON public.courses FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.modules TO anon, authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published course modules are public" ON public.modules FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.is_published));
CREATE TRIGGER modules_updated_at BEFORE UPDATE ON public.modules FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  bunny_video_id text,
  duration_seconds integer NOT NULL DEFAULT 0 CHECK (duration_seconds >= 0),
  is_preview boolean NOT NULL DEFAULT false,
  resource_label text,
  resource_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.lessons TO anon, authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published course lessons are public" ON public.lessons FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.modules m JOIN public.courses c ON c.id = m.course_id WHERE m.id = module_id AND c.is_published));
CREATE TRIGGER lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '42 days'),
  status public.enrollment_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT, INSERT, UPDATE ON public.enrollments TO authenticated;
GRANT ALL ON public.enrollments TO service_role;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own enrollments" ON public.enrollments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Students create own simulated enrollments" ON public.enrollments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update own enrollments" ON public.enrollments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON public.enrollments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.lesson_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  is_completed boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_position_seconds integer NOT NULL DEFAULT 0 CHECK (last_position_seconds >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own progress" ON public.lesson_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Students create own progress" ON public.lesson_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students update own progress" ON public.lesson_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Students delete own progress" ON public.lesson_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER lesson_progress_updated_at BEFORE UPDATE ON public.lesson_progress FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  amount integer NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'KES' CHECK (currency IN ('KES', 'USD')),
  provider public.payment_provider NOT NULL,
  provider_transaction_id text NOT NULL UNIQUE,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own payments" ON public.payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Students create own simulated payments" ON public.payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number text NOT NULL UNIQUE,
  recipient_name_formatted text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);
GRANT SELECT ON public.certificates TO authenticated;
GRANT ALL ON public.certificates TO service_role;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students view own certificates" ON public.certificates FOR SELECT TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.courses (id, title, slug, short_description, description, outcome, audience, category, price_kes, original_price_kes, duration_minutes, is_published) VALUES
('11111111-1111-4111-8111-111111111111', 'Healing a Heartbreak', 'healing-a-heartbreak', 'A compassionate path through grief, release, and renewal.', 'Move through heartbreak with grounded practices that honour what happened while helping you reconnect with yourself.', 'Feel steadier, understand your emotional patterns, and begin again without rushing your healing.', 'For anyone moving through a breakup, separation, divorce, or difficult emotional transition.', 'fresh_start', 4500, 5500, 123, true),
('22222222-2222-4222-8222-222222222222', 'Beginning Again', 'beginning-again', 'Rebuild confidence and create a meaningful next chapter.', 'A guided reset for people navigating life transitions and wanting practical support for a hopeful new beginning.', 'Turn uncertainty into a clear, gentle plan for your next season.', 'For anyone starting over after loss, change, relocation, or a major personal turning point.', 'fresh_start', 3800, NULL, 95, true),
('33333333-3333-4333-8333-333333333333', 'Blended Family Harmony', 'blended-family-harmony', 'Build trust, clarity, and connection in your blended home.', 'Learn how to navigate roles, expectations, boundaries, and communication with greater compassion and consistency.', 'Create a calmer family culture where every member can feel seen and secure.', 'For couples, biological parents, step-parents, and caregivers in blended families.', 'blended_family', 6000, 7500, 168, true),
('44444444-4444-4444-8444-444444444444', 'Step-Parenting with Wisdom', 'step-parenting-with-wisdom', 'Lead with warmth while protecting healthy boundaries.', 'Practical guidance for building relationships with stepchildren without losing yourself or competing for belonging.', 'Develop a confident, patient step-parenting approach that supports the whole family.', 'For new and experienced step-parents seeking clarity, connection, and sustainable boundaries.', 'blended_family', 4200, NULL, 110, true);

INSERT INTO public.modules (id, course_id, title, description, sort_order) VALUES
('a1111111-1111-4111-8111-111111111111','11111111-1111-4111-8111-111111111111','Understanding Heartbreak','Name what happened and why it hurts.',1),
('a1111111-1111-4111-8111-111111111112','11111111-1111-4111-8111-111111111111','Understanding Yourself','Reconnect with your needs and patterns.',2),
('a1111111-1111-4111-8111-111111111113','11111111-1111-4111-8111-111111111111','Moving Forward','Create space for the life ahead.',3),
('a3333333-3333-4333-8333-333333333331','33333333-3333-4333-8333-333333333333','Your New Family System','Understand roles, loyalties, and expectations.',1),
('a3333333-3333-4333-8333-333333333332','33333333-3333-4333-8333-333333333333','Boundaries that Build Trust','Set kind, consistent family boundaries.',2),
('a3333333-3333-4333-8333-333333333333','33333333-3333-4333-8333-333333333333','Communication and Repair','Navigate conflict and reconnect.',3),
('a2222222-2222-4222-8222-222222222221','22222222-2222-4222-8222-222222222222','Taking Stock','Meet this moment with honesty.',1),
('a4444444-4444-4444-8444-444444444441','44444444-4444-4444-8444-444444444444','The Step-Parent Role','Find your place without forcing closeness.',1);

INSERT INTO public.lessons (module_id, title, description, duration_seconds, is_preview, resource_label, sort_order) VALUES
('a1111111-1111-4111-8111-111111111111','Why Heartbreak Feels Physical','Understand the emotional and bodily experience of loss.',1080,true,'Reflection guide',1),
('a1111111-1111-4111-8111-111111111111','Making Room for Grief','Practise meeting difficult feelings safely.',1320,false,'Grief journal',2),
('a1111111-1111-4111-8111-111111111112','Patterns Without Shame','Notice repeating patterns with compassion.',1440,false,'Pattern map',1),
('a1111111-1111-4111-8111-111111111113','A Gentle Plan Forward','Choose small actions that support renewal.',1260,false,'Fresh start plan',1),
('a3333333-3333-4333-8333-333333333331','The Family You Are Building','See the new system clearly and compassionately.',1260,true,'Family map',1),
('a3333333-3333-4333-8333-333333333332','Clear and Kind Boundaries','Build consistency without rigidity.',1500,false,'Boundary worksheet',1),
('a3333333-3333-4333-8333-333333333333','Repair After Conflict','Use practical language to reconnect.',1380,false,'Repair conversation guide',1),
('a2222222-2222-4222-8222-222222222221','Where You Are Now','Create an honest starting point.',1200,true,'Life transition inventory',1),
('a4444444-4444-4444-8444-444444444441','Belonging Without Competition','Build connection at a sustainable pace.',1320,true,'Role clarity worksheet',1);