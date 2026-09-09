const getDb = require('../config/db');

class ProfissionalRepository {
    async listarTodos(){
        const db = await getDb();
        return await db.all('SELECT id, nome, telefone, especialidade, percentual_comissao, ativo FROM profissionais ORDER BY nome ASC');
    }
    async criar (profissional) {
        const db = await getDb();
        const { nome, telefone, especialidade, percentual_comissao } = profissional;
        const resultado = await db.run(
            'INSERT INTO profissionais (nome, telefone, especialidade, percentual_comissao) VALUES (?, ?, ?, ?)',
            [nome, telefone, especialidade, percentual_comissao  || 0.00]
        );
        return resultado.lastID;
    }
    async atualizar(id, profissional) {
        const db = await getDb();
        const { nome, telefone, especialidade, percentual_comissao, ativo } = profissional;
        await db.run(
            'UPDATE profissionais SET nome = ?, telefone = ?, especialidade = ?, percentual_comissao = ?, ativo = ? WHERE id = ?',
            [nome, telefone, especialidade, percentual_comissao, ativo, id]
        );
    }   
    async deletar(id) {
        const db = await getDb();
        await db.run('DELETE FROM profissionais WHERE id = ?', [id]);
    }
}
module.exports = new ProfissionalRepository();
