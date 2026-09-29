const { createClient } = require('@libsql/client');
require('dotenv').config();

async function migrate() {
    const client = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN
    });

    try {
        console.log('Iniciando migração: adicionando porcentagem_aplicada em pagamentos_comissao...');
        await client.execute(`
            ALTER TABLE pagamentos_comissao
            ADD COLUMN porcentagem_aplicada REAL;
        `);
        console.log('Coluna porcentagem_aplicada adicionada com sucesso!');
    } catch (error) {
        if (error.message && error.message.includes('duplicate column name')) {
            console.log('A coluna porcentagem_aplicada já existe. Nenhuma ação necessária.');
        } else {
            console.error('Erro ao adicionar coluna:', error);
        }
    } finally {
        client.close();
    }
}

migrate();
