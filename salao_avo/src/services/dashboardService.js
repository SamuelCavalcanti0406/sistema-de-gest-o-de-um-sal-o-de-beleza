const dashboardRepository = require('../repositories/dashboardRepository');

class DashboardService {
    async obterResumo() {
        return await dashboardRepository.obterResumo();
    }
}
module.exports = new DashboardService();