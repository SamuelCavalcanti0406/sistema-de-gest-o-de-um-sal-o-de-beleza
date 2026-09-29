const express = require('express');
const app = express();
const path = require('path');
const crypto = require('crypto');
const cors = require('cors');
const port = process.env.PORT || 3000;
const clienteRoutes = require('./routes/clienteRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const comissaoRoutes = require('./routes/comissaoRoutes');

require('dotenv').config();

//Habilita a porra do Express para entender requisições com corpo em JSON Essencial para POST e PUT
app.use(express.json());
app.use('/api', cors({
    origin: /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/ping', (req, res) => {
    res.json({ mensagem: 'API do Salão operando perfeitamente!' });
});

app.use('/api', (req, res, next) => {
    const configuredKey = process.env.ADMIN_API_KEY;
    const providedKey = (req.get('authorization') || '').replace(/^Bearer\s+/i, '');

    if (!configuredKey) {
        return res.status(503).json({ mensagem: 'A chave de acesso administrativo não está configurada.' });
    }

    const expected = Buffer.from(configuredKey);
    const provided = Buffer.from(providedKey);
    const valid = expected.length === provided.length && crypto.timingSafeEqual(expected, provided);

    if (!valid) {
        return res.status(401).json({ mensagem: 'Acesso não autorizado.' });
    }

    next();
});

app.use('/api/servicos', servicoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/profissionais', profissionalRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/comissoes', comissaoRoutes);

app.use(express.static(path.join(__dirname, '..', 'public')));
const fechamentoMensal = require('./jobs/fechamentoMensal');
fechamentoMensal.iniciarJob();

const whatsappService = require('./services/whatsappService');
whatsappService.inicializar();

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
    console.log(`Acesse http://localhost:${port}/ping para verificar a API.`); // SIIIIIIIIII 
    if (process.env.NODE_ENV === 'production') 
    {
        console.log('Rodando em ambiente de produção');
    }
});
