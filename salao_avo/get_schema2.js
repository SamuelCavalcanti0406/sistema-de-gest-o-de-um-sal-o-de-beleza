const { createClient } = require('@libsql/client');
require('dotenv').config();
const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN
});
client.execute("SELECT sql FROM sqlite_master WHERE type='table';").then(res => console.log(res.rows.map(r => r.sql).join('\n---\n')));
