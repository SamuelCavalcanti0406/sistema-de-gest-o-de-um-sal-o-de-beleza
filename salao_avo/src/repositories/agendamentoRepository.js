const getDb = require('../config/db');

class AgendamentoRepository {
    async listarTodos() {
        const db = await getDb();
        const query = `
            SELECT 
                a.id, 
                a.data_hora_inicio, 
                a.data_hora_fim,
                a.status, 
                a.valor_final,
                a.observacoes,
                c.nome AS cliente_nome, 
                p.nome AS profissional_nome, 
                s.nome AS servico_nome
            FROM agendamentos a
            LEFT JOIN clientes c ON a.cliente_id = c.id
            LEFT JOIN profissionais p ON a.profissional_id = p.id
            LEFT JOIN servicos s ON a.servico_id = s.id
            ORDER BY a.data_hora_inicio ASC
        `;
        return await db.all(query);
    }
    async criar(agendamento) {
        const db = await getDb();
        const { cliente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, valor_final, observacoes } = agendamento;
        
        const resultado = await db.run(
            `INSERT INTO agendamentos 
            (cliente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, valor_final, observacoes) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [cliente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, valor_final, observacoes]
        );
        return resultado.lastID;
    }
    async atualizarStatus(id, status) {
        const db = await getDb();
        await db.run('UPDATE agendamentos SET status = ? WHERE id = ?', [status, id]);
    }
    async deletar(id) {
        const db = await getDb();
        await db.run('DELETE FROM agendamentos WHERE id = ?', [id]);
    }
}
module.exports = new AgendamentoRepository();