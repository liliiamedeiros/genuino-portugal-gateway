
# Plano de Revisao Completa Mobile

## Resumo

Apos analisar todo o codigo do site, identifiquei varias areas que precisam de melhorias para a experiencia mobile. Este plano aborda todos os componentes principais para garantir uma experiencia otimizada em telemoveis.

---

## Problemas Identificados e Solucoes

### 1. Chat Widget - Ocupa Tela Inteira no Mobile

**Problema:** O ChatWidget tem dimensoes fixas (`w-[400px] h-[650px]`) que nao se adaptam a ecras pequenos.

**Solucao:**
- Adicionar classes responsivas: `w-full sm:w-[400px] h-[100dvh] sm:h-[650px]`
- No mobile, ocupar tela inteira com `fixed inset-0`
- Melhorar espacamento e tamanhos de touch targets

**Ficheiro:** `src/components/ChatWidget.tsx`

---

### 2. Menu Mobile - Melhorar Experiencia de Navegacao

**Problema:** O menu hamburger pode ser dificil de usar e os links podem ter areas de toque pequenas.

**Solucao:**
- Aumentar padding dos links do menu mobile
- Adicionar backdrop blur ao menu aberto
- Melhorar animacao de abertura/fecho
- Garantir z-index correto para evitar sobreposicoes

**Ficheiro:** `src/components/Navbar.tsx`

---

### 3. Hero Slider - Ajustar para Mobile

**Problema:** Os dots de navegacao do slider podem ser dificeis de clicar no mobile.

**Solucao:**
- Aumentar tamanho dos dots no mobile
- Adicionar swipe gesture mais responsivo
- Melhorar spacing do conteudo no hero

**Ficheiro:** `src/components/HeroSlider.tsx`

---

### 4. Footer - Otimizar Layout Mobile

**Problema:** O footer pode ter elementos apertados no mobile.

**Solucao:**
- Stack vertical para todos elementos no mobile
- Melhorar espacamento entre sections
- Garantir que links de redes sociais tem bom touch target

**Ficheiro:** `src/components/Footer.tsx`

---

### 5. PWA Install Prompt - Melhorar Posicionamento

**Problema:** O prompt pode sobrepor outros elementos.

**Solucao:**
- Ajustar posicionamento para nao conflitar com ChatWidget
- Adicionar safe area inset para dispositivos com notch

**Ficheiro:** `src/components/PWAInstallPrompt.tsx`

---

### 6. Property Cards - Otimizar para Mobile

**Problema:** Cards de imoveis podem ter informacao muito apertada.

**Solucao:**
- Ajustar tamanhos de imagem responsivos
- Melhorar truncamento de texto
- Garantir que badges nao sobrepoem conteudo

**Ficheiro:** `src/components/ProjectCard.tsx`

---

### 7. Language Switcher - Aumentar Touch Target

**Problema:** O seletor de idioma pode ser pequeno demais no mobile.

**Solucao:**
- Aumentar tamanho do botao
- Garantir que dropdown tem bom espacamento

**Ficheiro:** `src/components/LanguageSwitcher.tsx`

---

### 8. CSS Global - Melhorias Gerais

**Adicionar ao CSS:**
- Safe area insets para dispositivos com notch
- Melhor scroll behavior
- Touch manipulation para prevenir delay em toques
- Melhor suporte para 100dvh (dynamic viewport height)

**Ficheiro:** `src/index.css`

---

## Alteracoes Tecnicas

### ChatWidget.tsx
```text
- Card fixo no mobile ocupa tela inteira
- Adicionar inset-0 sm:inset-auto
- Botao de fechar mais visivel
- Input maior para melhor usabilidade
```

### Navbar.tsx
```text
- Menu mobile com animacao slide-in
- Backdrop blur quando aberto
- Links com min-h-12 para toque facil
- Botao hamburger maior
```

### HeroSlider.tsx
```text
- Dots com w-3 h-3 no mobile (maior area de toque)
- Spacing melhorado no conteudo
- Suporte swipe melhorado
```

### index.css
```text
- env(safe-area-inset-*) para notch
- scroll-behavior: smooth
- touch-action: manipulation
- 100dvh para altura dinamica
```

### PWAInstallPrompt.tsx
```text
- Bottom positioning considerando safe-area
- z-index abaixo do ChatWidget
- Max-width ajustado para mobile
```

### ProjectCard.tsx
```text
- Imagem responsiva h-[180px] sm:h-[220px]
- Badges com melhor spacing
- Texto com line-clamp adequado
```

---

## Resumo das Alteracoes por Ficheiro

| Ficheiro | Tipo de Alteracao |
|----------|-------------------|
| `src/components/ChatWidget.tsx` | Responsividade fullscreen mobile |
| `src/components/Navbar.tsx` | Menu mobile melhorado |
| `src/components/HeroSlider.tsx` | Touch targets maiores |
| `src/components/Footer.tsx` | Layout vertical no mobile |
| `src/components/PWAInstallPrompt.tsx` | Safe area + positioning |
| `src/components/ProjectCard.tsx` | Tamanhos responsivos |
| `src/components/LanguageSwitcher.tsx` | Touch target maior |
| `src/index.css` | Safe areas + scroll + touch |

---

## Beneficios

- **Melhor usabilidade**: Touch targets de 44px+ em todos os elementos interativos
- **Compatibilidade**: Suporte para dispositivos com notch (iPhone X+)
- **Performance**: Scroll suave e animacoes otimizadas
- **Acessibilidade**: Melhor contraste e legibilidade
- **PWA**: Experiencia nativa quando instalado
