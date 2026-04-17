<template>
  <div class="about-page">
    <!-- DarkVeil Background -->
    <div class="about-page__veil">
      <DarkVeil :hue-shift="260" :noise-intensity="0.03" :scanline-intensity="0.05" :speed="0.3" />
    </div>

    <!-- Hero Header -->
    <div class="about-page__header">
      <div class="about-page__header-inner container">
        <h1 class="about-page__title">Sobre a Bhumisparsha School</h1>
        <p class="about-page__subtitle">Conheca a nossa historia, missao e a equipe por tras do projeto</p>
      </div>
    </div>

    <!-- Main Content -->
    <div class="about-page__main container">

      <!-- History Section -->
      <section class="about-page__section">
        <div class="about-page__section-header">
          <span class="about-page__section-badge">Historia</span>
          <h2 class="about-page__section-title">Como tudo comecou</h2>
        </div>
        <div class="about-page__section-content">
          <p class="about-page__text">
            A Bhumisparsha School nasceu da visao de criar um espaco educacional que une
            conhecimento tradicional com inovacao tecnologica. Inspirada pelo gesto de
            Bhumisparsha -- o toque na terra como testemunho da iluminacao -- a escola
            busca enraizar cada aluno em valores solidos enquanto abre portas para o
            futuro digital.
          </p>
          <p class="about-page__text">
            O projeto BhumiShop foi criado como uma extensao pratica dessa missao,
            oferecendo produtos educacionais e materiais que complementam a experiencia
            de aprendizado, sempre com qualidade e acessibilidade.
          </p>
        </div>
      </section>

      <!-- Mission, Vision, Values -->
      <section class="about-page__section">
        <div class="about-page__section-header">
          <span class="about-page__section-badge">Fundamentos</span>
          <h2 class="about-page__section-title">Missao, Visao e Valores</h2>
        </div>
        <div class="about-page__mvv-grid">
          <!-- Mission Card -->
          <div class="about-page__mvv-card">
            <div class="about-page__mvv-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </div>
            <h3 class="about-page__mvv-title">Missao</h3>
            <p class="about-page__mvv-description">
              Proporcionar educacao acessivel e de qualidade, combinando sabedoria
              ancestral com ferramentas modernas para formar cidadaos preparados
              para os desafios do seculo XXI.
            </p>
          </div>

          <!-- Vision Card -->
          <div class="about-page__mvv-card">
            <div class="about-page__mvv-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 class="about-page__mvv-title">Visao</h3>
            <p class="about-page__mvv-description">
              Ser referencia em educacao inovadora, reconhecida por transformar
              vidas atraves do conhecimento e por construir uma comunidade de
              aprendizado colaborativa e inclusiva.
            </p>
          </div>

          <!-- Values Card -->
          <div class="about-page__mvv-card">
            <div class="about-page__mvv-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3 class="about-page__mvv-title">Valores</h3>
            <ul class="about-page__mvv-list">
              <li>Integridade e transparencia</li>
              <li>Inovacao continua</li>
              <li>Inclusao e acessibilidade</li>
              <li>Respeito a diversidade</li>
              <li>Compromisso com a excelencia</li>
            </ul>
          </div>
        </div>
      </section>

      <!-- Team Section -->
      <section class="about-page__section">
        <div class="about-page__section-header">
          <span class="about-page__section-badge">Equipe</span>
          <h2 class="about-page__section-title">Quem faz acontecer</h2>
        </div>
        <div class="about-page__team-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <p class="about-page__team-text">
            Nossa equipe esta crescendo! Em breve, conheca as pessoas incriveis
            que fazem a Bhumisparsha School acontecer todos os dias.
          </p>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="about-page__cta">
        <h2 class="about-page__cta-title">Explore nossos produtos</h2>
        <p class="about-page__cta-text">
          Descubra materiais educacionais, kits e recursos criados especialmente
          para complementar sua jornada de aprendizado.
        </p>
        <RouterLink to="/produtos" class="about-page__cta-button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          Ver Produtos
        </RouterLink>
      </section>
    </div>
  </div>
</template>

<script setup>
import DarkVeil from '../components/common/DarkVeil.vue'
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: var(--surface-1);
  position: relative;
}

/* ===== DarkVeil Background ===== */
.about-page__veil {
  position: fixed;
  inset: 0;
  z-index: 0;
  opacity: 0.25;
  pointer-events: none;
}

/* ===== Header ===== */
.about-page__header {
  position: relative;
  z-index: 1;
  padding: clamp(2.5rem, 6vh, 4rem) 0 clamp(1.5rem, 3vh, 2.5rem);
  border-bottom: 1px solid var(--border);
  background: linear-gradient(180deg, var(--surface-1) 0%, transparent 100%);
}

.about-page__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  line-height: 1.1;
}

.about-page__subtitle {
  font-size: clamp(0.95rem, 1.5vw, 1.15rem);
  color: var(--text-secondary);
  margin: 0;
  max-width: 40rem;
}

/* ===== Main ===== */
.about-page__main {
  position: relative;
  z-index: 1;
  padding: clamp(2rem, 5vh, 4rem) 0;
  display: flex;
  flex-direction: column;
  gap: clamp(2.5rem, 5vh, 4rem);
}

/* ===== Sections ===== */
.about-page__section {
  display: flex;
  flex-direction: column;
  gap: clamp(1.25rem, 2.5vh, 2rem);
}

.about-page__section-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about-page__section-badge {
  font-size: clamp(0.65rem, 1vw, 0.75rem);
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.about-page__section-title {
  font-size: clamp(1.5rem, 3vw, 2.25rem);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin: 0;
  line-height: 1.2;
}

.about-page__section-content {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vh, 1.5rem);
}

.about-page__text {
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  color: var(--text-secondary);
  line-height: 1.75;
  margin: 0;
  max-width: 52rem;
}

/* ===== MVV Grid ===== */
.about-page__mvv-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: clamp(1rem, 2.5vw, 1.5rem);
}

.about-page__mvv-card {
  padding: clamp(1.25rem, 2.5vw, 2rem);
  background: var(--surface-0);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 1.5vw, 1rem);
  transition: all var(--transition-base);
}

.about-page__mvv-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow-colored);
  transform: translateY(-2px);
}

.about-page__mvv-icon {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  background: var(--accent-subtle);
  color: var(--accent);
}

.about-page__mvv-title {
  font-size: clamp(1.1rem, 2vw, 1.35rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
}

.about-page__mvv-description {
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}

.about-page__mvv-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about-page__mvv-list li {
  font-size: clamp(0.85rem, 1.2vw, 0.95rem);
  color: var(--text-secondary);
  padding-left: 1.25rem;
  position: relative;
  line-height: 1.6;
}

.about-page__mvv-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.55rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.7;
}

/* ===== Team Placeholder ===== */
.about-page__team-placeholder {
  padding: clamp(2.5rem, 6vh, 4rem) clamp(1.5rem, 3vw, 2rem);
  background: var(--surface-0);
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(1rem, 2vh, 1.5rem);
  text-align: center;
}

.about-page__team-placeholder svg {
  color: var(--text-muted);
  opacity: 0.4;
}

.about-page__team-text {
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  color: var(--text-muted);
  max-width: 32rem;
  line-height: 1.7;
  margin: 0;
}

/* ===== CTA Section ===== */
.about-page__cta {
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

.about-page__cta::before {
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

.about-page__cta-title {
  font-size: clamp(1.35rem, 2.5vw, 2rem);
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.02em;
}

.about-page__cta-text {
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  color: var(--text-secondary);
  max-width: 36rem;
  line-height: 1.7;
  margin: 0;
}

.about-page__cta-button {
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

.about-page__cta-button:hover {
  background: var(--accent);
  color: white;
  box-shadow: var(--shadow-colored);
  transform: translateY(-2px);
}

.about-page__cta-button svg {
  transition: transform var(--transition-fast);
}

.about-page__cta-button:hover svg {
  transform: scale(1.1);
}

/* ===== Responsive ===== */
@media (max-width: 1024px) {
  .about-page__mvv-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .about-page__mvv-grid {
    grid-template-columns: 1fr;
  }

  .about-page__cta {
    padding: clamp(1.5rem, 4vh, 2.5rem) clamp(1rem, 2vw, 1.5rem);
  }
}

@media (max-width: 480px) {
  .about-page__mvv-card {
    padding: clamp(1rem, 3vw, 1.25rem);
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .about-page__mvv-card,
  .about-page__cta-button {
    transition: none;
  }

  .about-page__mvv-card:hover {
    transform: none;
  }

  .about-page__cta-button:hover {
    transform: none;
  }
}
</style>
