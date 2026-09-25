# 📊 Painel Admin - BHUMI SHOP

> Sistema de gestão administrativa para a loja Bhumi Shop.

---

## 📋 Descrição

O **Painel Admin** é a área de administração do Bhumi Shop, onde você gerencia produtos, categorias e configurações da loja. Desenvolvido com **Vue.js 3** e integrado ao **Supabase**.

**URL de Produção:** https://a-shop-2026.bhumisparshaschool.org

---

## ✨ Funcionalidades

### Produtos
- ✅ Listar todos os produtos
- ✅ Buscar produtos por nome
- ✅ Filtrar por categoria
- ✅ Adicionar novo produto
- ✅ Editar produto existente
- ✅ Excluir produto
- ✅ Upload de imagens (base64 ou URL)
- ✅ Gerenciar tamanhos (P, M, G, GG, etc)
- ✅ Definir tipo de estoque (print-on-demand ou estoque)

### Categorias
- ✅ Listar categorias
- ✅ Adicionar nova categoria
- ✅ Editar nome e ícone
- ✅ Excluir categoria

### Exportação
- ✅ Exportar produtos para CSV
- ✅ Exportar produtos para PDF

### Configurações
- ✅ Configurar chave PIX
- ✅ Configurar WhatsApp
- ✅ Configurar email PayPal
- ✅ Configurar token Mercado Pago

---

## 📁 Estrutura de Arquivos

```
BHUMI-SHOP-ADMIN/
├── src/
│   ├── App.vue                    # Layout principal
│   ├── main.js                    # Entry point
│   ├── router/
│   │   └── index.js              # Rotas do Vue Router
│   ├── supabase.js               # Configuração do Supabase
│   ├── stores/
│   │   ├── products.js           # Store Pinia de produtos
│   │   └── cart.js               # Store do carrinho
│   └── views/
│       ├── HomeView.vue           # Home (redireciona)
│       ├── ProductsView.vue       # Lista de produtos
│       ├── ProductDetailView.vue  # Detalhes do produto
│       ├── CartView.vue           # Carrinho
│       ├── VideosView.vue         # Vídeos
│       ├── AboutView.vue          # Sobre
│       ├── ConfigView.vue         # Configurações
│       ├── AdminView.vue          # Painel admin principal
│       └── LoginView.vue          # Login
├── public/
├── index.html
└── package.json
```

---

## 🔌 Endpoints do Supabase

O projeto usa as seguintes tabelas do Supabase:

- `products` - CRUD de produtos
- `categories` - CRUD de categorias

---

## 🖥️ Rotas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Home (redireciona) | Público |
| `/login` | Login administrativo | Público |
| `/admin` | Painel principal | Requer login |
| `/config` | Configurações | Requer login |
| `/produtos` | Ver loja | Público |
| `/videos` | Ver vídeos | Público |
| `/sobre` | Ver sobre | Público |

---

## 🔐 Autenticação

### Login Admin
- **URL:** `/login`
- **Senha:** (configure via Supabase - sql/create-admins-table.sql)

A autenticação usa sessionStorage para manter o estado de login.

```javascript
// Verificação de autenticação (AdminView.vue)
onMounted(() => {
  if (!sessionStorage.getItem('admin-auth')) {
    window.location.href = '/login'
  }
})
```

---

## 💾 Gerenciamento de Produtos

### Campos do Produto

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | ✅ | Nome do produto |
| category | string | ✅ | ID da categoria |
| price | number | ✅ | Preço em reais |
| description | text | ❌ | Descrição detalhada |
| stock | select | ✅ | "print-on-demand" ou "estoque" |
| image | string | ❌ | URL ou base64 da imagem |
| artist | string | ❌ | Nome do artista/autor |
| info | string | ❌ | Informações adicionais |
| sizes | string | ❌ | Tamanhos (ex: P,M,G,GG) |

### Exemplo de Produto

```javascript
{
  name: "Camiseta Bhumi",
  category: "camisetas",
  price: 89.90,
  description: "Camiseta de cotton comb",
  stock: "print-on-demand",
  image: "https://exemplo.com/imagem.jpg",
  artist: "Bhumi Art",
  info: "100% algodão orgânico",
  sizes: "P,M,G,GG"
}
```

---

## 📂 Gerenciamento de Categorias

### Estrutura

```javascript
{
  id: "parceiros",      // slug único
  name: "Parceiros",     // nome exibido
  icon: "🤝"            // emoji
}
```

### Adicionar Categoria

1. Vá na aba "Categorias"
2. Digite o nome da nova categoria
3. (Opcional) Adicione um emoji como ícone
4. Clique em "+"

### Editar Categoria

1. Clique no nome da categoria
2. Altere o nome ou ícone
3. A alteração é salva automaticamente (blur)

### Excluir Categoria

1. Clique no botão 🗑️
2. Confirme a exclusão
3. **Atenção:** Os produtos NÃO são excluídos, apenas ficam sem categoria

---

## 📊 Exportação

### CSV

Gera um arquivo CSV com todos os produtos:
- ID
- Nome
- Artista
- Categoria
- Preço
- Tipo de estoque

### PDF

Gera um relatório em PDF com:
- Título: "BhumiShop - Relatório de Produtos"
- Data de geração
- Total de produtos
- Tabela com todos os produtos

---

## ⚙️ Configurações

### Campos de Configuração

| Campo | Descrição |
|-------|-----------|
| Chave PIX | Chave PIX para receber pagamentos |
| WhatsApp | Número para contato via WhatsApp |
| Email PayPal | Email PayPal para receber |
| Token Mercado Pago | Token de acesso Mercado Pago |

As configurações são armazenadas no `localStorage`:

```javascript
localStorage.setItem('bhumi-config', JSON.stringify(config))
```

---

## 🎨 Estilos

O projeto usa CSS com variáveis customizadas:

```css
:root {
  --bg-primary: #0a0a0a;
  --bg-secondary: #1a1a2e;
  --bg-card: #12121f;
  --accent-purple: #7B2CBF;
  --accent-purple-light: #9D4EDD;
  --accent-green: #00FF41;
  --text-primary: #FFFFFF;
  --text-secondary: #B8B8B8;
  --text-muted: #6B6B6B;
  --border-color: #2a2a4a;
}
```

---

## 🐛 Bugs Conhecidos

1. **Filtro de categorias:** Usar `toString()` na comparação para evitar erros de tipo
2. **Imagens:** Aceita tanto base64 quanto URLs (http/https)
3. ~~**Login Google:** Redirect URL hardcoded para produção~~ (corrigido: usa `window.location.origin` / `VITE_SITE_URL`)

---

## 🚀 Deploy

### Vercel

1. Conecte o repositório ao Vercel
2. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_KEY`
3. Deploy automático em push para master

---

## 📞 Suporte

Para dúvidas ou problemas, consulte a [Documentação Geral](./GERAL.md) ou abra uma issue no GitHub.
