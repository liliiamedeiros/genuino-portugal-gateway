

# Plano de Compressao Automatica de Imagens no Upload

## Resumo

Este plano implementa compressao automatica de imagens durante o upload em todos os formularios de administracao, garantindo que todas as imagens sejam otimizadas antes de serem armazenadas.

---

## Situacao Atual Analisada

### Testes de Navegacao Realizados
As imagens estao a carregar corretamente com:
- Skeleton placeholder animado enquanto carrega
- Transicao fade-in suave quando a imagem esta pronta
- Pre-carregamento inteligente de imagens adjacentes

### Conversao Existente
- **PropertyForm.tsx**: Ja converte para WebP durante upload (linha 399-408 e 473-498)
- **PortfolioForm.tsx**: Upload SEM conversao automatica (linha 195-209)
- **ImageConverter.tsx**: Conversor manual completo com opcoes avancadas

---

## Componentes a Criar/Modificar

### 1. Nova Utilidade: compressImage para Compressao Inteligente

Criar uma funcao que comprime automaticamente baseada no tamanho do ficheiro original:
- Ficheiros < 100KB: Sem compressao (ja pequenos)
- Ficheiros 100KB-500KB: Compressao leve (qualidade 90%)
- Ficheiros 500KB-2MB: Compressao media (qualidade 85%)
- Ficheiros > 2MB: Compressao agressiva (qualidade 75%)

**Novo Ficheiro:** `src/utils/autoCompressUtils.ts`

---

### 2. Hook: useAutoCompress

Hook reutilizavel que:
- Recebe um ficheiro File
- Retorna ficheiro comprimido + preview + estatisticas
- Mostra progresso de compressao
- Suporta cancelamento

**Novo Ficheiro:** `src/hooks/useAutoCompress.ts`

---

### 3. Componente: ImageDropzoneWithCompression

Melhoria do ImageDropzone existente para incluir:
- Compressao automatica apos selecao
- Indicador de progresso de compressao
- Badge mostrando economia de espaco
- Preview otimizado

**Ficheiro:** `src/components/admin/ImageDropzoneWithCompression.tsx` (novo)

---

### 4. Atualizar PortfolioForm

Adicionar conversao automatica para WebP durante o upload, similar ao PropertyForm:
- Compressao antes de upload
- Preview com imagem ja comprimida
- Estatisticas de economia

**Ficheiro:** `src/pages/admin/PortfolioForm.tsx`

---

### 5. Atualizar PropertyForm

Melhorar a compressao existente com:
- Compressao adaptativa baseada no tamanho
- Feedback visual durante compressao
- Opcao de manter qualidade original

**Ficheiro:** `src/pages/admin/PropertyForm.tsx`

---

## Detalhes Tecnicos

### autoCompressUtils.ts
```text
Interface AutoCompressOptions:
- maxWidth?: number (default: 1920)
- maxHeight?: number (default: 1080)
- quality?: 'auto' | number (default: 'auto')
- format?: 'webp' | 'jpeg' (default: 'webp')
- preserveExif?: boolean (default: false)

Funcao compressImage(file: File, options?: AutoCompressOptions):
- Retorna Promise<{ blob: Blob, savings: number, originalSize: number, newSize: number }>
- Compressao adaptativa baseada no tamanho
- Redimensiona se maior que maxWidth/maxHeight mantendo aspect ratio
```

### useAutoCompress.ts
```text
Hook retorna:
- compress: (file: File) => Promise<CompressResult>
- compressMultiple: (files: File[]) => Promise<CompressResult[]>
- isCompressing: boolean
- progress: { current: number, total: number }
- cancel: () => void
```

### ImageDropzoneWithCompression.tsx
```text
Props adicionais ao ImageDropzone:
- autoCompress?: boolean (default: true)
- showStats?: boolean (default: true)
- onCompressionComplete?: (stats: CompressionStats) => void

Funcionalidades:
- Indicador de progresso durante compressao
- Badge com % de economia apos comprimir
- Preview usa imagem ja comprimida
```

### Melhorias no PortfolioForm.tsx
```text
Antes do upload (linha 195-209):
1. Comprimir imagem para WebP
2. Mostrar progresso de compressao
3. Exibir estatisticas de economia

Adicionar imports:
- import { compressImage } from '@/utils/autoCompressUtils';
```

---

## Fluxo de Compressao

```text
1. Utilizador seleciona imagem(ns)
2. Sistema detecta tamanho do ficheiro
3. Aplica compressao adaptativa:
   - Redimensiona se necessario (max 1920x1080)
   - Converte para WebP
   - Ajusta qualidade baseada no tamanho
4. Mostra preview com imagem comprimida
5. Exibe estatisticas (tamanho original vs comprimido)
6. Upload da imagem ja otimizada
```

---

## Ficheiros a Criar

| Ficheiro | Descricao |
|----------|-----------|
| `src/utils/autoCompressUtils.ts` | Utilidades de compressao automatica |
| `src/hooks/useAutoCompress.ts` | Hook reutilizavel para compressao |
| `src/components/admin/ImageDropzoneWithCompression.tsx` | Dropzone com compressao integrada |

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/pages/admin/PortfolioForm.tsx` | Adicionar compressao WebP no upload |
| `src/pages/admin/PropertyForm.tsx` | Melhorar feedback visual de compressao |
| `src/components/admin/ImageDropzone.tsx` | Adicionar props opcionais para estatisticas |

---

## Beneficios Esperados

| Metrica | Antes | Depois |
|---------|-------|--------|
| Tamanho medio upload | 2-5MB | 100-500KB |
| Tempo de upload | 5-10s | 1-2s |
| Uso de storage | 100% | ~20-30% |
| Experiencia utilizador | Upload lento | Feedback imediato |

---

## Notas de Implementacao

1. **Compressao Client-Side**: Toda compressao e feita no browser antes do upload, reduzindo uso de largura de banda
2. **WebP Universal**: Formato WebP tem suporte em todos os browsers modernos (97%+ globalmente)
3. **Fallback JPEG**: Para browsers antigos, manter opcao de fallback para JPEG
4. **Preservar Aspect Ratio**: Nunca distorcer imagens, apenas redimensionar proporcionalmente
5. **Limite de Qualidade**: Nunca baixar de 70% para garantir qualidade aceitavel

