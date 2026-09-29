const clienteService = require('../services/clienteService');
const whatsappService = require('../services/whatsappService');

class ClienteController {
    async listarTodos(req, res) {
        try {
            const clientes = await clienteService.listarTodos();
            return res.status(200).json(clientes);
        } catch (erro) {
            console.error('Erro ao listar clientes:', erro);
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }

    async criar(req, res) {
        try {
            const dadosCliente = req.body; 
            const novoId = await clienteService.criar(dadosCliente); 
            
            res.status(201).json({ 
                id: novoId, 
                mensagem: 'Cliente cadastrado com sucesso no salão!' 
            });

            // Agendar boas-vindas via WhatsApp (best-effort, não bloqueia o cadastro)
            try {
                whatsappService.agendarBoasVindas(dadosCliente.telefone, dadosCliente.nome);
            } catch (e) {
                console.log('WhatsApp: erro ao agendar boas-vindas:', e.message);
            }
            
            return;
        } catch (erro) {
            console.error('Erro ao criar cliente:', erro);
            if (erro.message.includes("obrigatórios")) {
                return res.status(400).json({ mensagem: erro.message });
            }
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
        }
    }
        async atualizar(req, res){
            try {
                const id = req.params.id
                const dadosCliente = req.body;

                await clienteService.atualizar(id, dadosCliente);
                return res.status(200).json({ mensagem: 'Cliente atualizado com sucesso!' });
            } catch (erro) {
                console.error('Erro ao atualizar cliente:', erro);
                return res.status(400).json({ mensagem: 'erro.message'});                
            }
            return res.status(500).json({ mensagem: 'Erro interno no servidor.' });
    }
    async deletar(req, res) {
        try {
            const id = req.params.id;
            
            await clienteService.deletar(id);
            return res.status(200).json({ mensagem: 'Cliente removido do sistema com sucesso meu fi!' });
        } catch (erro) {
            console.error('Erro ao deletar cliente:', erro);
            return res.status(400).json({ mensagem: erro.message });
        }
    }
}
module.exports = new ClienteController();