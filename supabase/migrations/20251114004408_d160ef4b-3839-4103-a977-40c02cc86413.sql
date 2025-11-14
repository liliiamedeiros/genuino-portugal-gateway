-- Adicionar coluna 'features' do tipo JSONB para armazenar características dos imóveis
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{}'::jsonb;

-- Adicionar índice GIN para melhorar performance de busca em features
CREATE INDEX IF NOT EXISTS idx_projects_features ON projects USING gin(features);

-- Adicionar colunas para mapa
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS map_latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS map_longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS map_embed_url TEXT;

-- Adicionar índice geoespacial para coordenadas
CREATE INDEX IF NOT EXISTS idx_projects_location ON projects(map_latitude, map_longitude);

-- Comentários explicativos
COMMENT ON COLUMN projects.features IS 'Property features like air conditioning, balcony, terrace, garage, garden, pool, storage, adapted, floors, multimedia, floor plan (JSON)';
COMMENT ON COLUMN projects.map_latitude IS 'Property latitude coordinate for map display';
COMMENT ON COLUMN projects.map_longitude IS 'Property longitude coordinate for map display';
COMMENT ON COLUMN projects.map_embed_url IS 'Google Maps or other map embed iframe URL';