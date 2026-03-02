# 🛒 Bhumi Shop

> Loja online de produtos da comunidade Bhumi - Livros, Camisetas, Arte e mais.

![Vue.js](https://img.shields.io/badge/Vue.js-3-green)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-yellow)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-black)

---

## 📋 Descrição

Loja virtual completa para comercialização de produtos da comunidade Bhumi. Desenvolvida com **Vue.js 3**, **Vite**, **Pinia** e integrada ao **Supabase**.

🔗 **URL de Produção:** https://shop.bhumisparshaschool.org

🔗 **Painel Admin:** https://a-shop-2026.bhumisparshaschool.org

---

## ✨ Funcionalidades

### 🛍️ Catálogo
- Visualização de produtos
- Filtro por categoria
- Busca de produtos
- Detalhes do produto com gallery

### 🛒 Carrinho
- Adicionar/remover produtos
- Seleção de tamanhos
- Controle de quantidade
- Persistência localStorage

### 💳 Checkout
- PIX (QR Code)
- Mercado Pago
- PayPal

### 👤 Conta do Cliente
- Cadastro email/senha
- Login Google OAuth
- Meus pedidos
- Acompanhamento de status

---

## 🛠️ Tecnologias

| Tecnologia | Descrição |
|-----------|-----------|
| Vue.js 3 | Framework frontend |
| Vite | Build tool |
| Pinia | Gerenciamento de estado |
| Supabase | Backend (Auth, Database) |
| Vercel | Deploy |

---

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone https://github.com/anattamodels/bhumi-shop.git
cd bhumi-shop
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Execute localmente
```bash
npm run dev
```

### 4. Build para produção
```bash
npm run build
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env`:
```env
VITE_SUPABASE_URL=https://nuypyyxnacvglpqwqihx.supabase.co
VITE_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📁 Estrutura

```
src/
├── App.vue                    # Layout (header, footer)
├── main.js                   # Entry point
├── router/
│   └── index.js              # Rotas
├── supabase.js               # Config Supabase
├── stores/
│   ├── products.js           # Produtos e categorias
│   ├── cart.js               # Carrinho (localStorage)
│   ├── auth.js               # Autenticação
│   └── orders.js              # Pedidos
└── views/
    ├── HomeView.vue          # Página inicial
    ├── ProductsView.vue      # Lista produtos
    ├── ProductDetailView.vue # Detalhes
    ├── CartView.vue         # Carrinho + Checkout
    ├── VideosView.vue       # Vídeos
    ├── AboutView.vue        # Sobre
    ├── AuthView.vue        # Login/Cadastro
    ├── MyOrdersView.vue    # Meus pedidos
    └── ProfileView.vue     # Perfil
```

---

## 🗂️ Categorias

| Categoria | Ícone |
|-----------|-------|
| Livros | 📚 |
| Camisetas | 👕 |
| Posters | 🖼️ |
| Acessórios | 💎 |
| Parceiros | 🤝 |
| Outros | 📦 |

---

## 📄 Fluxo de Compra

```
1. Cliente navega → Home / Produtos
2. Seleciona produto → Ver detalhes
3. Adiciona ao carrinho → Escolhe tamanho
4. Vai para checkout → Revisa pedido
5. Escolhe pagamento → PIX / Mercado Pago / PayPal
6. Confirma → Pedido registrado
7. Acompanha → Minhas Compras
```

---

## 📊 Status de Pedido

| Status | Descrição |
|--------|-----------|
| pending | Aguardando Pagamento |
| paid | Pago Confirmado |
| preparing | Preparando |
| shipped | Enviado |
| delivered | Entregue |

---

## 📄 Documentação

- [Documentação Geral](./docs/GERAL.md)
- [Documentação Admin](./docs/PAINEL_ADMIN.md)
- [Documentação Loja](./docs/LOJA.md)

---

## 🔐 Autenticação

- **Email/Senha:** Cadastro tradicional
- **Google OAuth:** Login rápido com conta Google

---

## 🚢 Deploy

### Vercel

1. Conecte o repositório ao [Vercel](https://vercel.com)
2. Adicione as variáveis de ambiente
3. Deploy automático

```bash
git add .
git commit -m "Update"
git push origin master
```

---

## 📞 Contato

- **GitHub:** https://github.com/anattamodels/bhumi-shop
- **Loja:** https://shop.bhumisparshaschool.org

---

## 📝 Licença

MIT License - Bhumi Shop 2026

---

Made with ❤️ by [Bhumi](https://bhumisparshaschool.org)
