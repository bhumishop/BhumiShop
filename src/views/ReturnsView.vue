<template>
  <div class="returns-page">
    <div class="returns-page__header">
      <h1>Trocas e Devolucoes</h1>
      <p class="subtitle">Seus direitos e como solicitar troca ou devolucao</p>
      <p class="last-updated">Ultima atualizacao: Abril de 2026</p>
    </div>

    <div class="returns-page__content">
      <section class="highlight">
        <h2>Direito de Arrependimento (7 dias)</h2>
        <p>Conforme o <strong>Art. 49 do Codigo de Defesa do Consumidor</strong>, voce tem o prazo de <strong>7 (sete) dias corridos</strong>, a partir da data de recebimento do produto ou da contratacao do servico, para desistir da compra, sem necessidade de justificativa.</p>
        <p>Para exercer este direito, entre em contato conosco e devolva o produto em sua embalagem original. O reembolso sera processado em ate 10 dias uteis.</p>
      </section>

      <section>
        <h2>Como Solicitar uma Troca ou Devolucao</h2>
        <ol>
          <li>Entre em contato por <strong>e-mail</strong> ou <strong>WhatsApp</strong> informando o numero do pedido e o motivo</li>
          <li>Nossa equipe avaliara sua solicitacao em ate <strong>2 dias uteis</strong></li>
          <li>Se aprovada, enviaremos as instrucoes para devolucao</li>
          <li>Apos recebermos o produto, processaremos a troca ou reembolso</li>
        </ol>
      </section>

      <section>
        <h2>Troca por Defeito</h2>
        <p>Se o produto apresentar defeito de fabricacao:</p>
        <ul>
          <li><strong>Produtos nao duraveis:</strong> ate 30 dias para solicitar</li>
          <li><strong>Produtos duraveis:</strong> ate 90 dias para solicitar</li>
        </ul>
        <p>O frete de devoluacao sera por nossa conta. Voce pode optar por:</p>
        <ul>
          <li>Troca pelo mesmo produto (se disponivel)</li>
          <li>Troca por produto de valor equivalente</li>
          <li>Reembolso integral</li>
        </ul>
      </section>

      <section>
        <h2>Troca por Tamanho</h2>
        <p>Para camisetas e itens de vestuario, aceitamos troca por tamanho diferente:</p>
        <ul>
          <li>O produto deve estar <strong>sem uso</strong> e na <strong>embalagem original</strong></li>
          <li>O <strong>frete de devolucao e por conta do comprador</strong></li>
          <li>O <strong>frete do novo produto e por nossa conta</strong></li>
          <li>Solicitacoes devem ser feitas em ate <strong>15 dias</strong> apos o recebimento</li>
        </ul>
      </section>

      <section>
        <h2>Produtos de Parceiros (UmaPenca / UICLAP)</h2>
        <p>Para produtos enviados diretamente por nossos parceiros:</p>
        <ul>
          <li>O processo de troca/devolucao e feito diretamente com o parceiro</li>
          <li>Voce pode nos contatar para auxiliar no processo</li>
          <li>As politicas especificas podem variar conforme o parceiro</li>
        </ul>
      </section>

      <section>
        <h2>Reembolso</h2>
        <p>O reembolso sera processado utilizando o mesmo metodo de pagamento:</p>
        <ul>
          <li><strong>PIX:</strong> Reembolso via PIX em ate 10 dias uteis</li>
          <li><strong>Cartao de credito:</strong> Estorno na fatura em ate 2 ciclos</li>
          <li><strong>Boleto:</strong> Deposito em conta informada em ate 10 dias uteis</li>
        </ul>
      </section>

      <section>
        <h2>Condicoes para Devolucao</h2>
        <p>O produto deve ser devolvido:</p>
        <ul>
          <li>Na embalagem original (se aplicavel)</li>
          <li>Sem sinais de uso</li>
          <li>Com todos os acessorios e manuais</li>
          <li>Acompanhado da nota fiscal</li>
        </ul>
      </section>

      <section>
        <h2>Contato</h2>
        <p>Para solicitar troca ou devolucao:</p>
        <p><strong>E-mail:</strong> contact-email-placeholder<br>
        <strong>WhatsApp:</strong> whatsapp-number-placeholder<br>
        <strong>Horario:</strong> Segunda a Sexta, 9h as 18h</p>
      </section>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.returns-page {
  min-height: 100vh;
  background: var(--surface-1);
  padding: clamp(2rem, 5vh, 4rem) 0;
}

.returns-page__header {
  max-width: 48rem;
  margin: 0 auto clamp(2rem, 4vh, 3rem);
  padding: 0 clamp(1rem, 3vw, 1.5rem);
  text-align: center;
}

.returns-page__header h1 {
  font-size: clamp(1.75rem, 4vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.subtitle {
  font-size: clamp(1rem, 2vw, 1.125rem);
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
}

.last-updated {
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
  color: var(--text-muted);
  margin: 0;
}

.returns-page__content {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 1.5rem);
}

.returns-page__content section {
  margin-bottom: clamp(2rem, 4vh, 3rem);
  padding-bottom: clamp(1.5rem, 3vh, 2rem);
  border-bottom: 1px solid var(--border);
}

.returns-page__content section:last-child {
  border-bottom: none;
}

.returns-page__content h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 1rem;
}

.returns-page__content p {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.returns-page__content ul,
.returns-page__content ol {
  margin: 0 0 1rem 1.5rem;
  padding: 0;
}

.returns-page__content li {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.highlight {
  background: var(--accent-subtle);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md, 0.375rem);
  padding: 1.25rem;
}

.highlight h2 {
  color: var(--accent);
  margin-top: 0;
}

.highlight p:last-child {
  margin-bottom: 0;
}

@media (max-width: 640px) {
  .returns-page__content h2 {
    font-size: clamp(1.1rem, 3vw, 1.25rem);
  }
}
</style>
