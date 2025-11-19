-- Adicionar coluna tags como array de texto
ALTER TABLE projects ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Criar índice GIN para buscas rápidas em arrays
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING GIN(tags);

-- Comentário para documentação
COMMENT ON COLUMN projects.tags IS 'Array de tags/características do imóvel (ex: piscina, garagem, vista-mar)';