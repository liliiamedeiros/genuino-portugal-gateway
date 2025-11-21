-- Create navigation menus table for dynamic menu management
CREATE TABLE navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_type TEXT NOT NULL CHECK (menu_type IN ('main', 'footer', 'admin')),
  label JSONB NOT NULL,
  path TEXT NOT NULL,
  icon_name TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  parent_id UUID REFERENCES navigation_menus(id) ON DELETE CASCADE,
  target TEXT DEFAULT '_self' CHECK (target IN ('_self', '_blank')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_navigation_menus_type ON navigation_menus(menu_type);
CREATE INDEX idx_navigation_menus_active ON navigation_menus(is_active);
CREATE INDEX idx_navigation_menus_order ON navigation_menus(order_index);

-- Enable RLS
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;

-- Anyone can view active menu items
CREATE POLICY "Anyone can view active menu items"
  ON navigation_menus FOR SELECT
  USING (is_active = true);

-- Admins can manage all menu items
CREATE POLICY "Admins can manage menu items"
  ON navigation_menus FOR ALL
  USING (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'super_admin'::app_role)
  );

-- Trigger for updated_at
CREATE TRIGGER update_navigation_menus_updated_at
  BEFORE UPDATE ON navigation_menus
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Populate with existing menu items
INSERT INTO navigation_menus (menu_type, label, path, order_index) VALUES
  ('main', '{"pt": "Início", "en": "Home", "fr": "Accueil", "de": "Startseite"}'::jsonb, '/', 0),
  ('main', '{"pt": "Sobre Nós", "en": "About", "fr": "À Propos", "de": "Über Uns"}'::jsonb, '/about', 1),
  ('main', '{"pt": "Serviços", "en": "Services", "fr": "Services", "de": "Dienstleistungen"}'::jsonb, '/services', 2),
  ('main', '{"pt": "Portfolio", "en": "Portfolio", "fr": "Portfolio", "de": "Portfolio"}'::jsonb, '/portfolio', 3),
  ('main', '{"pt": "Imóveis", "en": "Properties", "fr": "Propriétés", "de": "Immobilien"}'::jsonb, '/properties', 4),
  ('main', '{"pt": "Visão", "en": "Vision", "fr": "Vision", "de": "Vision"}'::jsonb, '/vision', 5),
  ('main', '{"pt": "Investidores", "en": "Investors", "fr": "Investisseurs", "de": "Investoren"}'::jsonb, '/investors', 6),
  ('main', '{"pt": "Contacto", "en": "Contact", "fr": "Contact", "de": "Kontakt"}'::jsonb, '/contact', 7);