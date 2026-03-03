
-- Enums for SEO system
CREATE TYPE public.seo_field_type AS ENUM (
  'text', 'textarea', 'wysiwyg', 'toggle', 'upload', 
  'html_code', 'json_ld', 'number', 'url', 'domain', 'api_integration'
);

CREATE TYPE public.seo_impact_level AS ENUM ('low', 'medium', 'high');

CREATE TYPE public.seo_response_status AS ENUM ('complete', 'incomplete', 'critical');

CREATE TYPE public.seo_rule_operator AS ENUM (
  'lt', 'gt', 'eq', 'contains', 'not_exists', 'length_lt', 'length_gt'
);

CREATE TYPE public.seo_rule_result AS ENUM ('needs_improvement', 'critical', 'warning');

-- 1. seo_stages
CREATE TABLE public.seo_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  importance_weight numeric NOT NULL DEFAULT 1,
  min_completion_pct numeric NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT true,
  requires_previous_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_stages" ON public.seo_stages
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Editors can view seo_stages" ON public.seo_stages
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_seo_stages_updated_at
  BEFORE UPDATE ON public.seo_stages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. seo_questions
CREATE TABLE public.seo_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id uuid NOT NULL REFERENCES public.seo_stages(id) ON DELETE CASCADE,
  label text NOT NULL,
  description text,
  field_type seo_field_type NOT NULL DEFAULT 'text',
  is_required boolean NOT NULL DEFAULT false,
  weight numeric NOT NULL DEFAULT 1,
  seo_impact seo_impact_level NOT NULL DEFAULT 'medium',
  min_chars integer,
  max_chars integer,
  validation_regex text,
  error_message text,
  success_message text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  applies_to jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_questions" ON public.seo_questions
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Editors can view seo_questions" ON public.seo_questions
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_seo_questions_updated_at
  BEFORE UPDATE ON public.seo_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3. seo_responses
CREATE TABLE public.seo_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid NOT NULL REFERENCES public.seo_questions(id) ON DELETE CASCADE,
  page_reference text NOT NULL DEFAULT '',
  value jsonb,
  status seo_response_status NOT NULL DEFAULT 'incomplete',
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(question_id, page_reference)
);

ALTER TABLE public.seo_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_responses" ON public.seo_responses
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Editors can manage seo_responses" ON public.seo_responses
  FOR ALL USING (public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_seo_responses_updated_at
  BEFORE UPDATE ON public.seo_responses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. seo_rules
CREATE TABLE public.seo_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  condition_field text NOT NULL,
  condition_operator seo_rule_operator NOT NULL DEFAULT 'eq',
  condition_value text NOT NULL DEFAULT '',
  result_status seo_rule_result NOT NULL DEFAULT 'warning',
  result_message text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_rules" ON public.seo_rules
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Editors can view seo_rules" ON public.seo_rules
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));

-- 5. seo_config
CREATE TABLE public.seo_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text NOT NULL DEFAULT 'general',
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seo_config" ON public.seo_config
  FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Editors can view seo_config" ON public.seo_config
  FOR SELECT USING (public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER update_seo_config_updated_at
  BEFORE UPDATE ON public.seo_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. seo_history
CREATE TABLE public.seo_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  action text NOT NULL,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.seo_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view seo_history" ON public.seo_history
  FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Authenticated can insert seo_history" ON public.seo_history
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
