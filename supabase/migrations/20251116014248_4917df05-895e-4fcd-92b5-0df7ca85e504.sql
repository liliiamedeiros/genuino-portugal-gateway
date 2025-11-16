-- Create function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create push_subscriptions table
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  language TEXT DEFAULT 'pt',
  topics JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe
CREATE POLICY "Anyone can subscribe"
  ON push_subscriptions
  FOR INSERT
  WITH CHECK (true);

-- Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can update own subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON push_subscriptions
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can delete own subscriptions
CREATE POLICY "Users can delete own subscriptions"
  ON push_subscriptions
  FOR DELETE
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
  ON push_subscriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role IN ('admin', 'super_admin')
    )
  );

-- Indexes for performance
CREATE INDEX idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX idx_push_subscriptions_language ON push_subscriptions(language);

-- Trigger for updated_at
CREATE TRIGGER update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();