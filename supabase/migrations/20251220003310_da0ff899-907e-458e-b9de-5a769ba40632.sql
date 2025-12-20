-- 1. Restringir activity_logs - apenas admins/super_admins podem ver
DROP POLICY IF EXISTS "Authenticated users can view logs" ON public.activity_logs;
CREATE POLICY "Admins can view activity logs" ON public.activity_logs
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 2. Restringir newsletter_subscribers - remover acesso de editores ao SELECT
DROP POLICY IF EXISTS "Admins and editors can view subscribers" ON public.newsletter_subscribers;
CREATE POLICY "Admins can view subscribers" ON public.newsletter_subscribers
FOR SELECT USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 3. Restringir newsletter_campaigns - remover acesso de editores
DROP POLICY IF EXISTS "All authenticated users can manage campaigns" ON public.newsletter_campaigns;
CREATE POLICY "Admins can manage campaigns" ON public.newsletter_campaigns
FOR ALL USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'super_admin'::app_role)
);

-- 4. Requerer autenticação para push_subscriptions INSERT
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.push_subscriptions;
CREATE POLICY "Authenticated users can subscribe" ON public.push_subscriptions
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);