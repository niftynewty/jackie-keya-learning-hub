ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS certificate_template text NOT NULL DEFAULT 'heritage-curve'
  CHECK (certificate_template IN ('heritage-curve','linen-arch','terracotta-horizon','quiet-laurel','coffee-frame','renewal-ribbon','family-circle','editorial-seal','golden-path','modern-column'));

ALTER TABLE public.certificates
  ADD COLUMN IF NOT EXISTS template_id text NOT NULL DEFAULT 'heritage-curve'
  CHECK (template_id IN ('heritage-curve','linen-arch','terracotta-horizon','quiet-laurel','coffee-frame','renewal-ribbon','family-circle','editorial-seal','golden-path','modern-column'));

DROP POLICY IF EXISTS "Admins manage certificates" ON public.certificates;
CREATE POLICY "Admins manage certificates"
ON public.certificates
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.certificates TO authenticated;