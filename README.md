# 🛒 Bhumi Shop

> Loja online de produtos da comunidade Bhumi - Livros, Camisetas, Arte e mais.

![Vue.js](https://img.shields.io/badge/Vue.js-3-green)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-yellow)

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
- Login WeChat (微信登录)
- Login por SMS
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
VITE_WECHAT_APP_ID=your-wechat-app-id
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
- **WeChat (微信登录):** Login rápido com conta WeChat
- **SMS:** Login por código SMS no telefone

---

## 🚢 Deploy

### 阿里云 (Alibaba Cloud) / 腾讯云 (Tencent Cloud)

1. Faça o build de produção com `npm run build`
2. Faça upload do diretório `dist/` para o serviço de hospedagem estática
3. Configure as variáveis de ambiente no painel do provedor
4. Configure o domínio e certificado SSL

#### Opções de deploy:
- **阿里云 OSS** + CDN: Hospedagem estática com Object Storage Service
- **腾讯云 COS** + CDN: Cloud Object Storage para arquivos estáticos
- **Docker**: Containerize com Nginx para deploy em qualquer cloud

```bash
# Build para produção
npm run build

# O diretório dist/ estará pronto para deploy
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
