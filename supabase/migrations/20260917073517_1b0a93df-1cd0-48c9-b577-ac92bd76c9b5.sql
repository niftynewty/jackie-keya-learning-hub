CREATE POLICY "Students create earned certificates"
ON public.certificates
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.enrollments e
    WHERE e.user_id = auth.uid()
      AND e.course_id = certificates.course_id
      AND e.status = 'active'
      AND e.expires_at > now()
  )
  AND NOT EXISTS (
    SELECT 1
    FROM public.lessons l
    JOIN public.modules m ON m.id = l.module_id
    WHERE m.course_id = certificates.course_id
      AND NOT EXISTS (
        SELECT 1
        FROM public.lesson_progress lp
        WHERE lp.lesson_id = l.id
          AND lp.user_id = auth.uid()
          AND lp.is_completed = true
      )
  )
);