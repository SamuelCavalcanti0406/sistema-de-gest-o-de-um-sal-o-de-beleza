const profissionalRepository = require('../repositories/profissionalRepository');

class ProfissionalService {
    async listarTodos() {
        return await profissionalRepository.listarTodos();
    }
    async criar(profissional) {
        if (!profissional.nome) {
            throw new Error("O nome do profissional é obrigatório.");
        }
        if (profissional.percentual_comissao < 0 || profissional.percentual_comissao > 100) {
            throw new Error("O percentual de comissão deve estar entre 0 e 100.");
        }
        return await profissionalRepository.criar(profissional);
    }
    async atualizar(id, profissional) {
        if (!id) throw new Error("O ID do profissional é obrigatório.");
        if (!profissional.nome) throw new Error("O nome do profissional não pode ficar vazio.");
        
        await profissionalRepository.atualizar(id, profissional);
    }

    async deletar(id) {
        if (!id) throw new Error("O ID do profissional é obrigatório.");
        await profissionalRepository.deletar(id);
    }
}
module.exports = new ProfissionalService();