-- Create portfolio_projects table (completely separate from projects/imóveis)
CREATE TABLE public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_pt TEXT NOT NULL,
  title_fr TEXT NOT NULL DEFAULT '',
  title_en TEXT NOT NULL DEFAULT '',
  title_de TEXT NOT NULL DEFAULT '',
  description_pt TEXT NOT NULL,
  description_fr TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '',
  description_de TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL,
  region TEXT NOT NULL,
  city TEXT,
  address TEXT,
  postal_code TEXT,
  property_type TEXT,
  operation_type TEXT DEFAULT 'sale',
  price NUMERIC,
  bedrooms INTEGER,
  bathrooms INTEGER,
  area_sqm NUMERIC,
  parking_spaces INTEGER,
  main_image TEXT,
  features JSONB DEFAULT '{}'::jsonb,
  tags TEXT[] DEFAULT '{}'::text[],
  video_url TEXT,
  virtual_tour_url TEXT,
  map_embed_url TEXT,
  map_latitude NUMERIC,
  map_longitude NUMERIC,
  json_ld JSONB,
  status TEXT DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID
);

-- Create portfolio_images table
CREATE TABLE public.portfolio_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES public.portfolio_projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolio_projects
CREATE POLICY "Anyone can view active portfolio projects"
ON public.portfolio_projects
FOR SELECT
USING (status = 'active' OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Admins and editors can insert portfolio projects"
ON public.portfolio_projects
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins and editors can update portfolio projects"
ON public.portfolio_projects
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete portfolio projects"
ON public.portfolio_projects
FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- RLS Policies for portfolio_images
CREATE POLICY "Anyone can view portfolio images"
ON public.portfolio_images
FOR SELECT
USING (true);

CREATE POLICY "Admins and editors can insert portfolio images"
ON public.portfolio_images
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins and editors can delete portfolio images"
ON public.portfolio_images
FOR DELETE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor') OR has_role(auth.uid(), 'super_admin'));

-- Create indexes for performance
CREATE INDEX idx_portfolio_projects_status ON public.portfolio_projects(status);
CREATE INDEX idx_portfolio_projects_featured ON public.portfolio_projects(featured);
CREATE INDEX idx_portfolio_projects_region ON public.portfolio_projects(region);
CREATE INDEX idx_portfolio_projects_tags ON public.portfolio_projects USING GIN(tags);
CREATE INDEX idx_portfolio_images_portfolio_id ON public.portfolio_images(portfolio_id);

-- Add trigger for updated_at
CREATE TRIGGER update_portfolio_projects_updated_at
BEFORE UPDATE ON public.portfolio_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();