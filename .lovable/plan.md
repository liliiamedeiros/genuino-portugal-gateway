

# Plano: Favicon Dinâmico e Validação de Dimensões

## Resumo

Este plano implementa duas funcionalidades:
1. **Injeção dinâmica do favicon** usando `react-helmet-async` para aplicar o favicon automaticamente após o React carregar
2. **Validação de dimensões** para alertar o utilizador se a imagem não tiver 32x32px ou 64x64px

---

## Parte 1: Favicon Dinâmico com react-helmet-async

### Novo Componente: DynamicFavicon.tsx

Criar um componente que busca o `favicon_url` da tabela `system_settings` e injeta no `<head>` usando Helmet.

**Novo Ficheiro:** `src/components/DynamicFavicon.tsx`

```text
Funcionalidades:
- Busca favicon_url do system_settings via React Query
- Usa Helmet para injetar <link rel="icon"> no head
- Suporta diferentes tipos (PNG, ICO, SVG)
- Fallback para favicon padrão se não configurado
```

### Integração no App.tsx

Adicionar o componente `DynamicFavicon` ao layout principal da aplicação, junto aos outros componentes globais como `OrganizationSchema`.

---

## Parte 2: Validação de Dimensões de Imagem

### Melhorar onChange do Input no Settings.tsx

Adicionar validação que:
1. Carrega a imagem num objeto Image
2. Verifica se as dimensões são 32x32, 64x64, ou potências de 2 comuns para favicons
3. Mostra alerta (toast) se as dimensões não forem recomendadas
4. Ainda permite o upload (aviso, não bloqueio)

---

## Detalhes Técnicos

### DynamicFavicon.tsx

```text
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

Lógica:
1. useQuery busca favicon_url de system_settings
2. Determina tipo MIME baseado na extensão (.png, .ico, .svg)
3. Renderiza Helmet com link rel="icon" se URL existir
```

### Validação de Dimensões em Settings.tsx

```text
Adicionar estado:
- faviconDimensions: { width: number, height: number } | null
- faviconDimensionWarning: string | null

Nova função validateFaviconDimensions:
1. Cria objeto Image() com src = data URL
2. No onload, lê naturalWidth e naturalHeight
3. Verifica se é 16x16, 32x32, 48x48, 64x64, ou 128x128
4. Se não for, define warning message
5. Mostra toast de aviso (não bloqueia upload)
```

---

## Fluxo de Validação

```text
1. Utilizador seleciona ficheiro
2. FileReader lê como data URL
3. Image carrega para obter dimensões
4. Sistema valida dimensões:
   - 16x16, 32x32, 48x48, 64x64, 128x128 = OK (sem aviso)
   - Quadrado mas tamanho diferente = Aviso leve
   - Não quadrado = Aviso forte (favicon deve ser quadrado)
5. Preview mostra dimensões detectadas
6. Utilizador pode continuar com o upload
```

---

## Ficheiros a Criar

| Ficheiro | Descrição |
|----------|-----------|
| `src/components/DynamicFavicon.tsx` | Componente para injetar favicon dinamicamente via Helmet |

## Ficheiros a Modificar

| Ficheiro | Alteração |
|----------|-----------|
| `src/App.tsx` | Adicionar DynamicFavicon ao layout global |
| `src/pages/admin/Settings.tsx` | Adicionar validação de dimensões no onChange do input |

---

## Comportamento Esperado

### Favicon Dinâmico
- Quando o utilizador guarda um novo favicon, este é aplicado automaticamente em todas as páginas
- Não é necessário editar manualmente o index.html (embora o favicon estático inicial ainda venha de lá)
- O favicon dinâmico sobrepõe o estático após React carregar

### Validação de Dimensões
- **Dimensões corretas (32x32, 64x64, etc.)**: Upload normal, sem avisos
- **Dimensões incorretas**: Toast de aviso aparece, mas upload continua possível
- **Imagem não quadrada**: Toast de aviso mais forte

---

## Alterações em Settings.tsx

### Novo Estado

```text
const [faviconDimensions, setFaviconDimensions] = useState<{width: number, height: number} | null>(null);
```

### Nova Lógica no onChange

```text
const file = e.target.files?.[0];
if (file) {
  setFaviconFile(file);
  const reader = new FileReader();
  reader.onload = (event) => {
    const dataUrl = event.target?.result as string;
    setFaviconPreview(dataUrl);
    
    // Validar dimensões
    const img = new Image();
    img.onload = () => {
      const { naturalWidth, naturalHeight } = img;
      setFaviconDimensions({ width: naturalWidth, height: naturalHeight });
      
      const validSizes = [16, 32, 48, 64, 128, 256];
      const isSquare = naturalWidth === naturalHeight;
      const isValidSize = validSizes.includes(naturalWidth);
      
      if (!isSquare) {
        toast({
          title: "Aviso: Imagem não quadrada",
          description: `Detectado: ${naturalWidth}x${naturalHeight}px. Favicons devem ser quadrados.`,
          variant: "destructive",
        });
      } else if (!isValidSize) {
        toast({
          title: "Aviso: Tamanho não recomendado",
          description: `Detectado: ${naturalWidth}x${naturalHeight}px. Recomendado: 32x32 ou 64x64.`,
        });
      }
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}
```

### Mostrar Dimensões no Preview

Adicionar badge mostrando dimensões detectadas junto ao preview do favicon.

---

## Ordem de Implementação

1. Criar `DynamicFavicon.tsx` - componente de injeção dinâmica
2. Adicionar `DynamicFavicon` ao `App.tsx`
3. Atualizar `Settings.tsx` com validação de dimensões
4. Atualizar preview para mostrar dimensões detectadas
5. Remover nota sobre "atualizar index.html manualmente" (já não é necessário)

