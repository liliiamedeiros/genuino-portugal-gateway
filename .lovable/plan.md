

# Plano: Fase 2 SEO - Modulo GEO

## Resumo

Implementar o modulo GEO (Generative Engine Optimization) com 3 funcionalidades principais: estrategia semantica, FAQs estruturadas e configuracao de entidades. Tambem corrigir o erro de build (PWA cache limit).

---

## Correcao do Build Error

O bundle JS principal excede 5MB. Aumentar `maximumFileSizeToCacheInBytes` para 6MB em `vite.config.ts`.

---

## Novas Tabelas (3 tabelas)

### `geo_semantic_strategies`
Estrategias semanticas para otimizacao GEO.
- `id` (uuid), `name` (text), `description` (text), `target_intent` (text - informational/transactional/navigational), `primary_keywords` (jsonb - array), `secondary_keywords` (jsonb - array), `entities` (jsonb - array of entity references), `response_structure` (text - como a IA deve estruturar respostas), `is_active` (bool), `order_index` (int), `created_at`, `updated_at`

### `geo_faqs`
FAQs estruturadas com Schema FAQ automatico.
- `id` (uuid), `strategy_id` (uuid FK nullable), `question` (jsonb - multilingual pt/en/fr/de), `answer` (jsonb - multilingual), `category` (text), `schema_enabled` (bool default true), `order_index` (int), `is_active` (bool), `page_reference` (text), `created_at`, `updated_at`

### `geo_entities`
Entidades principais do negocio para a IA reconhecer.
- `id` (uuid), `name` (text), `entity_type` (text - organization/person/product/service/place), `description` (text), `properties` (jsonb - atributos chave-valor), `same_as` (jsonb - array de URLs externas como Wikipedia, LinkedIn), `schema_type` (text - tipo Schema.org), `is_active` (bool), `order_index` (int), `created_at`, `updated_at`

RLS: admin/super_admin para gestao, editor para visualizacao.

---

## Nova Pagina: GEO Config (`/admin/seo/geo`)

Pagina com 3 tabs:

### Tab 1: Estrategia Semantica
- Lista de estrategias com CRUD
- Campos para keywords primarias/secundarias (tags input)
- Selector de intencao de busca
- Campo de estrutura de resposta

### Tab 2: FAQs Estruturadas
- Lista de FAQs com CRUD
- Campos multilingue (pt/en/fr/de)
- Toggle para Schema FAQ automatico
- Preview do JSON-LD gerado
- Associacao opcional a estrategia

### Tab 3: Entidades
- Lista de entidades com CRUD
- Tipo de entidade (Organization, Person, Product, etc.)
- Propriedades chave-valor dinamicas
- URLs "sameAs" (Wikipedia, LinkedIn, etc.)
- Preview do Schema.org gerado

---

## Ficheiros

| Ficheiro | Acao |
|----------|------|
| `src/pages/admin/SeoGeoModule.tsx` | Criar - pagina GEO com 3 tabs |
| `src/App.tsx` | Modificar - adicionar rota `/admin/seo/geo` |
| `src/components/admin/AdminLayout.tsx` | Modificar - adicionar sub-item "GEO" no menu SEO |
| `vite.config.ts` | Modificar - aumentar cache limit para 6MB |

---

## Detalhes Tecnicos

### Schema FAQ Preview
Gerar JSON-LD automaticamente a partir das FAQs:
```text
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [{ "@type": "Question", "name": "...", "acceptedAnswer": {...} }]
}
```

### Entity Schema Preview
Gerar Schema.org baseado no tipo de entidade selecionado.

### Tags Input
Reutilizar padrao existente para keywords (input com chips).

