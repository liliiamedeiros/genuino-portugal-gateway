-- 1. push_subscriptions: remove the (user_id IS NULL) loophole
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Users can delete own subscriptions" ON public.push_subscriptions;

CREATE POLICY "Users can view own subscriptions"
  ON public.push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own subscriptions"
  ON public.push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Tighten INSERT to require user_id matches caller
DROP POLICY IF EXISTS "Authenticated users can subscribe" ON public.push_subscriptions;
CREATE POLICY "Authenticated users can subscribe"
  ON public.push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- 2. user_roles: prevent admins from escalating to admin/super_admin
DROP POLICY IF EXISTS "Admins can manage editor roles" ON public.user_roles;

CREATE POLICY "Admins can view editor roles"
  ON public.user_roles FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) AND role = 'editor'::app_role);

CREATE POLICY "Admins can insert editor roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND role = 'editor'::app_role);

CREATE POLICY "Admins can update editor roles"
  ON public.user_roles FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) AND role = 'editor'::app_role)
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) AND role = 'editor'::app_role);

CREATE POLICY "Admins can delete editor roles"
  ON public.user_roles FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) AND role = 'editor'::app_role);

-- 3. profiles: restrict SELECT to authenticated users only (no anon enumeration)
-- Existing policies already restrict to own profile or admins; ensure no permissive "true" policy exists
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 4. newsletter_subscribers: validate email format on insert
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe"
  ON public.newsletter_subscribers FOR INSERT
  WITH CHECK (
    email IS NOT NULL
    AND length(email) BETWEEN 5 AND 320
    AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    AND (full_name IS NULL OR length(full_name) <= 200)
  );

-- 5. Restrict storage object listing on the public 'project-images' bucket
-- Public bucket still allows direct file downloads via public URL, but listing
-- is restricted to authenticated staff to prevent enumeration of all assets.
DROP POLICY IF EXISTS "Public can list project-images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view project-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

CREATE POLICY "Staff can list project-images"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'project-images'
    AND (
      has_role(auth.uid(), 'admin'::app_role)
      OR has_role(auth.uid(), 'super_admin'::app_role)
      OR has_role(auth.uid(), 'editor'::app_role)
    )
  );