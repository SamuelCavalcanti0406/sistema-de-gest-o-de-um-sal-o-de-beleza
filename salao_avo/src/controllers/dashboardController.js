const dashboardService = require('../services/dashboardService');

class DashboardController {
    async obterResumo(req, res) {
        try {
            const metricas = await dashboardService.obterResumo();
            res.status(200).json(metricas);
        } catch (error) {
            console.log('Erro ao carregar dashboard:', error);
            res.status(500).json({ error: 'erro interno do servidor alguém tem que ver isso ai!' });
        }
    }
}
module.exports = new DashboardController();