const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const MAX_BOAS_VINDAS_PENDENTES = 100;

class WhatsappService {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth()
        });
        this.isReady = false;
        this.boasVindasPendentes = new Map();
        this.processandoFila = false;
        this.timerRetentativa = null;

        this.client.on('qr', (qr) => {
            console.log('WhatsApp QR Code: Escaneie com o seu aplicativo para conectar.');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('WhatsApp conectado e pronto.');
            this.isReady = true;
            this.processarFilaBoasVindas();
        });

        this.client.on('auth_failure', (msg) => {
            console.error('Falha na autenticação do WhatsApp:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('WhatsApp desconectado:', reason);
            this.isReady = false;
        });
    }

    inicializar() {
        console.log('Inicializando serviço do WhatsApp...');
        this.client.initialize().catch((erro) => {
            console.error('Erro ao inicializar o WhatsApp:', erro);
        });
    }

    criarDestino(telefone) {
        let numero = String(telefone || '').replace(/\D/g, '');
        if (numero.startsWith('55') && (numero.length === 12 || numero.length === 13)) {
            numero = numero.slice(2);
        }
        if (!/^\d{10,11}$/.test(numero)) return null;
        const telefoneE164 = `55${numero}`;
        return {
            telefone: telefoneE164,
            chatId: `${telefoneE164}@c.us`
        };
    }

    criarMensagem(nome) {
        const nomeSeguro = String(nome || '').trim().slice(0, 120);
        return `Olá, ${nomeSeguro}! Seja bem-vindo(a) ao Rosário CIA! Recebemos seu pedido de horário. Qualquer dúvida, estamos por aqui.`;
    }

    async enviarBoasVindas(lead) {
        await this.client.sendMessage(lead.chatId, lead.mensagem);
    }

    enfileirarBoasVindas(lead, tentativas = 0) {
        if (this.boasVindasPendentes.has(lead.telefone)) return true;
        if (this.boasVindasPendentes.size >= MAX_BOAS_VINDAS_PENDENTES) return false;
        this.boasVindasPendentes.set(lead.telefone, { ...lead, tentativas });
        return true;
    }

    agendarRetentativa() {
        if (this.timerRetentativa || !this.boasVindasPendentes.size) return;
        this.timerRetentativa = setTimeout(() => {
            this.timerRetentativa = null;
            this.processarFilaBoasVindas();
        }, 30 * 1000);
        if (typeof this.timerRetentativa.unref === 'function') this.timerRetentativa.unref();
    }

    async processarFilaBoasVindas() {
        if (!this.isReady || this.processandoFila) return;
        this.processandoFila = true;

        try {
            for (const [telefone, lead] of this.boasVindasPendentes) {
                if (!this.isReady) break;
                try {
                    await this.enviarBoasVindas(lead);
                    this.boasVindasPendentes.delete(telefone);
                    console.log('Mensagem de boas-vindas enviada.');
                } catch (erro) {
                    lead.tentativas += 1;
                    if (lead.tentativas >= 3) {
                        this.boasVindasPendentes.delete(telefone);
                        console.error('Mensagem de boas-vindas não enviada após três tentativas:', erro.message);
                        continue;
                    }
                    this.agendarRetentativa();
                    break;
                }
            }
        } finally {
            this.processandoFila = false;
            if (this.isReady && this.boasVindasPendentes.size && !this.timerRetentativa) {
                this.agendarRetentativa();
            }
        }
    }

    async agendarBoasVindas(telefone, nome) {
        const destino = this.criarDestino(telefone);
        if (!destino) return { status: 'nao_enviada' };

        const lead = {
            ...destino,
            mensagem: this.criarMensagem(nome),
            tentativas: 0
        };

        if (!this.isReady || this.boasVindasPendentes.size || this.processandoFila) {
            if (!this.enfileirarBoasVindas(lead)) return { status: 'nao_enviada' };
            if (this.isReady) this.processarFilaBoasVindas();
            return { status: 'na_fila' };
        }

        try {
            await this.enviarBoasVindas(lead);
            console.log('Mensagem de boas-vindas enviada.');
            return { status: 'enviada' };
        } catch (erro) {
            console.error('Erro ao enviar mensagem de boas-vindas:', erro.message);
            if (!this.enfileirarBoasVindas(lead, 1)) return { status: 'nao_enviada' };
            this.agendarRetentativa();
            return { status: 'na_fila' };
        }
    }
}

module.exports = new WhatsappService();
