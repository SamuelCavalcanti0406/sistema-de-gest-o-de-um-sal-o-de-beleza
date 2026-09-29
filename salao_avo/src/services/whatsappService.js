const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

class WhatsappService {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth()
        });
        this.isReady = false;

        this.client.on('qr', (qr) => {
            console.log('WhatsApp QR Code: Escaneie com o seu aplicativo para conectar.');
            qrcode.generate(qr, { small: true });
        });

        this.client.on('ready', () => {
            console.log('WhatsApp Client is ready!');
            this.isReady = true;
        });

        this.client.on('auth_failure', msg => {
            console.error('WhatsApp Authentication failure:', msg);
        });

        this.client.on('disconnected', (reason) => {
            console.log('WhatsApp Client was disconnected', reason);
            this.isReady = false;
        });
    }

    inicializar() {
        console.log('Inicializando serviço do WhatsApp...');
        this.client.initialize().catch(err => {
            console.error('Erro ao inicializar o WhatsApp:', err);
        });
    }

    agendarBoasVindas(telefone, nome) {
        if (!telefone) return;
        
        // Remove tudo que não for número
        let numeroLimpo = telefone.replace(/\D/g, '');
        
        // Se já tiver o DDI 55, não adiciona. Caso contrário, adiciona.
        if (!numeroLimpo.startsWith('55')) {
            numeroLimpo = '55' + numeroLimpo;
        }

        const chatId = `${numeroLimpo}@c.us`;
        const mensagem = `Olá, ${nome}! Seja bem-vindo(a) ao Rosário CIA! Qualquer dúvida, estamos por aqui.`;

        console.log(`WhatsApp: Agendando mensagem de boas-vindas para ${nome} (${chatId}) em 5 minutos...`);

        // Agenda para 5 minutos (300.000 ms)
        setTimeout(() => {
            if (!this.isReady) {
                console.log(`WhatsApp: Cliente não está pronto. Mensagem para ${nome} não enviada.`);
                return;
            }

            this.client.sendMessage(chatId, mensagem)
                .then(() => console.log(`WhatsApp: Mensagem de boas-vindas enviada para ${nome} com sucesso!`))
                .catch(err => console.error(`WhatsApp: Erro ao enviar mensagem para ${nome}:`, err));
        }, 5 * 60 * 1000);
    }
}

module.exports = new WhatsappService();
