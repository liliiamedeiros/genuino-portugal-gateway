

# Plano: Adicionar Aba "Favicon" nas Configuracoes

## Resumo

Adicionar uma nova aba chamada "Favicon" na pagina de Configuracoes da area de administracao, permitindo ao utilizador fazer upload de um icone personalizado para o separador do browser.

---

## Localizacao no Menu

A nova aba sera adicionada na pagina **Configuracoes** (`/admin/settings`), junto com as abas existentes:
- Geral
- Email
- Notificacoes
- Sistema
- Seguranca
- Integracoes
- **Favicon** (nova)

---

## Funcionalidades da Aba Favicon

### Interface do Utilizador

1. **Titulo e Descricao**
   - Titulo: "Favicon"
   - Descricao: "Icone que aparece no separador do browser. Recomendado: PNG, ICO ou SVG, 32x32px ou 64x64px."

2. **Preview do Favicon Atual**
   - Mostrar o favicon atual (se existir)
   - Placeholder se nenhum favicon estiver configurado

3. **Upload de Novo Favicon**
   - Zona de upload (dropzone simplificada)
   - Formatos aceites: PNG, ICO, SVG
   - Tamanho recomendado indicado

4. **Botao Salvar**
   - Guarda o URL do favicon na tabela `system_settings`
   - Atualiza o `index.html` dinamicamente (ou instrucoes para o utilizador)

---

## Alteracoes Tecnicas

### Ficheiro: src/pages/admin/Settings.tsx

**Adicionar:**
1. Nova `TabsTrigger` para "Favicon"
2. Novo `TabsContent` com:
   - Card com preview do favicon atual
   - Upload de ficheiro
   - Logica de upload para Supabase Storage
   - Botao de salvar

**Imports Adicionais:**
```text
- Image (lucide-react) - icone para a aba
- useRef - para referencia do input file
```

**Estado Adicional:**
```text
- faviconFile: File | null
- faviconPreview: string | null
- isUploadingFavicon: boolean
```

**Funcoes Adicionais:**
```text
- handleFaviconUpload: faz upload para storage e guarda URL
- handleFaviconChange: preview local antes do upload
```

---

## Fluxo de Upload

```text
1. Utilizador seleciona ficheiro (PNG, ICO, ou SVG)
2. Preview local aparece na interface
3. Utilizador clica "Salvar Favicon"
4. Ficheiro e enviado para Supabase Storage (bucket: favicons)
5. URL publico e guardado em system_settings (key: favicon_url)
6. Toast de sucesso
7. Instrucoes para atualizar index.html (se necessario)
```

---

## Estrutura do TabsContent

```text
TabsContent value="favicon"
├── Card
│   ├── CardHeader
│   │   ├── CardTitle: "Favicon"
│   │   └── CardDescription: "Icone do separador do browser..."
│   │
│   └── CardContent
│       ├── Preview Atual (ou placeholder)
│       │   └── img com favicon atual ou icone placeholder
│       │
│       ├── Upload Zone
│       │   ├── input type="file" accept=".png,.ico,.svg"
│       │   └── Instrucoes de tamanho (32x32px ou 64x64px)
│       │
│       ├── Preview do Novo (se selecionado)
│       │
│       └── Button "Salvar Favicon"
```

---

## Consideracoes de Storage

O favicon sera guardado no Supabase Storage:
- **Bucket:** `site-assets` ou `favicons`
- **Path:** `favicon/favicon.[extensao]`
- **Politicas:** Leitura publica, escrita apenas autenticados

Se o bucket nao existir, sera necessario cria-lo ou usar um bucket existente como `project-images`.

---

## Ficheiros a Modificar

| Ficheiro | Alteracao |
|----------|-----------|
| `src/pages/admin/Settings.tsx` | Adicionar TabsTrigger + TabsContent para Favicon |

---

## Notas Importantes

1. **Limitacao do index.html**: O `index.html` e estatico e nao pode ser alterado dinamicamente via codigo React. O favicon guardado sera util para:
   - Referencia futura
   - Futuras implementacoes com SSR
   - O utilizador pode manualmente atualizar o `index.html` com o URL

2. **Alternativa Dinamica**: Podemos usar `react-helmet-async` para injetar o favicon dinamicamente no `<head>`, mas isso so funciona apos o React carregar.

3. **Formatos Suportados**:
   - `.png` - Mais comum, suportado por todos os browsers
   - `.ico` - Formato tradicional, multiplas resolucoes
   - `.svg` - Vetorial, escalavel (suporte moderno)

