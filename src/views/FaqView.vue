<template>
  <div class="faq-page">
    <!-- DarkVeil Background -->
    <div class="faq-page__veil">
      <DarkVeil :hue-shift="260" :noise-intensity="0.03" :scanline-intensity="0.05" :speed="0.3" />
    </div>

    <!-- Hero Header -->
    <div class="faq-page__header">
      <div class="faq-page__header-inner container">
        <h1 class="faq-page__title">Perguntas Frequentes</h1>
        <p class="faq-page__subtitle">Encontre respostas para as duvidas mais comuns sobre compras, pagamento, entrega e mais</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="faq-page__main container">

      <!-- Search Bar -->
      <div class="faq-page__search-wrapper">
        <div class="faq-page__search">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="faq-page__search-icon"
          >
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Buscar perguntas..."
            class="faq-page__search-input"
          />
          <button
            v-if="searchQuery"
            class="faq-page__search-clear"
            @click="searchQuery = ''"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="faq-page__tabs">
        <button
          v-for="category in categories"
          :key="category.key"
          class="faq-page__tab"
          :class="{ 'faq-page__tab--active': activeCategory === category.key }"
          @click="activeCategory = category.key"
        >
          {{ category.label }}
        </button>
      </div>

      <!-- FAQ Content -->
      <div class="faq-page__content">
        <template v-for="category in categories" :key="category.key">
          <div
            v-show="activeCategory === category.key"
            class="faq-page__category"
          >
            <div
              v-for="(item, index) in getFilteredItems(category.key)"
              :key="index"
              class="faq-page__item"
              :class="{ 'faq-page__item--open': activeQuestion === getItemKey(category.key, index) }"
            >
              <button class="faq-page__question" @click="toggleQuestion(getItemKey(category.key, index))">
                <span>{{ item.question }}</span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="faq-page__chevron"
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              <div
                class="faq-page__answer"
                :class="{ 'faq-page__answer--visible': activeQuestion === getItemKey(category.key, index) }"
              >
                <p>{{ item.answer }}</p>
              </div>
            </div>

            <!-- No results message -->
            <div
              v-if="getFilteredItems(category.key).length === 0"
              class="faq-page__empty"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
              <p>Nenhuma pergunta encontrada para "{{ searchQuery }}"</p>
            </div>
          </div>
        </template>
      </div>

      <!-- CTA: Contact Us -->
      <section class="faq-page__cta">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <h2 class="faq-page__cta-title">Nao encontrou o que procurava?</h2>
        <p class="faq-page__cta-text">
          Nossa equipe esta pronta para ajudar. Entre em contato conosco e responderemos o mais breve possivel.
        </p>
        <RouterLink to="/contato" class="faq-page__cta-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Contate-nos
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DarkVeil from '../components/common/DarkVeil.vue'

const activeCategory = ref('compras')
const activeQuestion = ref(null)
const searchQuery = ref('')

const categories = [
  { key: 'compras', label: 'Compras' },
  { key: 'pagamento', label: 'Pagamento' },
  { key: 'entrega', label: 'Entrega' },
  { key: 'trocas', label: 'Trocas' },
  { key: 'produtos', label: 'Produtos' }
]

const faqData = {
  compras: [
    {
      question: 'Como faco para realizar um pedido?',
      answer: 'Para realizar um pedido, navegue pela nossa loja, selecione os produtos desejados e adicione ao carrinho. Em seguida, clique no carrinho e siga para o checkout, onde voce informara seus dados de entrega e pagamento.'
    },
    {
      question: 'Preciso criar uma conta para comprar?',
      answer: 'Nao e obrigatorio criar uma conta, mas recomendamos. Com uma conta, voce pode acompanhar seus pedidos, salvar enderecos e aproveitar promocoes exclusivas.'
    },
    {
      question: 'Posso cancelar meu pedido apos a compra?',
      answer: 'Sim, voce pode cancelar seu pedido dentro de ate 2 horas apos a confirmacao da compra, desde que ele ainda nao tenha sido enviado para despacho. Apos esse prazo, entre em contato conosco.'
    },
    {
      question: 'Existe valor minimo para compra?',
      answer: 'Nao ha valor minimo para realizar uma compra. Voce pode adquirir qualquer produto individualmente.'
    }
  ],
  pagamento: [
    {
      question: 'Quais formas de pagamento sao aceitas?',
      answer: 'Aceitamos cartao de credito (Visa, Mastercard, Elo), cartao de debito, PIX (com confirmacao instantanea) e boleto bancario (com prazo de compensacao de ate 2 dias uteis).'
    },
    {
      question: 'O pagamento por PIX e confirmado na hora?',
      answer: 'Sim! Pagamentos via PIX sao confirmados instantaneamente e seu pedido entra em processamento imediatamente.'
    },
    {
      question: 'Posso parcelar minha compra?',
      answer: 'Sim, oferecemos parcelamento em ate 3x sem juros no cartao de credito para compras acima de R$ 50,00. Parcelamentos adicionais podem ter juros.'
    },
    {
      question: 'Meus dados de pagamento estao seguros?',
      answer: 'Absolutamente. Utilizamos criptografia SSL e seguimos as melhores praticas de seguranca para proteger todas as suas informacoes de pagamento.'
    }
  ],
  entrega: [
    {
      question: 'Qual o prazo de entrega?',
      answer: 'O prazo de entrega varia de acordo com a sua localizacao. Apos o despacho, o prazo medio e de 3 a 10 dias uteis. Voce recebera o codigo de rastreamento por e-mail.'
    },
    {
      question: 'Como rastrear meu pedido?',
      answer: 'Apos o despacho, voce recebera um e-mail com o codigo de rastreamento e o link direto para acompanhar o status da entrega.'
    },
    {
      question: 'Voces entregam em todo o Brasil?',
      answer: 'Sim, realizamos entregas em todo o territorio nacional. O frete e calculado automaticamente com base no seu CEP durante o checkout.'
    },
    {
      question: 'Qual o valor do frete?',
      answer: 'O valor do frete e calculado com base no peso dos produtos e na sua localizacao. Oferecemos frete gratis para compras acima de R$ 150,00.'
    }
  ],
  trocas: [
    {
      question: 'Como solicitar uma troca ou devolucao?',
      answer: 'Para solicitar uma troca ou devolucao, entre em contato conosco por e-mail ou WhatsApp informando o numero do pedido e o motivo da solicitacao. Responderemos em ate 24 horas.'
    },
    {
      question: 'Qual o prazo para solicitar troca?',
      answer: 'Voce tem ate 30 dias corridos apos o recebimento do produto para solicitar uma troca ou devolucao, conforme o Codigo de Defesa do Consumidor.'
    },
    {
      question: 'O produto precisa estar na embalagem original?',
      answer: 'Sim, para trocas e devolucoes, o produto deve estar em sua embalagem original, sem sinais de uso, com todos os acessorios e manuais.'
    },
    {
      question: 'Em quanto tempo recebo o reembolso?',
      answer: 'O reembolso e processado em ate 10 dias uteis apos recebermos o produto devolvido. O prazo para o valor aparecer na sua conta depende da operadora do cartao ou banco.'
    }
  ],
  produtos: [
    {
      question: 'Os produtos tem garantia?',
      answer: 'Sim, todos os nossos produtos possuem garantia contra defeitos de fabricacao. O prazo de garantia varia de acordo com o tipo de produto e sera informado na pagina de cada item.'
    },
    {
      question: 'As cores dos produtos sao fieis as fotos?',
      answer: 'Nos esforcamos para que as fotos representem fielmente as cores dos produtos, mas pequenas variacoes podem ocorrer devido a diferentes monitores e iluminacao.'
    },
    {
      question: 'Voces oferecem materiais educacionais digitais?',
      answer: 'Sim! Alem de produtos fisicos, oferecemos materiais digitais como e-books, apostilas e recursos complementares que podem ser acessados imediatamente apos a compra.'
    },
    {
      question: 'Como saber se um produto esta em estoque?',
      answer: 'Na pagina de cada produto, exibimos a disponibilidade em tempo real. Se um produto estiver fora de estoque, voce pode se cadastrar para ser notificado quando voltar.'
    }
  ]
}

function getFilteredItems(categoryKey) {
  if (!searchQuery.value) return faqData[categoryKey]
  const query = searchQuery.value.toLowerCase()
  return faqData[categoryKey].filter(
    (item) =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)
  )
}

function getItemKey(categoryKey, index) {
  return `${categoryKey}-${index}`
}

function toggleQuestion(key) {
  activeQuestion.value = activeQuestion.value === key ? null : key
}
</script>

<style scoped>
.faq-page {
  min-height: 100vh;
  background: var(--surface-1);
  position: relative;
}

/* ===== DarkVeil Background ===== */
.faq-page__veil {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.25;
  pointer-events: none;
}

/* ===== Header ===== */
.faq-page__header {
  position: relative;
  z-index: 1;
  padding: clamp(2.5rem, 6vh, 4rem) 0 clamp(1.5rem, 3vh, 2.5rem);
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, var(--surface-1) 0%, transparent 100%);
}

.faq-page__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.1;
}

.faq-page__subtitle {
  font-size: clamp(0.95rem, 1.5vw, 1.15rem);
  color: var(--text-secondary);
  margin: 0;
  max-width: 44rem;
}

/* ===== Main ===== */
.faq-page__main {
  position: relative;
  z-index: 1;
  padding: clamp(2rem, 5vh, 4rem) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 3vh, 2.5rem);
}

/* ===== Search ===== */
.faq-page__search-wrapper {
  max-width: 36rem;
}

.faq-page__search {
  position: relative;
  display: flex;
  align-items: center;
}

.faq-page__search-icon {
  position: absolute;
  left: clamp(0.75rem, 1.2vw, 1rem);
  color: var(--text-muted);
  pointer-events: none;
}

.faq-page__search-input {
  width: 100%;
  padding: clamp(0.75rem, 1.2vw, 0.875rem) clamp(2.5rem, 4vw, 3rem) clamp(0.75rem, 1.2vw, 0.875rem) clamp(2.75rem, 4.5vw, 3.25rem);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-0);
  color: var(--text-primary);
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  transition: all var(--transition-fast);
}

.faq-page__search-input::placeholder {
  color: var(--text-muted);
}

.faq-page__search-input:hover {
  border-color: var(--text-muted);
}

.faq-page__search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.faq-page__search-clear {
  position: absolute;
  right: clamp(0.625rem, 1vw, 0.875rem);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.faq-page__search-clear:hover {
  color: var(--text-primary);
  background: var(--surface-2);
}

/* ===== Tabs ===== */
.faq-page__tabs {
  display: flex;
  gap: clamp(0.375rem, 0.75vw, 0.5rem);
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border);
  padding-bottom: clamp(0.75rem, 1.5vh, 1rem);
}

.faq-page__tab {
  padding: clamp(0.5rem, 0.8vw, 0.625rem) clamp(1rem, 2vw, 1.25rem);
  border-radius: var(--radius-full);
  font-size: clamp(0.8rem, 1.2vw, 0.9rem);
  font-weight: 600;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.faq-page__tab:hover {
  color: var(--text-primary);
  background: var(--surface-2);
}

.faq-page__tab--active {
  color: var(--accent);
  background: var(--accent-subtle);
  border-color: var(--accent);
}

/* ===== FAQ Content ===== */
.faq-page__content {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.faq-page__category {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ===== FAQ Items ===== */
.faq-page__item {
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.faq-page__item--open {
  border-color: var(--accent);
}

.faq-page__question {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: clamp(0.875rem, 1.5vw, 1.125rem) clamp(1rem, 2vw, 1.25rem);
  text-align: left;
  font-size: clamp(0.9rem, 1.3vw, 1rem);
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.faq-page__question:hover {
  color: var(--accent);
}

.faq-page__chevron {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform var(--transition-base);
}

.faq-page__item--open .faq-page__chevron {
  transform: rotate(180deg);
  color: var(--accent);
}

.faq-page__answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-smooth);
}

.faq-page__answer--visible {
  max-height: 20rem;
}

.faq-page__answer p {
  padding: 0 clamp(1rem, 2vw, 1.25rem) clamp(0.875rem, 1.5vw, 1.125rem);
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* ===== Empty State ===== */
.faq-page__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: clamp(2rem, 5vh, 3rem) 1rem;
  text-align: center;
  color: var(--text-muted);
}

.faq-page__empty svg {
  opacity: 0.3;
}

.faq-page__empty p {
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  margin: 0;
}

/* ===== CTA ===== */
.faq-page__cta {
  padding: clamp(2rem, 5vh, 3.5rem) clamp(1.5rem, 3vw, 2.5rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.75rem, 1.5vh, 1.25rem);
  position: relative;
  overflow: hidden;
}

.faq-page__cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent), transparent);
  opacity: 0.5;
}

.faq-page__cta svg {
  color: var(--accent);
  opacity: 0.5;
}

.faq-page__cta-title {
  font-size: clamp(1.35rem, 2.5vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.faq-page__cta-text {
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  color: var(--text-secondary);
  max-width: 36rem;
  line-height: 1.7;
  margin: 0;
}

.faq-page__cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  padding: clamp(0.75rem, 1.2vw, 0.875rem) clamp(1.5rem, 3vw, 2rem);
  border-radius: var(--radius-md);
  border: 1px solid var(--accent);
  background: var(--accent-subtle);
  color: var(--accent);
  font-size: clamp(0.9rem, 1.3vw, 1rem);
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  text-decoration: none;
}

.faq-page__cta-button:hover {
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-colored);
  transform: translateY(-2px);
}

.faq-page__cta-button svg {
  transition: transform var(--transition-fast);
}

.faq-page__cta-button:hover svg {
  transform: scale(1.1);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .faq-page__tabs {
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .faq-page__tabs::-webkit-scrollbar {
    display: none;
  }

  .faq-page__cta {
    padding: clamp(1.5rem, 4vh, 2.5rem) clamp(1rem, 2vw, 1.5rem);
  }
}

@media (max-width: 480px) {
  .faq-page__tab {
    padding: clamp(0.4rem, 0.6vw, 0.5rem) clamp(0.75rem, 1.5vw, 1rem);
    font-size: clamp(0.75rem, 1.1vw, 0.85rem);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .faq-page__answer {
    transition: none;
  }

  .faq-page__cta-button,
  .faq-page__chevron,
  .faq-page__item {
    transition: none;
  }

  .faq-page__cta-button:hover {
    transform: none;
  }
}
</style>
