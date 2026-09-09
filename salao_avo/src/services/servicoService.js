const servicoRepository = require('../repositories/servicoRepository');

class ServicoService {
    async listarTodos() {
        return await servicoRepository.listarTodos();
    }
    async criar(servico) {
        if (!servico.nome || !servico.preco_base || !servico.duracao_minutos) {
            throw new Error("Nome, preço base e duração em minutos são obrigatórios.");
        }
        if (servico.preco_base < 0 || servico.duracao_minutos <= 0) {
            throw new Error("Preço deve ser positivo e a duração deve ser maior que zero.");
        }
        return await servicoRepository.criar(servico);
    }
    async atualizar(id, servico) {
        if (!id) throw new Error("O ID do serviço é obrigatório.");
        if (!servico.nome || !servico.preco_base || !servico.duracao_minutos) {
            throw new Error("Campos obrigatórios não preenchidos.");
        }
        await servicoRepository.atualizar(id, servico);
    }
    async deletar(id) {
        if (!id) throw new Error("O ID do serviço é obrigatório.");
        await servicoRepository.deletar(id);
    }
}
module.exports = new ServicoService();