
-- Table: geo_semantic_strategies
CREATE TABLE public.geo_semantic_strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  target_intent text NOT NULL DEFAULT 'informational',
  primary_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  secondary_keywords jsonb NOT NULL DEFAULT '[]'::jsonb,
  entities jsonb NOT NULL DEFAULT '[]'::jsonb,
  response_structure text,
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: geo_faqs
CREATE TABLE public.geo_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  strategy_id uuid REFERENCES public.geo_semantic_strategies(id) ON DELETE SET NULL,
  question jsonb NOT NULL DEFAULT '{}'::jsonb,
  answer jsonb NOT NULL DEFAULT '{}'::jsonb,
  category text,
  schema_enabled boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  page_reference text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Table: geo_entities
CREATE TABLE public.geo_entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  entity_type text NOT NULL DEFAULT 'organization',
  description text,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  same_as jsonb NOT NULL DEFAULT '[]'::jsonb,
  schema_type text NOT NULL DEFAULT 'Organization',
  is_active boolean NOT NULL DEFAULT true,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS for geo_semantic_strategies
ALTER TABLE public.geo_semantic_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage geo_semantic_strategies" ON public.geo_semantic_strategies FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Editors can view geo_semantic_strategies" ON public.geo_semantic_strategies FOR SELECT USING (has_role(auth.uid(), 'editor'::app_role));

-- RLS for geo_faqs
ALTER TABLE public.geo_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage geo_faqs" ON public.geo_faqs FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Editors can view geo_faqs" ON public.geo_faqs FOR SELECT USING (has_role(auth.uid(), 'editor'::app_role));

-- RLS for geo_entities
ALTER TABLE public.geo_entities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage geo_entities" ON public.geo_entities FOR ALL USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));
CREATE POLICY "Editors can view geo_entities" ON public.geo_entities FOR SELECT USING (has_role(auth.uid(), 'editor'::app_role));
