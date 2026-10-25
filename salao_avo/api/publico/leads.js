// Função serverless da Vercel para o formulário do site (POST /api/publico/leads).
// Grava o lead no mesmo banco Turso que o painel usa. A mensagem automática de
// boas-vindas não sai daqui: ela depende do whatsapp-web.js, que só roda no Express.
// Na Vercel, configure TURSO_DATABASE_URL e TURSO_AUTH_TOKEN nas variáveis de ambiente.
const clienteService = require('../../src/services/clienteService');
const clienteRepository = require('../../src/repositories/clienteRepository');
const { criarLimitador, validarLead } = require('../../src/utils/leadPublico');

// O limite vale por instância da função; é uma barreira básica contra repetição.
const dentroDoLimite = criarLimitador();

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).json({ mensagem: 'Método não permitido.' });
    }

    try {
        const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
            || (req.socket && req.socket.remoteAddress) || 'unknown';
        if (!dentroDoLimite(ip)) {
            return res.status(429).json({ mensagem: 'Muitas tentativas. Tente novamente mais tarde.' });
        }

        const { erro, lead } = validarLead(req.body);
        if (erro) {
            return res.status(400).json({ mensagem: erro });
        }

        const existente = await clienteRepository.buscarPorTelefone(lead.telefone);
        if (!existente) {
            await clienteService.criar({
                nome: lead.nome,
                telefone: lead.telefone,
                observacoes_alergias: null
            });
        }

        return res.status(existente ? 200 : 201).json({
            mensagem: existente ? 'Contato já cadastrado.' : 'Contato cadastrado.',
            novoCadastro: !existente,
            boasVindas: { status: 'manual' }
        });
    } catch (erro) {
        console.error('Erro ao criar lead público:', erro);
        return res.status(500).json({ mensagem: 'Não foi possível salvar o contato agora. Tente novamente.' });
    }
};
