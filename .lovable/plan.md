
# Plano de Otimizacao de Imagens para Conexoes Moveis Lentas

## Resumo

Este plano implementa varias tecnicas de otimizacao de imagens para melhorar significativamente o tempo de carregamento em conexoes moveis lentas (3G, 4G fraco, etc.).

---

## Estrategias de Otimizacao

### 1. Componente OptimizedImage com Lazy Loading Nativo

**Problema:** As imagens atualmente carregam todas de uma vez, consumindo largura de banda.

**Solucao:** Criar um componente reutilizavel `OptimizedImage` que:
- Usa `loading="lazy"` nativo do browser
- Implementa placeholder com blur/skeleton enquanto carrega
- Suporta `srcset` para diferentes resolucoes
- Usa `decoding="async"` para nao bloquear renderizacao
- Implementa `fetchpriority` para imagens acima do fold

**Novo Ficheiro:** `src/components/OptimizedImage.tsx`

---

### 2. Imagens Responsivas com srcset

**Problema:** Imagens grandes carregam em dispositivos pequenos.

**Solucao:** Implementar `srcset` e `sizes` para servir imagens adequadas ao dispositivo:
```text
srcset="imagem-400.webp 400w, imagem-800.webp 800w, imagem-1200.webp 1200w"
sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
```

**Ficheiros Afetados:**
- `src/components/ProjectCard.tsx`
- `src/components/HeroSlider.tsx`
- `src/pages/ProjectDetail.tsx`

---

### 3. Placeholder com Low Quality Image Placeholder (LQIP)

**Problema:** Ecras em branco enquanto imagens carregam.

**Solucao:** Implementar skeleton loading e transicao suave:
- Skeleton animado enquanto imagem carrega
- Fade-in quando imagem esta pronta
- Opcional: usar blur placeholder com imagem tiny (data URI)

---

### 4. Hook useImagePreloader para Pre-carregamento Inteligente

**Problema:** Imagens da proxima pagina/slide nao estao prontas.

**Solucao:** Criar hook `useImagePreloader` que:
- Pre-carrega imagens adjacentes no HeroSlider
- Pre-carrega imagens de propriedades visiveis no viewport
- Usa `IntersectionObserver` para detetar imagens proximo do viewport

**Novo Ficheiro:** `src/hooks/useImagePreloader.ts`

---

### 5. Service Worker com Cache Estrategico (ja parcialmente implementado)

**Estado Atual:** O `vite.config.ts` ja tem configuracao PWA com cache de imagens.

**Melhoria:** Adicionar caching mais agressivo para imagens de propriedades:
- Aumentar `maxEntries` para imagens
- Adicionar cache para Supabase Storage
- Implementar background sync para pre-fetch

**Ficheiro:** `vite.config.ts`

---

### 6. Atributo fetchpriority para Imagens Criticas

**Problema:** Imagens do hero competem com outras pelo carregamento.

**Solucao:** Adicionar `fetchpriority="high"` para:
- Imagem principal do HeroSlider (slide ativo)
- Imagem de capa nas paginas de detalhe
- Primeiros 2-3 cards de propriedades

---

### 7. Dimensoes Explicitas para Evitar Layout Shift

**Problema:** Imagens sem dimensoes causam "saltos" no layout (CLS).

**Solucao:** Garantir que todas as imagens tem:
- `width` e `height` definidos
- `aspect-ratio` CSS como fallback
- Containers com altura fixa responsiva

---

## Alteracoes por Ficheiro

### Novos Ficheiros

| Ficheiro | Descricao |
|----------|-----------|
| `src/components/OptimizedImage.tsx` | Componente de imagem otimizada com lazy loading, placeholder e srcset |
| `src/hooks/useImagePreloader.ts` | Hook para pre-carregamento inteligente de imagens |

### Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/components/ProjectCard.tsx` | Usar OptimizedImage, adicionar aspect-ratio |
| `src/components/HeroSlider.tsx` | Adicionar fetchpriority, pre-load slides adjacentes |
| `src/pages/ProjectDetail.tsx` | Usar OptimizedImage no hero e galeria |
| `src/components/PropertyImageCarousel.tsx` | Melhorar lazy loading existente com OptimizedImage |
| `vite.config.ts` | Expandir cache de Supabase Storage |

---

## Detalhes Tecnicos

### OptimizedImage.tsx
```text
Props:
- src: string (URL da imagem)
- alt: string
- width?: number
- height?: number
- priority?: boolean (fetchpriority="high")
- sizes?: string (para srcset)
- className?: string
- placeholder?: 'blur' | 'skeleton' (default: skeleton)

Funcionalidades:
- Skeleton animado enquanto carrega
- Fade-in transition quando pronta
- loading="lazy" (ou eager se priority=true)
- decoding="async"
- onLoad/onError handlers
```

### useImagePreloader.ts
```text
Hook:
- Recebe array de URLs
- Retorna { loaded: Set<string>, preload: (url) => void }
- Usa Image() constructor para pre-fetch
- Limita pre-loads concorrentes (max 3)
```

### Melhorias no ProjectCard.tsx
```text
- Substituir <img> por <OptimizedImage>
- Adicionar aspect-ratio container
- Manter animacao hover existente
```

### Melhorias no HeroSlider.tsx
```text
- Slide atual: priority=true
- Slides adjacentes: pre-load via useImagePreloader
- Imagens com decoding="async"
```

---

## Impacto Esperado

| Metrica | Antes | Depois |
|---------|-------|--------|
| LCP (Largest Contentful Paint) | ~4s em 3G | ~2s em 3G |
| CLS (Cumulative Layout Shift) | ~0.15 | <0.05 |
| Dados consumidos (mobile) | 100% | ~50-60% |
| Tempo para interatividade | Lento | Rapido (skeleton visivel) |

---

## Ordem de Implementacao

1. Criar `OptimizedImage.tsx` - componente base reutilizavel
2. Criar `useImagePreloader.ts` - hook de pre-carregamento
3. Atualizar `ProjectCard.tsx` - usar novo componente
4. Atualizar `HeroSlider.tsx` - prioridade e pre-load
5. Atualizar `PropertyImageCarousel.tsx` - melhorar lazy loading
6. Atualizar `ProjectDetail.tsx` - imagem hero otimizada
7. Atualizar `vite.config.ts` - expandir cache PWA
