const { createClient } = require('@libsql/client');
require('dotenv').config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});

async function run() {
    try {
        console.log("Running batch migration...");
        await client.batch([
            "ALTER TABLE agendamentos RENAME TO agendamentos_old;",
            `CREATE TABLE agendamentos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cliente_id INTEGER NOT NULL,
                profissional_id INTEGER NOT NULL,
                servico_id INTEGER NOT NULL,
                data_hora_inicio DATETIME NOT NULL,
                data_hora_fim DATETIME NOT NULL,
                status TEXT CHECK(status IN ('Pendente', 'Confirmado', 'Concluido e pago', 'Cancelado')) DEFAULT 'Pendente',
                valor_final REAL NOT NULL,
                observacoes TEXT, 
                status_pagamento_comissao TEXT DEFAULT 'pendente', 
                id_pagamento INTEGER REFERENCES pagamentos_comissao(id),
                FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
                FOREIGN KEY (profissional_id) REFERENCES profissionais(id) ON DELETE RESTRICT,
                FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE RESTRICT
            );`,
            `INSERT INTO agendamentos (
                id, cliente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, status, valor_final, observacoes, status_pagamento_comissao, id_pagamento
            )
            SELECT 
                id, cliente_id, profissional_id, servico_id, data_hora_inicio, data_hora_fim, 
                CASE WHEN status = 'Concluido' THEN 'Concluido e pago' ELSE status END as status, 
                valor_final, observacoes, status_pagamento_comissao, id_pagamento
            FROM agendamentos_old;`,
            "DROP TABLE agendamentos_old;"
        ], 'write');

        console.log("Migration complete!");
    } catch(e) {
        console.error(e);
    }
}
run();
