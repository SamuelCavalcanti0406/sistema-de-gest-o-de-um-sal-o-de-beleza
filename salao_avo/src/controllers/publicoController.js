const clienteService = require('../services/clienteService');
const clienteRepository = require('../repositories/clienteRepository');
const whatsappService = require('../services/whatsappService');
const { criarLimitador, validarLead } = require('../utils/leadPublico');

const dentroDoLimite = criarLimitador();

class PublicoController {
    async criarLead(req, res) {
        try {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            if (!dentroDoLimite(ip)) {
                return res.status(429).json({ mensagem: 'Muitas tentativas. Tente novamente mais tarde.' });
            }

            const { erro, lead } = validarLead(req.body);
            if (erro) {
                return res.status(400).json({ mensagem: erro });
            }
            const { nome, telefone } = lead;

            const existente = await clienteRepository.buscarPorTelefone(telefone);
            let boasVindas = { status: 'nao_enviada' };

            if (!existente) {
                await clienteService.criar({
                    nome,
                    telefone,
                    observacoes_alergias: null
                });
                boasVindas = await whatsappService.agendarBoasVindas(telefone, nome);
            }

            return res.status(existente ? 200 : 201).json({
                mensagem: existente ? 'Contato já cadastrado.' : 'Contato cadastrado.',
                novoCadastro: !existente,
                boasVindas
            });
        } catch (erro) {
            console.error('Erro ao criar lead público:', erro);
            if (erro.message && erro.message.includes('obrigatórios')) {
                return res.status(400).json({ mensagem: erro.message });
            }
            return res.status(500).json({ mensagem: 'Não foi possível salvar o contato agora. Tente novamente.' });
        }
    }
}

module.exports = new PublicoController();
