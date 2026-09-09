const profissionalService = require('../services/profissionalService');

class ProfissionalController {
    async listarTodos(req, res) {
        try {
            const profisonal = await profissionalService.listarTodos();
            res.status(200).json(profisonal);
        } catch (error) {
            console.log('Erro ao listar profissionais:', error);
            res.status(500).json({ error: 'erro interno do servidor, tenso demais!' });
        }
    }
    async criar(req, res) {
        try{
            const novoId = await profissionalService.criar(req.body);
            return res.status(201).json({ id: novoId, message : 'Profissional cadastrado com sucesso fi!' });
        } catch (error) {
            console.log('Erro ao criar profissional:', error);
           if(error.message.includes("obrigatório") || error.message.includes("comissão")){
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'erro interno do servidor alguém tem que ver isso ai!' });
            }
        }
    }
    async atualizar(req, res) {
        try {
            await profissionalService.atualizar(req.params.id, req.body);
            return res.status(200).json({ mensagem: 'Dados do profissional atualizados com sucesso!' });
        } catch (erro) {
            console.error('Erro ao atualizar profissional:', erro);
            return res.status(500).json({ mensagem: 'Erro interno no servidor, tenso demais.' });
        }
    }
    
    async deletar(req, res) {
        try {
            // CORREÇÃO 3: 'profissionalService' com dois 's'
            await profissionalService.deletar(req.params.id);
            return res.status(200).json({ mensagem: 'Profissional removido do sistema com sucesso!' });
        } catch (erro) {
            console.error('Erro ao deletar profissional:', erro);
            return res.status(400).json({ mensagem: erro.message });
        }
    }
}

module.exports = new ProfissionalController();