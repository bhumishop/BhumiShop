<template>
  <div class="shipping-page">
    <div class="shipping-page__header">
      <h1>Politica de Envio</h1>
      <p class="subtitle">Informacoes sobre entrega, prazos e transportadoras</p>
      <p class="last-updated">Ultima atualizacao: Abril de 2026</p>
    </div>

    <div class="shipping-page__content">
      <section>
        <h2>1. Prazo de Processamento</h2>
        <p>Apos a confirmacao do pagamento:</p>
        <ul>
          <li><strong>Produtos proprios:</strong> Processamento em ate 2 dias uteis</li>
          <li><strong>Produtos personalizados (UmaPenca):</strong> Processamento em ate 5 dias uteis</li>
          <li><strong>Livros (UICLAP):</strong> Processamento em ate 3 dias uteis</li>
        </ul>
        <p>O prazo de entrega comeca a contar apos o processamento.</p>
      </section>

      <section>
        <h2>2. Prazos de Entrega</h2>
        <p>Os prazos variam conforme a regiao:</p>
        <table class="shipping-table">
          <thead>
            <tr><th>Regiao</th><th>Prazo Estimado</th></tr>
          </thead>
          <tbody>
            <tr><td>Sudeste</td><td>3-7 dias uteis</td></tr>
            <tr><td>Sul</td><td>5-10 dias uteis</td></tr>
            <tr><td>Centro-Oeste</td><td>7-12 dias uteis</td></tr>
            <tr><td>Nordeste</td><td>7-15 dias uteis</td></tr>
            <tr><td>Norte</td><td>10-20 dias uteis</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>3. Transportadoras</h2>
        <p>Trabalhamos com as seguintes transportadoras:</p>
        <ul>
          <li>Correios (PAC e SEDEX)</li>
          <li>Transportadoras parceiras (para regioes metropolitanas)</li>
          <li>Transportadora do parceiro (para produtos UmaPenca/UICLAP)</li>
        </ul>
        <p>A transportadora sera definida no momento do checkout conforme seu CEP.</p>
      </section>

      <section>
        <h2>4. Frete Gratis</h2>
        <p>Oferecemos frete gratis para compras acima de um valor minimo (consulte a promocao vigente no site).</p>
      </section>

      <section>
        <h2>5. Como Rastrear seu Pedido</h2>
        <p>Apos o envio, voce recebera:</p>
        <ul>
          <li>E-mail com o codigo de rastreamento</li>
          <li>Link direto para acompanhamento</li>
          <li>Atualizacoes em "Minhas Compras" no site</li>
        </ul>
      </section>

      <section>
        <h2>6. O que Acontecer se Nao Receber</h2>
        <p>Se o prazo de entrega for excedido:</p>
        <ol>
          <li>Entre em contato conosco com o numero do pedido</li>
          <li>Verificaremos o status com a transportadora</li>
          <li>Se o pacote for considerado extraviado, enviaremos um novo ou processaremos o reembolso</li>
        </ol>
      </section>

      <section>
        <h2>7. Reentrega</h2>
        <p>Se a entrega nao for realizada na primeira tentativa:</p>
        <ul>
          <li>A transportadora tentara uma segunda entrega</li>
          <li>Se nao for possivel, o pacote retornara ao remetente</li>
          <li>Voce podera combinar uma nova entrega ou solicitar reembolso</li>
        </ul>
      </section>

      <section>
        <h2>8. Enderecos de Entrega</h2>
        <p>Entregamos em todo o Brasil. O endereco deve ser:</p>
        <ul>
          <li>Completo (com CEP, rua, numero, bairro, cidade, estado)</li>
          <li>Valido e acessivel</li>
          <li>Preferencialmente com ponto de referencia</li>
        </ul>
        <p>Nao nos responsabilizamos por entregas em enderecos incorretos informados pelo comprador.</p>
      </section>

      <section>
        <h2>9. Contato</h2>
        <p>Para duvidas sobre envio:</p>
        <p><strong>E-mail:</strong> contact-email-placeholder<br>
        <strong>WhatsApp:</strong> whatsapp-number-placeholder</p>
      </section>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.shipping-page {
  min-height: 100vh;
  background: var(--surface-1);
  padding: clamp(2rem, 5vh, 4rem) 0;
}

.shipping-page__header {
  max-width: 48rem;
  margin: 0 auto clamp(2rem, 4vh, 3rem);
  padding: 0 clamp(1rem, 3vw, 1.5rem);
  text-align: center;
}

.shipping-page__header h1 {
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

.shipping-page__content {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 1.5rem);
}

.shipping-page__content section {
  margin-bottom: clamp(2rem, 4vh, 3rem);
  padding-bottom: clamp(1.5rem, 3vh, 2rem);
  border-bottom: 1px solid var(--border);
}

.shipping-page__content section:last-child {
  border-bottom: none;
}

.shipping-page__content h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 1rem;
}

.shipping-page__content p {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.shipping-page__content ul,
.shipping-page__content ol {
  margin: 0 0 1rem 1.5rem;
  padding: 0;
}

.shipping-page__content li {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.shipping-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
}

.shipping-table th,
.shipping-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border: 1px solid var(--border);
}

.shipping-table th {
  background: var(--surface-0);
  color: var(--accent);
  font-weight: 600;
}

.shipping-table td {
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .shipping-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
