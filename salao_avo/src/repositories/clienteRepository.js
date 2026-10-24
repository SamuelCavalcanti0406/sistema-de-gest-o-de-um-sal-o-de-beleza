const getDb = require('../config/db');

class ClienteRepository {
    async listarTodos() {
        const db = await getDb();
        const linhas = await db.all('SELECT id, nome, telefone, observacoes_alergias FROM clientes ORDER BY nome ASC');
        return linhas;
    }

    async buscarPorTelefone(telefone) {
        const db = await getDb();
        const alvo = String(telefone || '').replace(/\D/g, '');
        if (!alvo) return null;

        const linhas = await db.all('SELECT id, nome, telefone FROM clientes');
        return linhas.find((linha) => {
            let numero = String(linha.telefone || '').replace(/\D/g, '');
            if (!numero) return false;
            const comDdi = numero.startsWith('55') ? numero : `55${numero}`;
            const alvoComDdi = alvo.startsWith('55') ? alvo : `55${alvo}`;
            return numero === alvo || comDdi === alvoComDdi;
        }) || null;
    }

    async criar(cliente) {
        const db = await getDb();
        const { nome, telefone, observacoes_alergias } = cliente;
        const resultado = await db.run(
            'INSERT INTO clientes (nome, telefone, observacoes_alergias) VALUES (?, ?, ?)',
            [nome, telefone, observacoes_alergias]
        );
        
        return resultado.lastID; 
    }
    //update
    async atualizar(id, cliente) {
        const db = await getDb();
        const {nome, telefone, observacoes_alergias} = cliente;

        await db.run(
            'UPDATE clientes SET nome = ?, telefone = ?, observacoes_alergias = ? WHERE id = ?',
            [nome, telefone, observacoes_alergias, id]
        )
    }
        //delete
    async deletar(id, cliente) {
        const db = await getDb();
        await db.run(
            'DELETE FROM clientes WHERE id = ?',[id]
        )
    }
}
module.exports = new ClienteRepository();