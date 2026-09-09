const agendamentoService = require('../services/agendamentoService');

class AgendamentoController {
    async listarTodos(req, res) {
        try {
            const agendamentos = await agendamentoService.listarTodos();
            res.status(200).json(agendamentos);
        } catch (error) {
            console.log('Erro ao listar agendamentos:', error);
            res.status(500).json({ error: 'erro interno do servidor!' });
        }
    }
    async criar(req, res) {
        try {
            const novoId = await agendamentoService.criar(req.body);
            return res.status(201).json({ id: novoId, message: 'Agendamento criado com sucesso fi!' });
        } catch (error) {
            console.log('Erro ao criar agendamento:', error);
            if (error.message.includes("obrigatório") || error.message.includes("obrigatórias")) {
                res.status(400).json({ error: error.message });
            } else {
                res.status(500).json({ error: 'erro interno do servidor alguém tem que ver isso ai!' });
            }
        }
    }
    async atualizarStatus(req, res) {
        try {
            await agendamentoService.atualizarStatus(req.params.id, req.body.status);
            return res.status(200).json({ mensagem: 'Status do agendamento atualizado com sucesso! SIIIIII' });
        } catch (error) {
            console.error('Erro ao atualizar agendamento:', error);
            return res.status(400).json({ error: error.message });
        }
    }
    async deletar(req, res) {
        try {
            await agendamentoService.deletar(req.params.id);
            return res.status(200).json({ mensagem: 'Agendamento removido com sucesso! ' });
        } catch (error) {
            console.error('Erro ao deletar agendamento:', error);
            return res.status(400).json({ error: error.message });
        }
    }
}

module.exports = new AgendamentoController();