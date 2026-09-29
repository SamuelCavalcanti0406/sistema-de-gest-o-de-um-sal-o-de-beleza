const getDb = require('../config/db');

class ComissaoRepository {
    async listarAgendamentosPendentes(id_profissional, data_fechamento) {
        const db = await getDb();
        return await db.all(`
            SELECT a.id, a.data_hora_inicio, a.valor_final, s.nome as servico_nome, p.percentual_comissao
            FROM agendamentos a
            JOIN servicos s ON a.servico_id = s.id
            JOIN profissionais p ON a.profissional_id = p.id
            WHERE a.profissional_id = ? 
              AND a.status = 'Concluido e pago' 
              AND a.status_pagamento_comissao = 'pendente'
              AND date(a.data_hora_inicio) <= date(?)
            ORDER BY a.data_hora_inicio ASC
        `, [id_profissional, data_fechamento]);
    }

    async registrarPagamento(id_profissional, valor_total, data_fechamento, porcentagem_aplicada) {
        const db = await getDb();
        const resultado = await db.run(`
            INSERT INTO pagamentos_comissao (id_profissional, valor_total, periodo_fim, porcentagem_aplicada)
            VALUES (?, ?, ?, ?)
        `, [id_profissional, valor_total, data_fechamento, porcentagem_aplicada]);
        return resultado.lastID;
    }

    async marcarAgendamentosComoPagos(id_profissional, data_fechamento, id_pagamento) {
        const db = await getDb();
        await db.run(`
            UPDATE agendamentos
            SET status_pagamento_comissao = 'pago',
                id_pagamento = ?
            WHERE profissional_id = ?
              AND status = 'Concluido e pago'
              AND status_pagamento_comissao = 'pendente'
              AND date(data_hora_inicio) <= date(?)
        `, [id_pagamento, id_profissional, data_fechamento]);
    }
}

module.exports = new ComissaoRepository();
