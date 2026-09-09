const getDb = require('../config/db');

class ServicoRepository {
    async listarTodos() {
        const db = await getDb();
        return await db.all('SELECT id, nome, descricao, preco_base, duracao_minutos FROM servicos ORDER BY nome ASC');
    }
    async criar(servico) {
        const db = await getDb();
        const { nome, descricao, preco_base, duracao_minutos } = servico;
        
        const resultado = await db.run(
            'INSERT INTO servicos (nome, descricao, preco_base, duracao_minutos) VALUES (?, ?, ?, ?)',
            [nome, descricao, preco_base, duracao_minutos]
        );
        return resultado.lastID;
    }
    async atualizar(id, servico) {
        const db = await getDb();
        const { nome, descricao, preco_base, duracao_minutos } = servico;
        
        await db.run(
            'UPDATE servicos SET nome = ?, descricao = ?, preco_base = ?, duracao_minutos = ? WHERE id = ?',
            [nome, descricao, preco_base, duracao_minutos, id]
        );
    }
    async deletar(id) {
        const db = await getDb();
        await db.run('DELETE FROM servicos WHERE id = ?', [id]);
    }
}
module.exports = new ServicoRepository();