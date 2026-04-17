<template>
  <div class="contact-page">
    <!-- DarkVeil Background -->
    <div class="contact-page__veil">
      <DarkVeil :hue-shift="260" :noise-intensity="0.03" :scanline-intensity="0.05" :speed="0.3" />
    </div>

    <!-- Hero Header -->
    <div class="contact-page__header">
      <div class="contact-page__header-inner container">
        <h1 class="contact-page__title">Contato</h1>
        <p class="contact-page__subtitle">Envie sua mensagem ou entre em contato diretamente conosco</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="contact-page__main container">
      <div class="contact-page__layout">

        <!-- Contact Form (Left Column) -->
        <div class="contact-page__form-wrapper">
          <form class="contact-page__form" @submit.prevent>
            <h2 class="contact-page__form-title">Envie uma mensagem</h2>

            <!-- Name -->
            <div class="contact-page__field">
              <label for="contact-name" class="contact-page__label">Nome</label>
              <input
                id="contact-name"
                type="text"
                class="contact-page__input"
                placeholder="Seu nome completo"
              />
            </div>

            <!-- Email -->
            <div class="contact-page__field">
              <label for="contact-email" class="contact-page__label">E-mail</label>
              <input
                id="contact-email"
                type="email"
                class="contact-page__input"
                placeholder="seu@email.com"
              />
            </div>

            <!-- Subject -->
            <div class="contact-page__field">
              <label for="contact-subject" class="contact-page__label">Assunto</label>
              <select id="contact-subject" class="contact-page__input contact-page__select">
                <option value="" disabled selected>Selecione um assunto</option>
                <option value="duvida">Duvida sobre produtos</option>
                <option value="pedido">Informacoes sobre pedido</option>
                <option value="troca">Troca ou devolucao</option>
                <option value="parceria">Parceria ou colaboracao</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <!-- Message -->
            <div class="contact-page__field">
              <label for="contact-message" class="contact-page__label">Mensagem</label>
              <textarea
                id="contact-message"
                class="contact-page__input contact-page__textarea"
                placeholder="Escreva sua mensagem aqui..."
                rows="5"
              ></textarea>
            </div>

            <!-- Submit -->
            <button type="submit" class="contact-page__submit">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Enviar Mensagem
            </button>
          </form>
        </div>

        <!-- Contact Info (Right Column) -->
        <div class="contact-page__info-wrapper">
          <div class="contact-page__info">
            <h2 class="contact-page__info-title">Informacoes de contato</h2>

            <!-- Email -->
            <div class="contact-page__info-item">
              <div class="contact-page__info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <div class="contact-page__info-content">
                <span class="contact-page__info-label">E-mail</span>
                <a href="mailto:contato@bhumisparsha.school" class="contact-page__info-value">
                  contato@bhumisparsha.school
                </a>
              </div>
            </div>

            <!-- WhatsApp -->
            <div class="contact-page__info-item">
              <div class="contact-page__info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <div class="contact-page__info-content">
                <span class="contact-page__info-label">WhatsApp</span>
                <a href="#" class="contact-page__info-value">+55 (00) 00000-0000</a>
              </div>
            </div>

            <!-- Instagram -->
            <div class="contact-page__info-item">
              <div class="contact-page__info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </div>
              <div class="contact-page__info-content">
                <span class="contact-page__info-label">Instagram</span>
                <a href="#" class="contact-page__info-value" target="_blank" rel="noopener noreferrer">
                  @bhumisparsha.school
                </a>
              </div>
            </div>
          </div>

          <!-- Decorative accent card -->
          <div class="contact-page__hours">
            <h3 class="contact-page__hours-title">Horario de atendimento</h3>
            <ul class="contact-page__hours-list">
              <li>
                <span>Segunda - Sexta</span>
                <span class="contact-page__hours-value">9:00 - 18:00</span>
              </li>
              <li>
                <span>Sabado</span>
                <span class="contact-page__hours-value">9:00 - 13:00</span>
              </li>
              <li>
                <span>Domingo</span>
                <span class="contact-page__hours-value">Fechado</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- FAQ Accordion -->
      <section class="contact-page__faq">
        <div class="contact-page__faq-header">
          <span class="contact-page__faq-badge">FAQ</span>
          <h2 class="contact-page__faq-title">Perguntas frequentes</h2>
        </div>
        <div class="contact-page__faq-list">
          <div
            v-for="(item, index) in faqItems"
            :key="index"
            class="contact-page__faq-item"
            :class="{ 'contact-page__faq-item--open': activeFaq === index }"
          >
            <button class="contact-page__faq-question" @click="toggleFaq(index)">
              <span>{{ item.question }}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="contact-page__faq-chevron"
              >
                <polyline :points="activeFaq === index ? '6 9 12 15 18 9' : '6 9 12 15 18 9'"/>
              </svg>
            </button>
            <div
              class="contact-page__faq-answer"
              :class="{ 'contact-page__faq-answer--visible': activeFaq === index }"
            >
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DarkVeil from '../components/common/DarkVeil.vue'

const activeFaq = ref(null)

const faqItems = [
  {
    question: 'Como faco para realizar um pedido?',
    answer: 'Navegue pela nossa loja, selecione os produtos desejados, adicione ao carrinho e siga para o checkout. Voce pode finalizar a compra com diversas opcoes de pagamento.'
  },
  {
    question: 'Quais sao as formas de pagamento aceitas?',
    answer: 'Aceitamos cartao de credito, cartao de debito, PIX e boleto bancario. Todas as transacoes sao processadas de forma segura.'
  },
  {
    question: 'Qual o prazo de entrega?',
    answer: 'O prazo de entrega varia de acordo com a sua localizacao. Geralmente, enviamos em ate 2 dias uteis e a entrega leva de 3 a 10 dias uteis, dependendo da regiao.'
  },
  {
    question: 'Posso trocar ou devolver um produto?',
    answer: 'Sim! Voce tem ate 30 dias apos o recebimento para solicitar uma troca ou devolucao. O produto deve estar em sua embalagem original e sem sinais de uso.'
  }
]

function toggleFaq(index) {
  activeFaq.value = activeFaq.value === index ? null : index
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--surface-1);
  position: relative;
}

/* ===== DarkVeil Background ===== */
.contact-page__veil {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.25;
  pointer-events: none;
}

/* ===== Header ===== */
.contact-page__header {
  position: relative;
  z-index: 1;
  padding: clamp(2.5rem, 6vh, 4rem) 0 clamp(1.5rem, 3vh, 2.5rem);
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, var(--surface-1) 0%, transparent 100%);
}

.contact-page__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.1;
}

.contact-page__subtitle {
  font-size: clamp(0.95rem, 1.5vw, 1.15rem);
  color: var(--text-secondary);
  margin: 0;
  max-width: 40rem;
}

/* ===== Main ===== */
.contact-page__main {
  position: relative;
  z-index: 1;
  padding: clamp(2rem, 5vh, 4rem) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 5vh, 4rem);
}

/* ===== Two-Column Layout ===== */
.contact-page__layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: clamp(1.5rem, 3vw, 2.5rem);
  align-items: start;
}

/* ===== Form ===== */
.contact-page__form-wrapper {
  padding: clamp(1.5rem, 3vw, 2.25rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.contact-page__form {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vh, 1.5rem);
}

.contact-page__form-title {
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem;
  letter-spacing: -0.02em;
}

.contact-page__field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.contact-page__label {
  font-size: clamp(0.75rem, 1vw, 0.85rem);
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.contact-page__input {
  padding: clamp(0.625rem, 1vw, 0.875rem) clamp(0.75rem, 1.2vw, 1rem);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface-1);
  color: var(--text-primary);
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  transition: all var(--transition-fast);
}

.contact-page__input::placeholder {
  color: var(--text-muted);
}

.contact-page__input:hover {
  border-color: var(--text-muted);
}

.contact-page__input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}

.contact-page__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  cursor: pointer;
}

.contact-page__textarea {
  resize: vertical;
  min-height: 8rem;
}

.contact-page__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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
  align-self: flex-start;
}

.contact-page__submit:hover {
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-colored);
  transform: translateY(-2px);
}

.contact-page__submit svg {
  transition: transform var(--transition-fast);
}

.contact-page__submit:hover svg {
  transform: translateX(2px);
}

/* ===== Contact Info ===== */
.contact-page__info-wrapper {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vh, 1.5rem);
}

.contact-page__info {
  padding: clamp(1.5rem, 3vw, 2rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2vh, 1.75rem);
}

.contact-page__info-title {
  font-size: clamp(1.15rem, 2vw, 1.35rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.contact-page__info-item {
  display: flex;
  align-items: flex-start;
  gap: clamp(0.75rem, 1.5vw, 1rem);
}

.contact-page__info-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--accent-subtle);
  color: var(--accent);
  flex-shrink: 0;
}

.contact-page__info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.contact-page__info-label {
  font-size: clamp(0.7rem, 1vw, 0.8rem);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.contact-page__info-value {
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  color: var(--text-primary);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.contact-page__info-value:hover {
  color: var(--accent);
}

/* ===== Hours Card ===== */
.contact-page__hours {
  padding: clamp(1.25rem, 2.5vw, 1.75rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.contact-page__hours-title {
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 clamp(0.75rem, 1.5vh, 1rem);
  letter-spacing: -0.01em;
}

.contact-page__hours-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.contact-page__hours-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: clamp(0.8rem, 1.2vw, 0.9rem);
  color: var(--text-secondary);
  padding-bottom: 0.625rem;
  border-bottom: 1px solid var(--border);
}

.contact-page__hours-list li:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.contact-page__hours-value {
  font-family: var(--font-mono);
  font-size: clamp(0.75rem, 1.1vw, 0.85rem);
  font-weight: 600;
  color: var(--text-primary);
}

/* ===== FAQ ===== */
.contact-page__faq {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vh, 1.5rem);
}

.contact-page__faq-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-page__faq-badge {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.contact-page__faq-title {
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.contact-page__faq-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-page__faq-item {
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.contact-page__faq-item--open {
  border-color: var(--accent);
}

.contact-page__faq-question {
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

.contact-page__faq-question:hover {
  color: var(--accent);
}

.contact-page__faq-chevron {
  flex-shrink: 0;
  color: var(--text-muted);
  transition: transform var(--transition-base);
}

.contact-page__faq-item--open .contact-page__faq-chevron {
  transform: rotate(180deg);
  color: var(--accent);
}

.contact-page__faq-answer {
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-smooth);
}

.contact-page__faq-answer--visible {
  max-height: 20rem;
}

.contact-page__faq-answer p {
  padding: 0 clamp(1rem, 2vw, 1.25rem) clamp(0.875rem, 1.5vw, 1.125rem);
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .contact-page__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .contact-page__submit {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .contact-page__info-item {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .contact-page__faq-answer {
    transition: none;
  }

  .contact-page__submit,
  .contact-page__faq-chevron,
  .contact-page__faq-item {
    transition: none;
  }

  .contact-page__submit:hover {
    transform: none;
  }
}
</style>
