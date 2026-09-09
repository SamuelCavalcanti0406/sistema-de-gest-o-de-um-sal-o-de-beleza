const agendamentoRepository = require('../repositories/agendamentoRepository');
class AgendamentoService {
    async listarTodos() {
        return await agendamentoRepository.listarTodos();
    }
    async criar(agendamento) {
        if (!agendamento.cliente_id || !agendamento.profissional_id || !agendamento.servico_id) {
            throw new Error("IDs do cliente, profissional e serviço são obrigatórios.");
        }
        if (!agendamento.data_hora_inicio || !agendamento.data_hora_fim) {
            throw new Error("As datas e horários de início e fim são obrigatórios.");
        }
        return await agendamentoRepository.criar(agendamento);
    }
    async atualizarStatus(id, status) {
        if (!id) throw new Error("O ID do agendamento é obrigatório.");
        
        const statusPermitidos = ['Pendente', 'Confirmado', 'Concluido e pago', 'Cancelado'];
        if (!statusPermitidos.includes(status)) {
            throw new Error("Status inválido.");
        }
        await agendamentoRepository.atualizarStatus(id, status);
    }

    async deletar(id) {
        if (!id) throw new Error("O ID do agendamento é obrigatório.");
        await agendamentoRepository.deletar(id);
    }
}
module.exports = new AgendamentoService();