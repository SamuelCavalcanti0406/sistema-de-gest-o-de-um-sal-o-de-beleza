const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
    try {
        console.log("Creating pagamentos_comissao...");
        await client.execute(`
            CREATE TABLE IF NOT EXISTS pagamentos_comissao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                id_profissional INTEGER NOT NULL,
                data_pagamento DATETIME DEFAULT CURRENT_TIMESTAMP,
                valor_total REAL NOT NULL,
                periodo_inicio DATETIME,
                periodo_fim DATETIME NOT NULL,
                FOREIGN KEY (id_profissional) REFERENCES profissionais(id) ON DELETE RESTRICT
            )
        `);

        console.log("Altering agendamentos...");
        // Check if columns exist first (SQLite doesn't have ADD COLUMN IF NOT EXISTS in all versions, 
        // but we can try adding and catch if they already exist)
        try {
            await client.execute(`ALTER TABLE agendamentos ADD COLUMN status_pagamento_comissao TEXT DEFAULT 'pendente'`);
        } catch(e) { console.log("status_pagamento_comissao already exists or error: " + e.message); }
        
        try {
            await client.execute(`ALTER TABLE agendamentos ADD COLUMN id_pagamento INTEGER REFERENCES pagamentos_comissao(id)`);
        } catch(e) { console.log("id_pagamento already exists or error: " + e.message); }

        console.log("Migration complete!");
    } catch(e) {
        console.error(e);
    }
}
run();
