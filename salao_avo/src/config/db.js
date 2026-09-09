//Turso é pica 
//esse pasta se conecta com o banco de dados Turso e adapta as funções para que o código antigo continue funcionando sem mudanças significativas. O arquivo exporta uma função getDb() que retorna um objeto com os métodos all() e run(), que são usados para executar consultas SQL e manipular os resultados de forma compatível com o código existente.
const { createClient } = require('@libsql/client');
require('dotenv').config();
//Conecta com o Turso usando as chaves secretas do .env
const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});
//Adapter: Traduz o formato de resposta do Turso para o formato que seu código antigo já espera
const dbConfig = {
    // Substitui o db.all()
    all: async (sql, params = []) => {
        const result = await client.execute({ sql, args: params });
        return result.rows; // O Turso joga os dados em 'rows'
    },
    run: async (sql, params = []) => {
        const result = await client.execute({ sql, args: params });    
        return { lastID: result.lastInsertRowid ? result.lastInsertRowid.toString() : null };
    }
};
const getDb = async () => {
    return dbConfig;
};
module.exports = getDb;