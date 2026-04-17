<template>
  <div class="privacy-page">
    <div class="privacy-page__header">
      <h1>Politica de Privacidade</h1>
      <p class="subtitle">Como coletamos, usamos e protegemos seus dados pessoais</p>
      <p class="last-updated">Ultima atualizacao: Abril de 2026</p>
    </div>

    <div class="privacy-page__content">
      <section>
        <h2>1. Introducao</h2>
        <p>A Bhumisparsha School ("nos", "nossa") esta comprometida com a protecao da sua privacidade e dos seus dados pessoais. Esta Politica de Privacidade explica como coletamos, usamos, armazenamos e compartilhamos suas informacoes, em conformidade com a Lei Geral de Protecao de Dados (LGPD - Lei n 13.709/2018).</p>
      </section>

      <section>
        <h2>2. Dados Coletados</h2>
        <h3>2.1 Dados fornecidos por voce</h3>
        <ul>
          <li>Nome completo</li>
          <li>Endereco de e-mail</li>
          <li>CPF (para emissao de nota fiscal)</li>
          <li>Numero de telefone (WhatsApp)</li>
          <li>Endereco completo (CEP, rua, numero, complemento, bairro, cidade, estado)</li>
        </ul>

        <h3>2.2 Dados coletados automaticamente</h3>
        <ul>
          <li>Endereco IP</li>
          <li>Tipo de navegador e dispositivo</li>
          <li>Paginas visitadas e tempo de navegacao</li>
          <li>Historico de compras e carrinho</li>
          <li>Localizacao aproximada (via IP)</li>
        </ul>
      </section>

      <section>
        <h2>3. Como Usamos Seus Dados</h2>
        <table class="data-table">
          <thead>
            <tr><th>Finalidade</th><th>Base Legal</th></tr>
          </thead>
          <tbody>
            <tr><td>Processar pedidos e pagamentos</td><td>Execucao de contrato</td></tr>
            <tr><td>Entregar produtos no endereco informado</td><td>Execucao de contrato</td></tr>
            <tr><td>Enviar confirmacoes e atualizacoes de pedido</td><td>Execucao de contrato</td></tr>
            <tr><td>Melhorar nossos servicos e experiencia</td><td>Legitimo interesse</td></tr>
            <tr><td>Enviar comunicacoes de marketing (com consentimento)</td><td>Consentimento</td></tr>
            <tr><td>Cumprir obrigacoes legais</td><td>Obrigacao legal</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Compartilhamento de Dados</h2>
        <p>Compartilhamos seus dados apenas com:</p>
        <ul>
          <li><strong>Gateways de pagamento:</strong> AbacatePay, MercadoPago - para processar pagamentos de forma segura</li>
          <li><strong>Transportadoras:</strong> Para entrega dos produtos</li>
          <li><strong>Parceiros de fulfillment:</strong> UmaPenca, UICLAP - quando o produto e enviado diretamente por eles</li>
          <li><strong>Autoridades:</strong> Quando exigido por lei</li>
        </ul>
      </section>

      <section>
        <h2>5. Seguranca</h2>
        <p>Utilizamos medidas tecnicas e organizacionais adequadas para proteger seus dados pessoais, incluindo:</p>
        <ul>
          <li>Conexao HTTPS (criptografia em transito)</li>
          <li>Armazenamento seguro no Supabase (criptografia em repouso)</li>
          <li>Controle de acesso restrito aos dados</li>
          <li>Monitoramento de atividades suspeitas</li>
        </ul>
      </section>

      <section>
        <h2>6. Seus Direitos (LGPD)</h2>
        <p>Voce tem direito a:</p>
        <ul>
          <li><strong>Acesso:</strong> Solicitar uma copia dos seus dados</li>
          <li><strong>Correcao:</strong> Retificar dados incompletos, inexatos ou desatualizados</li>
          <li><strong>Exclusao:</strong> Pedir a eliminacao dos seus dados</li>
          <li><strong>Portabilidade:</strong> Transferir seus dados para outro fornecedor</li>
          <li><strong>Revogacao:</strong> Retirar o consentimento a qualquer momento</li>
          <li><strong>Oposicao:</strong> Opor-se ao tratamento para determinadas finalidades</li>
        </ul>
        <p>Para exercer seus direitos, entre em contato pelo e-mail: <strong>contact-email-placeholder</strong></p>
      </section>

      <section>
        <h2>7. Cookies</h2>
        <p>Utilizamos cookies e tecnologias similares para:</p>
        <ul>
          <li>Manter sua sessao ativa (carrinho, login)</li>
          <li>Lembrar suas preferencias (idioma, tema)</li>
          <li>Analisar o uso do site para melhorias</li>
        </ul>
      </section>

      <section>
        <h2>8. Retencao de Dados</h2>
        <p>Mantemos seus dados pessoais apenas pelo tempo necessario para cumprir as finalidades descritas nesta politica, respeitando os prazos legais applicaveis (ex: 5 anos para registros fiscais).</p>
      </section>

      <section>
        <h2>9. Alteracoes nesta Politica</h2>
        <p>Podemos atualizar esta politica periodicamente. Alteracoes significativas serao comunicadas por e-mail ou aviso no site.</p>
      </section>

      <section>
        <h2>10. Contato</h2>
        <p>Para duvidas sobre esta politica ou seus dados pessoais:</p>
        <p><strong>E-mail:</strong> contact-email-placeholder<br>
        <strong>WhatsApp:</strong> whatsapp-number-placeholder</p>
      </section>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: var(--surface-1);
  padding: clamp(2rem, 5vh, 4rem) 0;
}

.privacy-page__header {
  max-width: 48rem;
  margin: 0 auto clamp(2rem, 4vh, 3rem);
  padding: 0 clamp(1rem, 3vw, 1.5rem);
  text-align: center;
}

.privacy-page__header h1 {
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

.privacy-page__content {
  max-width: 48rem;
  margin: 0 auto;
  padding: 0 clamp(1rem, 3vw, 1.5rem);
}

.privacy-page__content section {
  margin-bottom: clamp(2rem, 4vh, 3rem);
  padding-bottom: clamp(1.5rem, 3vh, 2rem);
  border-bottom: 1px solid var(--border);
}

.privacy-page__content section:last-child {
  border-bottom: none;
}

.privacy-page__content h2 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--accent);
  margin: 0 0 1rem;
}

.privacy-page__content h3 {
  font-size: clamp(1rem, 2vw, 1.125rem);
  font-weight: 600;
  color: var(--text-primary);
  margin: 1.25rem 0 0.5rem;
}

.privacy-page__content p {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.privacy-page__content ul {
  margin: 0 0 1rem 1.5rem;
  padding: 0;
}

.privacy-page__content li {
  font-size: clamp(0.875rem, 1.5vw, 1rem);
  line-height: 1.7;
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: clamp(0.8rem, 1.5vw, 0.9rem);
}

.data-table th,
.data-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border: 1px solid var(--border);
}

.data-table th {
  background: var(--surface-0);
  color: var(--accent);
  font-weight: 600;
}

.data-table td {
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .data-table {
    display: block;
    overflow-x: auto;
  }
}
</style>
