# Guia de Estilos Responsivos - Genuíno Investments

Este guia documenta as classes Tailwind CSS usadas para garantir responsividade consistente em todos os dispositivos: mobile, tablet, desktop, e TV.

---

## 1. Breakpoints Tailwind

| Breakpoint | Largura Mínima | Dispositivo |
|------------|----------------|-------------|
| `xs` | 320px | Mobile pequeno |
| `car` | 480px | Modo automóvel |
| `sm` | 640px | Mobile grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop pequeno |
| `xl` | 1280px | Desktop grande |
| `2xl` | 1536px | TV HD |
| `3xl` | 1920px | TV Full HD |
| `4xl` | 2560px | TV 4K |

---

## 2. Touch Targets

Classes para garantir áreas de toque acessíveis (WCAG):

| Classe | Altura | Uso |
|--------|--------|-----|
| `min-h-touch` | 44px | Mínimo WCAG para botões e inputs |
| `min-h-touch-lg` | 56px | Touch targets para TV |
| `min-h-car-touch` | 64px | Touch targets para modo automóvel |

### Exemplo de Uso:
```html
<Button className="min-h-touch 3xl:min-h-touch-lg">
  Enviar
</Button>

<Input className="min-h-touch 3xl:min-h-touch-lg 3xl:text-base" />
```

---

## 3. Padrões de Padding

### Container Principal:
```css
px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16
```

### Secções (vertical):
```css
py-12 sm:py-16 lg:py-20 3xl:py-28 4xl:py-36
```

### Hero Sections:
```css
py-24 sm:py-28 lg:py-32 3xl:py-40 4xl:py-48
```

### Cards:
```css
p-4 sm:p-6 3xl:p-8 4xl:p-10
```
ou
```css
p-6 sm:p-8 3xl:p-10 4xl:p-12
```

---

## 4. Padrões de Fontes

### H1 Hero (título principal):
```css
text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 4xl:text-8xl
```

### H2 Secção (títulos de secção):
```css
text-3xl sm:text-4xl 3xl:text-5xl 4xl:text-6xl
```
ou
```css
text-2xl sm:text-3xl 3xl:text-4xl 4xl:text-5xl
```

### H3 Card (títulos de cards):
```css
text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl
```

### Parágrafo Grande:
```css
text-lg sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl
```

### Parágrafo Normal:
```css
text-base sm:text-lg 3xl:text-xl 4xl:text-2xl
```

### Texto Menor:
```css
text-sm sm:text-base 3xl:text-lg 4xl:text-xl
```

### Labels de Formulário:
```css
text-sm 3xl:text-base 4xl:text-lg
```

---

## 5. Padrões de Grids

### Gap Responsivo:
```css
gap-4 sm:gap-6 lg:gap-8 3xl:gap-10 4xl:gap-12
```
ou
```css
gap-6 sm:gap-8 3xl:gap-10 4xl:gap-12
```

### Colunas Responsivas:
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-4
```

### Galeria de Imagens:
```css
grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6
```

### Características/Features:
```css
grid-cols-2 md:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-5
```

---

## 6. Padrões de Ícones

### Ícone Pequeno:
```css
h-4 w-4 3xl:h-5 3xl:w-5 4xl:h-6 4xl:w-6
```

### Ícone Médio:
```css
h-5 w-5 sm:h-6 sm:w-6 3xl:h-8 3xl:w-8 4xl:h-10 4xl:w-10
```

### Ícone Grande (cards):
```css
h-7 w-7 sm:h-8 sm:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12
```

### Ícone em Círculo (badges):
```css
w-14 h-14 sm:w-16 sm:h-16 3xl:w-20 3xl:h-20 4xl:w-24 4xl:h-24
```

### Ícone em Círculo Grande (valores):
```css
w-16 h-16 sm:w-20 sm:h-20 3xl:w-24 3xl:h-24 4xl:w-28 4xl:h-28
```

---

## 7. Margens e Espaçamentos

### Margem Bottom Títulos:
```css
mb-4 sm:mb-6 3xl:mb-8
```

### Margem Bottom Secções:
```css
mb-8 sm:mb-12 3xl:mb-16
```

### Space-Y para Listas/Forms:
```css
space-y-4 sm:space-y-6 3xl:space-y-8
```

---

## 8. Alturas Responsivas

### Iframes (Mapas, Vídeos):
```css
h-48 sm:h-56 lg:h-64 3xl:h-80 4xl:h-96
```
ou
```css
h-[250px] sm:h-[350px] lg:h-[450px] 3xl:h-[550px] 4xl:h-[650px]
```

### Max-Width para Texto:
```css
max-w-3xl 3xl:max-w-4xl
```
ou
```css
max-w-6xl 3xl:max-w-7xl
```

---

## 9. Modo TV (3xl e 4xl)

### Base Font Size (definido em index.css):
```css
@media (min-width: 1920px) {
  html { font-size: 18px; }
}

@media (min-width: 2560px) {
  html { font-size: 20px; }
}
```

### Classes Específicas TV:
```css
.tv-text { @apply 3xl:text-lg 4xl:text-xl; }
.tv-heading { @apply 3xl:text-4xl 4xl:text-5xl; }
.tv-subheading { @apply 3xl:text-2xl 4xl:text-3xl; }
```

---

## 10. Modo Automóvel (Car Mode)

### Touch Targets Ampliados:
```css
.car-touch-target { @apply min-h-[64px] min-w-[64px]; }
```

### Texto Simplificado:
```css
.car-mode-text { @apply text-lg font-medium; }
.car-mode-heading { @apply text-2xl font-bold; }
```

### Contraste Alto (High Contrast Mode):
```css
.high-contrast { 
  background: black; 
  color: white; 
}
```

---

## 11. Exemplos Práticos

### Hero Section Completo:
```html
<section className="relative py-24 sm:py-28 lg:py-32 3xl:py-40 4xl:py-48 overflow-hidden">
  <div className="container mx-auto px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16 text-center">
    <h1 className="text-4xl sm:text-5xl md:text-6xl 3xl:text-7xl 4xl:text-8xl font-serif font-bold mb-4 sm:mb-6 3xl:mb-8">
      Título Principal
    </h1>
    <p className="text-lg sm:text-xl md:text-2xl 3xl:text-3xl 4xl:text-4xl max-w-3xl 3xl:max-w-4xl mx-auto">
      Descrição do hero
    </p>
  </div>
</section>
```

### Card Responsivo:
```html
<Card>
  <CardContent className="p-6 sm:p-8 3xl:p-10 4xl:p-12">
    <div className="w-14 h-14 sm:w-16 sm:h-16 3xl:w-20 3xl:h-20 4xl:w-24 4xl:h-24 bg-primary/10 rounded-full flex items-center justify-center mb-4 sm:mb-6 3xl:mb-8">
      <Icon className="h-7 w-7 sm:h-8 sm:w-8 3xl:h-10 3xl:w-10 4xl:h-12 4xl:w-12" />
    </div>
    <h3 className="text-xl sm:text-2xl 3xl:text-3xl 4xl:text-4xl font-bold mb-3 sm:mb-4 3xl:mb-6">
      Título do Card
    </h3>
    <p className="text-sm sm:text-base 3xl:text-lg 4xl:text-xl text-muted-foreground">
      Descrição do card
    </p>
  </CardContent>
</Card>
```

### Formulário Responsivo:
```html
<form className="space-y-4 sm:space-y-6 3xl:space-y-8">
  <div>
    <label className="block text-sm 3xl:text-base 4xl:text-lg font-medium mb-2 3xl:mb-3">
      Campo
    </label>
    <Input className="w-full min-h-touch 3xl:min-h-touch-lg 3xl:text-base 4xl:text-lg" />
  </div>
  <Button className="w-full min-h-touch 3xl:min-h-touch-lg 3xl:text-base 4xl:text-lg">
    Enviar
  </Button>
</form>
```

---

## 12. Checklist de Responsividade

Ao criar/editar componentes, verificar:

- [ ] Padding do container: `px-4 sm:px-6 lg:px-8 3xl:px-12 4xl:px-16`
- [ ] Padding vertical das secções: `py-16 sm:py-20 3xl:py-28 4xl:py-36`
- [ ] Títulos com escala TV: `3xl:text-* 4xl:text-*`
- [ ] Parágrafos com escala TV: `3xl:text-* 4xl:text-*`
- [ ] Grids com gap responsivo: `gap-* sm:gap-* 3xl:gap-* 4xl:gap-*`
- [ ] Ícones com escala TV: `3xl:h-* 3xl:w-* 4xl:h-* 4xl:w-*`
- [ ] Inputs/Buttons com touch targets: `min-h-touch 3xl:min-h-touch-lg`
- [ ] Iframes com altura escalável: `h-* sm:h-* lg:h-* 3xl:h-* 4xl:h-*`

---

## 13. Ficheiros com Responsividade Completa

### Páginas Públicas:
- ✅ Home.tsx
- ✅ About.tsx
- ✅ Services.tsx
- ✅ Contact.tsx
- ✅ Portfolio.tsx
- ✅ PortfolioDetail.tsx
- ✅ Properties.tsx
- ✅ ProjectDetail.tsx
- ✅ Vision.tsx
- ✅ Investors.tsx
- ✅ Legal.tsx
- ✅ Privacy.tsx

### Componentes:
- ✅ Navbar.tsx
- ✅ Footer.tsx
- ✅ HeroSlider.tsx
- ✅ StatsSection.tsx
- ✅ ProjectCard.tsx
- ✅ ChatWidget.tsx

---

*Última atualização: Dezembro 2024*