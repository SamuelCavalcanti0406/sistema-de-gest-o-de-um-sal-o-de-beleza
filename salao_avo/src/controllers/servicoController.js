const servicoService = require('../services/servicoService');

class ServicoController {
    async listarTodos(req, res) {
        try {
            const servicos = await servicoService.listarTodos();
            return res.status(200).json(servicos);
        } catch (erro) {
            console.error('Erro ao listar serviços:', erro);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }
    async criar(req, res) {
        try {
            const novoId = await servicoService.criar(req.body);
            return res.status(201).json({ id: novoId, mensagem: 'Serviço cadastrado com sucesso rapaa!!' });
        } catch (erro) {
            console.error('Erro ao criar serviço:', erro);
            if (erro.message.includes("obrigatórios") || erro.message.includes("positivo")) {
                return res.status(400).json({ mensagem: erro.message });
            }
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }
    async atualizar(req, res) {
        try {
            await servicoService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Serviço atualizado com sucesso rapaa!!' });
        } catch (erro) {
            console.error('Erro ao atualizar serviço:', erro);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }
    async deletar(req, res) {
        try {
            await servicoService.deletar(req.params.id);
            return res.status(200).json({ mensagem: 'Serviço removido com sucesso, siiiii!' });
        } catch (erro) {
            console.error('Erro ao deletar serviço:', erro);
            return res.status(400).json({ mensagem: erro.message });
        }
    }
}
module.exports = new ServicoController();