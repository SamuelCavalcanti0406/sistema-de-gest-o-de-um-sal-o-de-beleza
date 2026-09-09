const comissaoRepository = require('../repositories/comissaoRepository');

class ComissaoController {
    async calcular(req, res) {
        try {
            const { id_profissional, data_fechamento } = req.query;
            if (!id_profissional || !data_fechamento) {
                return res.status(400).json({ error: 'id_profissional e data_fechamento são obrigatórios.' });
            }

            const agendamentos = await comissaoRepository.listarAgendamentosPendentes(id_profissional, data_fechamento);
            
            let valor_total_devido = 0;
            const servicos_realizados = agendamentos.map(agendamento => {
                const percentual = agendamento.percentual_comissao || 0;
                const valor_comissao = (agendamento.valor_final * percentual) / 100;
                valor_total_devido += valor_comissao;
                
                return {
                    id_agendamento: agendamento.id,
                    data_hora: agendamento.data_hora_inicio,
                    servico_nome: agendamento.servico_nome,
                    valor_servico: agendamento.valor_final,
                    valor_comissao: valor_comissao
                };
            });

            res.json({
                valor_total: valor_total_devido,
                servicos: servicos_realizados
            });
        } catch (error) {
            console.error('Erro ao calcular comissões:', error);
            res.status(500).json({ error: 'Erro interno ao calcular comissões.' });
        }
    }

    async pagar(req, res) {
        try {
            const { id_profissional, valor_total, data_fechamento } = req.body;
            if (!id_profissional || valor_total === undefined || !data_fechamento) {
                return res.status(400).json({ error: 'id_profissional, valor_total e data_fechamento são obrigatórios.' });
            }

            // Validar se há agendamentos pendentes primeiro para evitar pagamento sem registros
            const agendamentos = await comissaoRepository.listarAgendamentosPendentes(id_profissional, data_fechamento);
            if (agendamentos.length === 0) {
                return res.status(400).json({ error: 'Nenhum agendamento pendente encontrado para este período.' });
            }

            const id_pagamento = await comissaoRepository.registrarPagamento(id_profissional, valor_total, data_fechamento);
            await comissaoRepository.marcarAgendamentosComoPagos(id_profissional, data_fechamento, id_pagamento);

            res.status(201).json({ 
                message: 'Pagamento registrado com sucesso!',
                id_pagamento 
            });
        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            res.status(500).json({ error: 'Erro interno ao registrar pagamento.' });
        }
    }
}

module.exports = new ComissaoController();
