-- ====================================
-- SECURITY FIXES - CRITICAL
-- ====================================

-- Fix 1: Secure profiles table - users can only view their own profile
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create restrictive policy - users can only see their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- ====================================
-- Note: Other security fixes (translate-property edge function 
-- and Contact form) will be handled in code changes
-- ====================================