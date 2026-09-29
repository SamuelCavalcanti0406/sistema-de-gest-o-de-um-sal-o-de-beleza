const getDb = require('../config/db');

class ContabilRepository {
  async obterEntradasMes(mes, ano) {
    const db = await getDb();
    const query = `
      SELECT 
        a.id, 
        a.data_hora_inicio, 
        a.valor_final,
        c.nome as cliente_nome,
        p.nome as profissional_nome,
        s.nome as servico_nome
      FROM agendamentos a
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN profissionais p ON a.profissional_id = p.id
      LEFT JOIN servicos s ON a.servico_id = s.id
      WHERE a.status = 'Concluido e pago'
      AND strftime('%m', a.data_hora_inicio) = ? 
      AND strftime('%Y', a.data_hora_inicio) = ?
      ORDER BY a.data_hora_inicio ASC
    `;
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoFormatado = ano.toString();
    return await db.all(query, [mesFormatado, anoFormatado]);
  }

  async obterSaidasMes(mes, ano) {
    const db = await getDb();
    const query = `
      SELECT 
        pc.id, 
        pc.data_pagamento, 
        pc.valor_total,
        pc.porcentagem_aplicada,
        p.nome as profissional_nome
      FROM pagamentos_comissao pc
      LEFT JOIN profissionais p ON pc.id_profissional = p.id
      WHERE strftime('%m', pc.data_pagamento) = ? 
      AND strftime('%Y', pc.data_pagamento) = ?
      ORDER BY pc.data_pagamento ASC
    `;
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoFormatado = ano.toString();
    return await db.all(query, [mesFormatado, anoFormatado]);
  }

  async obterResumoMes(mes, ano) {
    const db = await getDb();
    const mesFormatado = mes.toString().padStart(2, '0');
    const anoFormatado = ano.toString();

    const entradasQuery = `
      SELECT SUM(valor_final) as total_entradas, COUNT(id) as qtd_atendimentos
      FROM agendamentos
      WHERE status = 'Concluido e pago'
      AND strftime('%m', data_hora_inicio) = ? 
      AND strftime('%Y', data_hora_inicio) = ?
    `;
    const saidasQuery = `
      SELECT SUM(valor_total) as total_saidas
      FROM pagamentos_comissao
      WHERE strftime('%m', data_pagamento) = ? 
      AND strftime('%Y', data_pagamento) = ?
    `;

    const entradasResult = await db.all(entradasQuery, [mesFormatado, anoFormatado]);
    const saidasResult = await db.all(saidasQuery, [mesFormatado, anoFormatado]);

    return {
      totalEntradas: entradasResult[0]?.total_entradas || 0,
      quantidadeAtendimentos: entradasResult[0]?.qtd_atendimentos || 0,
      totalSaidas: saidasResult[0]?.total_saidas || 0
    };
  }
}

module.exports = new ContabilRepository();
