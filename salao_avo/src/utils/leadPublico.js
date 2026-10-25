// Regras do formulário público, usadas pelo Express (src/controllers/publicoController.js)
// e pela função serverless da Vercel (api/publico/leads.js).

const JANELA_MS = 60 * 60 * 1000;
const MAX_POR_HORA = 8;

function criarLimitador() {
    const tentativasPorIp = new Map();
    return function dentroDoLimite(ip) {
        const agora = Date.now();
        const recentes = (tentativasPorIp.get(ip) || []).filter((t) => agora - t < JANELA_MS);
        if (recentes.length >= MAX_POR_HORA) {
            tentativasPorIp.set(ip, recentes);
            return false;
        }
        recentes.push(agora);
        tentativasPorIp.set(ip, recentes);
        return true;
    };
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

// Retorna { erro } com a mensagem para o cliente, ou { lead } já normalizado.
function validarLead(corpo) {
    corpo = corpo || {};
    const nome = String(corpo.nome || '')
        .replace(/[\u0000-\u001f\u007f]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const telefone = normalizarTelefone(corpo.telefone);
    const servico = String(corpo.servico || '').trim();
    const data = String(corpo.data || '').trim();

    if (!nome || nome.length > 120) {
        return { erro: 'Informe um nome com até 120 caracteres.' };
    }
    if (!telefone) {
        return { erro: 'Informe um telefone brasileiro válido com DDD.' };
    }
    if (!servico || servico.length > 120 || !dataPreferidaValida(data)) {
        return { erro: 'Informe um serviço e uma data válida a partir de hoje.' };
    }
    if (corpo.consentimento !== true) {
        return { erro: 'É necessário autorizar a mensagem de boas-vindas pelo WhatsApp.' };
    }
    return { lead: { nome, telefone, servico, data } };
}

module.exports = { criarLimitador, validarLead };
