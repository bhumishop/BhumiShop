<template>
  <div class="terms-page">
    <div class="terms-page__header">
      <h1>Termos de Servico</h1>
      <p class="subtitle">Leia atentamente antes de utilizar nossos servicos</p>
      <p class="last-updated">Ultima atualizacao: Abril de 2026</p>
    </div>

    <div class="terms-page__content">
      <section>
        <h2>1. Aceitacao dos Termos</h2>
        <p>Ao acessar e utilizar o site da Bhumisparsha School ("BhumiShop"), voce concorda com estes Termos de Servico. Se nao concordar com algum termo, nao utilize nossos servicos.</p>
      </section>

      <section>
        <h2>2. Elegibilidade</h2>
        <p>Para realizar compras em nosso site, voce deve:</p>
        <ul>
          <li>Ser maior de 18 anos ou ter autorizacao de responsavel legal</li>
          <li>Fornecer informacoes verdadeiras e atualizadas</li>
          <li>Utilizar formas de pagamento validas</li>
        </ul>
      </section>

      <section>
        <h2>3. Produtos e Servicos</h2>
        <p>Oferecemos produtos proprios e de parceiros:</p>
        <ul>
          <li><strong>Produtos proprios:</strong> Camisetas, posters, acessorios produzidos por nos</li>
          <li><strong>Produtos de parceiros:</strong> Livros (UICLAP), produtos personalizados (UmaPenca)</li>
        </ul>
        <p>Nos reservamos o direito de modificar, suspender ou descontinuar qualquer produto sem previo aviso.</p>
      </section>

      <section>
        <h2>4. Precos e Pagamento</h2>
        <p>Todos os precos estao em Reais (BRL) e incluem impostos quando aplicavel. Aceitamos:</p>
        <ul>
          <li>PIX (via AbacatePay ou MercadoPago)</li>
          <li>Cartao de credito e debito (via MercadoPago ou AbacatePay)</li>
          <li>Boleto bancario (via MercadoPago ou AbacatePay)</li>
        </ul>
        <p>O pagamento deve ser efetuado no ato da compra. Pedidos nao pagos serao cancelados automaticamente.</p>
      </section>

      <section>
        <h2>5. Entrega</h2>
        <p>Os prazos de entrega variam conforme:</p>
        <ul>
          <li>Tipo de produto (proprio ou parceiro)</li>
          <li>Destino (regiao do Brasil)</li>
          <li>Metodo de envio selecionado</li>
        </ul>
        <p>O prazo de entrega e estimado e pode variar conforme condicoes logisicas. Nao nos responsabilizamos por atrasos causados por transportadoras ou fatores de forca maior.</p>
      </section>

      <section>
        <h2>6. Direito de Arrependimento</h2>
        <p>Em conformidade com o Art. 49 do Codigo de Defesa do Consumidor, voce tem o prazo de 7 (sete) dias corridos, a contar da data de recebimento do produto, para desistir da compra, sem necessidade de justificativa.</p>
        <p>Para exercer este direito, entre em contato conosco e devolva o produto em sua embalagem original.</p>
      </section>

      <section>
        <h2>7. Trocas e Devolucoes</h2>
        <p><strong>Produto com defeito:</strong> Voce tem ate 30 dias (produtos nao duraveis) ou 90 dias (produtos duraveis) para solicitar troca ou devolucao.</p>
        <p><strong>Troca por tamanho:</strong> Aceitamos troca por tamanho diferente, desde que o produto esteja sem uso e na embalagem original. O frete de devoluacao e por conta do comprador.</p>
      </section>

      <section>
        <h2>8. Garantia</h2>
        <p>Todos os produtos possuem garantia legal contra defeitos de fabricacao. A garantia nao cobre:</p>
        <ul>
          <li>Desgaste natural pelo uso</li>
          <li>Danos causados por uso inadequado</li>
          <li>Alteracoes feitas pelo comprador</li>
        </ul>
      </section>

      <section>
        <h2>9. Limitacao de Responsabilidade</h2>
        <p>Nos responsabilizamos pelos produtos que vendemos diretamente. Para produtos de parceiros (UmaPenca, UICLAP), atuamos como intermediarios e auxiliaremos na resolucao de eventuais problemas.</p>
        <p>Nao nos responsabilizamos por danos indiretos, lucros cessantes ou danos emergentes.</p>
      </section>

      <section>
        <h2>10. Propriedade Intelectual</h2>
        <p>Todos os conteudos do site (textos, imagens, logos, designs) sao de propriedade da Bhumisparsha School ou de seus licenciantes. E proibida a reproducao sem autorizacao previa.</p>
      </section>

      <section>
        <h2>11. Rescisao</h2>
        <p>Podemos suspender ou encerrar seu acesso ao site em caso de violacao destes termos, sem previo aviso.</p>
      </section>

      <section>
        <h2>12. Lei Aplicavel</h2>
        <p>Estes termos sao regidos pela legislacao brasileira. Questoes nao resolvidas serao submetidas ao foro da comarca correspondente.</p>
      </section>

      <section>
        <h2>13. Contato</h2>
        <p>Para duvidas sobre estes termos:</p>
        <p><strong>E-mail:</strong> contact-email-placeholder<br>
        <strong>WhatsApp:</strong> whatsapp-number-placeholder</p>
      </section>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.terms-page {
  min-height: 100vh;
  background: var(--surface-1);
  padding: clamp(2rem, 5vh, 4rem) 0;
}

.terms-page__header {
  max-width: 48rem;
  margin: 0 auto clamp(2rem, 4vh, 3rem);
  padding: 0 clamp(1rem, 3vw, 1.5rem);
  text-align: center;
}

.terms-page__header h1 {
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

.terms-page__content {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 1.5rem);
}

.terms-page__content section {
  margin-bottom: clamp(2rem, 4vh, 3rem);
  padding-bottom: clamp(1.5rem, 3vh, 2rem);
  border-bottom: 1px solid var(--border);
}

.terms-page__content section:last-child {
  border-bottom: none;
}

.terms-page__content h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 1rem;
}

.terms-page__content h3 {
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.25rem 0 0.5rem;
}

.terms-page__content p {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.terms-page__content ul {
  margin: 0 0 1rem 1.5rem;
  padding: 0;
}

.terms-page__content li {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

@media (max-width: 640px) {
  .terms-page__content h2 {
    font-size: clamp(1.1rem, 3vw, 1.25rem);
  }
}
</style>
