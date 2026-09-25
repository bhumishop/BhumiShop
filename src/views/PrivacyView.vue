<template>
  <div class="privacy-page">
    <div class="privacy-page__header">
      <h1>Politica de Privacidade</h1>
      <p class="subtitle">Como coletamos, usamos e protegemos seus dados pessoais</p>
      <p class="last-updated">Ultima atualizacao: Setembro de 2026</p>
    </div>

    <div class="privacy-page__content">
      <section>
        <h2>1. Introducao</h2>
        <p>A Bhumisparsha School ("nos", "nossa") esta comprometida com a protecao da sua privacidade e dos seus dados pessoais. Esta Politica de Privacidade explica como coletamos, usamos, armazenamos e compartilhamos suas informacoes, em conformidade com a Lei Geral de Protecao de Dados (LGPD - Lei n 13.709/2018) e com as politicas de uso de APIs do Google aplicaveis ao nosso aplicativo.</p>
        <p>Esta politica se aplica ao site BhumiShop, ao entrar em contato conosco e, especialmente, ao usar o recurso "Entrar com Google" para acessar sua conta. Ao utilizar nossos servicos, voce concorda com as praticas descritas aqui.</p>
      </section>

      <section>
        <h2>2. Dados que Coletamos</h2>
        <h3>2.1 Dados fornecidos por voce</h3>
        <ul>
          <li>Nome completo</li>
          <li>Endereco de e-mail</li>
          <li>CPF (para emissao de nota fiscal)</li>
          <li>Numero de telefone (WhatsApp)</li>
          <li>Endereco completo (CEP, rua, numero, complemento, bairro, cidade, estado)</li>
        </ul>

        <h3>2.2 Dados obtidos atraves do "Entrar com Google" (OAuth)</h3>
        <p>Quando voce usa o login com Google, recebemos do Google apenas os seguintes dados da sua conta Google:</p>
        <ul>
          <li>Seu endereco de e-mail da conta Google</li>
          <li>Seu nome exibido (perfil)</li>
          <li>Sua foto de perfil (avatar), quando disponivel</li>
          <li>Seu identificador unico da conta Google (usado apenas para vincular sua sessao)</li>
        </ul>
        <p>Solicitamos somente os escopos minimos necessarios: <strong>openid</strong>, <strong>email</strong>, <strong>profile</strong> e <strong>userinfo.email</strong>. Nao solicitamos, nao acessamos e nao armazenamos outros dados da sua conta Google (como seus contatos, drive, calendario, historico de navegacao ou qualquer outro servico do Google).</p>

        <h3>2.3 Dados coletados automaticamente</h3>
        <ul>
          <li>Endereco IP</li>
          <li>Tipo de navegador e dispositivo</li>
          <li>Paginas visitadas e tempo de navegacao</li>
          <li>Historico de compras e carrinho</li>
          <li>Localizacao aproximada (via IP)</li>
        </ul>
      </section>

      <section>
        <h2>3. Como Funciona o Login com Google</h2>
        <p>O "Entrar com Google" utiliza o padrao OAuth 2.0 / OpenID Connect por meio do Supabase. O processo e o seguinte:</p>
        <ul>
          <li>Voce clica em "Continuar com Google" e e redirecionado para a pagina de consentimento do Google</li>
          <li>O Google exibe os dados que nosso aplicativo solicita e voce decide autorizar ou nao</li>
          <li>Apos autorizar, o Google nos devolve apenas os dados descritos na secao 2.2</li>
          <li>Voce pode revogar essa autorizacao a qualquer momento em <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">https://myaccount.google.com/permissions</a></li>
        </ul>
        <p>O uso de APIs do Google por nosso aplicativo tambem esta sujeito aos <a href="https://developers.google.com/terms" target="_blank" rel="noopener noreferrer">Termos de Servico das APIs do Google</a> e a <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" rel="noopener noreferrer">Politica de Dados do Usuario dos Servicos de API do Google</a>, cujas exigencias de "Uso Limitado" (Limited Use) adotamos integralmente conforme descrito na secao 6.</p>
      </section>

      <section>
        <h2>4. Como Usamos Seus Dados</h2>
        <table class="data-table">
          <thead>
            <tr><th>Finalidade</th><th>Base Legal</th></tr>
          </thead>
          <tbody>
            <tr><td>Autenticar sua conta e permitir o login</td><td>Execucao de contrato</td></tr>
            <tr><td>Processar pedidos e pagamentos</td><td>Execucao de contrato</td></tr>
            <tr><td>Entregar produtos no endereco informado</td><td>Execucao de contrato</td></tr>
            <tr><td>Enviar confirmacoes e atualizacoes de pedido</td><td>Execucao de contrato</td></tr>
            <tr><td>Melhorar nossos servicos e experiencia</td><td>Legitimo interesse</td></tr>
            <tr><td>Enviar comunicacoes de marketing (com consentimento)</td><td>Consentimento</td></tr>
            <tr><td>Cumprir obrigacoes legais</td><td>Obrigacao legal</td></tr>
          </tbody>
        </table>
        <p>Os dados obtidos do Google sao usados exclusivamente para fornecer e melhorar as funcionalidades visiveis deste aplicativo - em particular, para identificar voce e manter sua sessao iniciada. Nao usamos dados do Google para finalidades diferentes das descritas nesta politica.</p>
      </section>

      <section>
        <h2>5. Compartilhamento de Dados</h2>
        <p>Compartilhamos seus dados apenas com:</p>
        <ul>
          <li><strong>Supabase:</strong> autenticacao e armazenamento seguro da conta</li>
          <li><strong>Google:</strong> exclusivamente no fluxo de login descrito na secao 3 (nos nao enviamos seus dados de volta ao Google para outros fins)</li>
          <li><strong>Gateways de pagamento:</strong> AbacatePay, MercadoPago - para processar pagamentos de forma segura</li>
          <li><strong>Transportadoras:</strong> Para entrega dos produtos</li>
          <li><strong>Parceiros de fulfillment:</strong> UmaPenca, UICLAP - quando o produto e enviado diretamente por eles</li>
          <li><strong>Autoridades:</strong> Quando exigido por lei</li>
        </ul>
        <p>Nao vendemos seus dados pessoais nem os dados obtidos do Google a terceiros.</p>
      </section>

      <section>
        <h2>6. Uso Limitado de Dados do Google (Limited Use)</h2>
        <p>Em conformidade com a Politica de Dados do Usuario dos Servicos de API do Google, nos comprometemos a:</p>
        <ul>
          <li>Usar os dados do Google apenas para fornecer ou melhorar funcionalidades visiveis ao usuario neste aplicativo;</li>
          <li><strong>Nao transferir</strong> os dados do Google para terceiros, exceto: (a) para fornecer ou melhorar as funcionalidades visiveis deste aplicativo, com o seu consentimento; (b) por razoes de seguranca (investigacao de abuso); (c) para cumprir a lei aplicavel; ou (d) em caso de fusao, aquisicao ou venda de ativos, com consentimento previo explicito;</li>
          <li><strong>Nao permitir que humanos leiam</strong> os dados do Google, exceto: (a) com o seu consentimento afirmativo para visualizar dados especificos; (b) quando necessario para seguranca (investigacao de bug ou abuso); (c) quando necessario para cumprir a lei; ou (d) quando os dados forem agregados e usados para operacoes internas, de acordo com as exigencias legais;</li>
          <li><strong>Nao vender, transferir nem usar</strong> os dados do Google para publicidade, incluindo anuncios personalizados, retargeting ou baseados em interesses;</li>
          <li><strong>Nao transferir, vender nem usar</strong> os dados do Google para determinar credito ou para fins de emprestimo;</li>
          <li><strong>Nao usar</strong> os dados do Google para desenvolver, melhorar ou treinar modelos de IA/ML nao personalizados;</li>
          <li>Manter nossos funcionarios, agentes e sucessores obrigados por estas mesmas restricoes.</li>
        </ul>
      </section>

      <section>
        <h2>7. Seguranca</h2>
        <p>Utilizamos medidas tecnicas e organizacionais adequadas para proteger seus dados pessoais, incluindo:</p>
        <ul>
          <li>Conexao HTTPS (criptografia em transito)</li>
          <li>Armazenamento seguro no Supabase (criptografia em repouso)</li>
          <li>Controle de acesso restrito aos dados</li>
          <li>Monitoramento de atividades suspeitas</li>
        </ul>
      </section>

      <section>
        <h2>8. Retencao e Exclusao de Dados</h2>
        <p>Mantemos seus dados pessoais apenas pelo tempo necessario para cumprir as finalidades descritas nesta politica, respeitando os prazos legais applicaveis (ex: 5 anos para registros fiscais).</p>
        <p>Para excluir sua conta e os dados associados a ela, entre em contato pelo e-mail indicado na secao 12. Apos a exclusao, removemos seus dados pessoais, salvo as informacoes que precisarmos manter por obrigacao legal ou legitimo interesse (ex: registros fiscais). A revogacao do acesso do Google pode ser feita a qualquer momento em <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer">https://myaccount.google.com/permissions</a>, mas nao exclui a conta ja criada em nosso site - para isso, solicite a exclusao pelo e-mail de contato.</p>
      </section>

      <section>
        <h2>9. Seus Direitos (LGPD)</h2>
        <p>Voce tem direito a:</p>
        <ul>
          <li><strong>Acesso:</strong> Solicitar uma copia dos seus dados</li>
          <li><strong>Correcao:</strong> Retificar dados incompletos, inexatos ou desatualizados</li>
          <li><strong>Exclusao:</strong> Pedir a eliminacao dos seus dados</li>
          <li><strong>Portabilidade:</strong> Transferir seus dados para outro fornecedor</li>
          <li><strong>Revogacao:</strong> Retirar o consentimento a qualquer momento</li>
          <li><strong>Oposicao:</strong> Opor-se ao tratamento para determinadas finalidades</li>
        </ul>
        <p>Para exercer seus direitos, entre em contato pelo e-mail: <strong>bhumishop.adm@gmail.com</strong></p>
      </section>

      <section>
        <h2>10. Cookies</h2>
        <p>Utilizamos cookies e tecnologias similares para:</p>
        <ul>
          <li>Manter sua sessao ativa (carrinho, login)</li>
          <li>Lembrar suas preferencias (idioma, tema)</li>
          <li>Analisar o uso do site para melhorias</li>
        </ul>
      </section>

      <section>
        <h2>11. Alteracoes nesta Politica</h2>
        <p>Podemos atualizar esta politica periodicamente. Caso mudemos a forma como usamos os dados obtidos do Google, notificaremos voce e pediremos novo consentimento antes de usar os dados de uma forma nova ou diferente daqui descrita, conforme exigem as politicas do Google. Alteracoes significativas tambem serao comunicadas por e-mail ou aviso no site.</p>
      </section>

      <section>
        <h2>12. Contato</h2>
        <p>Para duvidas sobre esta politica ou seus dados pessoais:</p>
        <p><strong>E-mail:</strong> bhumishop.adm@gmail.com</p>
        <p>Links obrigatorios da configuracao do OAuth: a Politica de Privacidade e os Termos de Servico estao hospedados neste dominio (shop.bhumisparshaschool.org), acessiveis na homepage e vinculados a tela de consentimento do OAuth do Google, conforme as Politicas de OAuth 2.0 do Google.</p>
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

.privacy-page__content a {
  color: var(--accent);
  text-decoration: underline;
  word-break: break-word;
}

.privacy-page__content a:hover {
  color: var(--accent-light, var(--accent));
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
