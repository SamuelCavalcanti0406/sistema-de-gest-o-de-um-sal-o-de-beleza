const getDb = require('../config/db');

class DashboardRepository {
    async obterResumo() {
        const db = await getDb();
        const query = `
            SELECT 
                COUNT(*) as total_agendamentos,
                COALESCE(SUM(valor_final), 0) as faturamento_total
            FROM agendamentos
            WHERE status = 'Confirmado'
        `;
        const resultado = await db.all(query);
        // Retornamos a primeira linha, que contém os totais
        return resultado[0];
    }
}
module.exports = new DashboardRepository();