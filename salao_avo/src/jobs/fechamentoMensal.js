const cron = require('node-cron');
const contabilService = require('../services/contabilService');

async function executarFechamento() {
  const hoje = new Date();
  let mes = hoje.getMonth() + 1;
  let ano = hoje.getFullYear();

  if (mes === 1) {
    mes = 12;
    ano -= 1;
  } else {
    mes -= 1;
  }

  try {
    console.log(`[Job Fechamento] Iniciando fechamento para ${mes}/${ano}...`);

    const dados = await contabilService.gerarDadosMensais(mes, ano);
    console.log('[Job Fechamento] Dados obtidos com sucesso.');

    const planilhaPath = await contabilService.gerarPlanilha(dados, mes, ano);
    console.log(`[Job Fechamento] Planilha gerada em: ${planilhaPath}`);

    const analiseIA = await contabilService.gerarAnaliseIA(dados, mes, ano);
    console.log('[Job Fechamento] Análise IA gerada.');

    await contabilService.enviarEmail(planilhaPath, analiseIA, mes, ano);
    console.log('[Job Fechamento] E-mail enviado com sucesso.');

    console.log('[Job Fechamento] Processo concluído.');
  } catch (error) {
    console.error('[Job Fechamento] Erro durante o processo:', error);
  }
}

function iniciarJob() {
  cron.schedule('50 23 28-31 * *', async () => {
    const hoje = new Date();
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();

    if (hoje.getDate() !== ultimoDia) {
      return;
    }

    await executarFechamento();
  });
  console.log('[Job Fechamento] Agendado para rodar no último dia de cada mês às 23:50.');
}

module.exports = {
  iniciarJob,
  executarFechamento
};
