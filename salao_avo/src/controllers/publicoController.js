const clienteService = require('../services/clienteService');
const clienteRepository = require('../repositories/clienteRepository');
const whatsappService = require('../services/whatsappService');

const tentativasPorIp = new Map();
const JANELA_MS = 60 * 60 * 1000;
const MAX_POR_HORA = 8;

function dentroDoLimite(ip) {
    const agora = Date.now();
    const recentes = (tentativasPorIp.get(ip) || []).filter((t) => agora - t < JANELA_MS);
    if (recentes.length >= MAX_POR_HORA) {
        tentativasPorIp.set(ip, recentes);
        return false;
    }
    recentes.push(agora);
    tentativasPorIp.set(ip, recentes);
    return true;
}

function normalizarTelefone(telefone) {
    let numero = String(telefone || '').replace(/\D/g, '');
    if (numero.startsWith('55') && (numero.length === 12 || numero.length === 13)) {
        numero = numero.slice(2);
    }
    if (!/^\d{10,11}$/.test(numero)) return '';
    return `55${numero}`;
}

function dataPreferidaValida(valor) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const [ano, mes, dia] = valor.split('-').map(Number);
    const data = new Date(Date.UTC(ano, mes - 1, dia));
    if (data.toISOString().slice(0, 10) !== valor) return false;

    const hoje = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());
    return valor >= hoje;
}

class PublicoController {
    async criarLead(req, res) {
        try {
            const ip = req.ip || req.socket.remoteAddress || 'unknown';
            if (!dentroDoLimite(ip)) {
                return res.status(429).json({ mensagem: 'Muitas tentativas. Tente novamente mais tarde.' });
            }

            const corpo = req.body || {};
            const nome = String(corpo.nome || '')
                .replace(/[\u0000-\u001f\u007f]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            const telefone = normalizarTelefone(corpo.telefone);
            const servico = String(corpo.servico || '').trim();
            const data = String(corpo.data || '').trim();

            if (!nome || nome.length > 120) {
                return res.status(400).json({ mensagem: 'Informe um nome com até 120 caracteres.' });
            }
            if (!telefone) {
                return res.status(400).json({ mensagem: 'Informe um telefone brasileiro válido com DDD.' });
            }
            if (!servico || servico.length > 120 || !dataPreferidaValida(data)) {
                return res.status(400).json({ mensagem: 'Informe um serviço e uma data válida a partir de hoje.' });
            }
            if (corpo.consentimento !== true) {
                return res.status(400).json({ mensagem: 'É necessário autorizar a mensagem de boas-vindas pelo WhatsApp.' });
            }

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
