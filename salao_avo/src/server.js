const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const clienteRoutes = require('./routes/clienteRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const profissionalRoutes = require('./routes/profissionalRoutes');
const agendamentoRoutes = require('./routes/agendamentoRoutes');
const cors = require('cors');
const dashboardRoutes = require('./routes/dashboardRoutes');
const comissaoRoutes = require('./routes/comissaoRoutes');

require('dotenv').config();

//Habilita a porra do Express para entender requisições com corpo em JSON Essencial para POST e PUT
app.use(express.json());
app.use(cors());
app.get('/ping', (req, res) => res.status(200).send('pong'));
app.get('/ping', (req, res) => {
    res.json({ mensagem: 'API do Salão operando perfeitamente!' });
});

app.use('/api/servicos', servicoRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/profissionais', profissionalRoutes);
app.use('/api/agendamentos', agendamentoRoutes);
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/comissoes', comissaoRoutes);

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
