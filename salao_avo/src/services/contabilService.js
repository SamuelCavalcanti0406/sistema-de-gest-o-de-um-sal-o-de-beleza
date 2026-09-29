const contabilRepository = require('../repositories/contabilRepository');
const ExcelJS = require('exceljs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config();

class ContabilService {
  async gerarDadosMensais(mes, ano) {
    const entradas = await contabilRepository.obterEntradasMes(mes, ano);
    const saidas = await contabilRepository.obterSaidasMes(mes, ano);
    const resumo = await contabilRepository.obterResumoMes(mes, ano);

    return {
      entradas,
      saidas,
      resumo: {
        totalEntradas: resumo.totalEntradas,
        totalSaidas: resumo.totalSaidas,
        lucroLiquido: resumo.totalEntradas - resumo.totalSaidas,
        quantidadeAtendimentos: resumo.quantidadeAtendimentos
      }
    };
  }

  async gerarPlanilha(dados, mes, ano) {
    const workbook = new ExcelJS.Workbook();
    const sheetEntradas = workbook.addWorksheet('Entradas');
    sheetEntradas.columns = [
      { header: 'Data', key: 'data', width: 20 },
      { header: 'Cliente', key: 'cliente', width: 30 },
      { header: 'Profissional', key: 'profissional', width: 30 },
      { header: 'Serviço', key: 'servico', width: 30 },
      { header: 'Valor (R$)', key: 'valor', width: 15 }
    ];
    sheetEntradas.getRow(1).font = { bold: true };
    sheetEntradas.getColumn('valor').numFmt = '"R$" #,##0.00';
    dados.entradas.forEach(entrada => {
      sheetEntradas.addRow({
        data: entrada.data_hora_inicio,
        cliente: entrada.cliente_nome,
        profissional: entrada.profissional_nome,
        servico: entrada.servico_nome,
        valor: parseFloat(entrada.valor_final)
      });
    });

    const sheetSaidas = workbook.addWorksheet('Saídas (Comissões)');
    sheetSaidas.columns = [
      { header: 'Data', key: 'data', width: 20 },
      { header: 'Profissional', key: 'profissional', width: 30 },
      { header: 'Porcentagem', key: 'porcentagem', width: 15 },
      { header: 'Valor (R$)', key: 'valor', width: 15 }
    ];
    sheetSaidas.getRow(1).font = { bold: true };
    sheetSaidas.getColumn('valor').numFmt = '"R$" #,##0.00';
    dados.saidas.forEach(saida => {
      sheetSaidas.addRow({
        data: saida.data_pagamento,
        profissional: saida.profissional_nome,
        porcentagem: `${saida.porcentagem_aplicada}%`,
        valor: parseFloat(saida.valor_total)
      });
    });

    const sheetResumo = workbook.addWorksheet('Resumo');
    sheetResumo.columns = [
      { header: 'Métrica', key: 'metrica', width: 30 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];
    sheetResumo.getRow(1).font = { bold: true };
    sheetResumo.addRow({ metrica: 'Total Entradas', valor: parseFloat(dados.resumo.totalEntradas) }).getCell('valor').numFmt = '"R$" #,##0.00';
    sheetResumo.addRow({ metrica: 'Total Saídas', valor: parseFloat(dados.resumo.totalSaidas) }).getCell('valor').numFmt = '"R$" #,##0.00';
    sheetResumo.addRow({ metrica: 'Lucro Líquido', valor: parseFloat(dados.resumo.lucroLiquido) }).getCell('valor').numFmt = '"R$" #,##0.00';
    sheetResumo.addRow({ metrica: 'Quantidade de Atendimentos', valor: dados.resumo.quantidadeAtendimentos });

    const mesFormatado = mes.toString().padStart(2, '0');
    const filePath = path.join(process.cwd(), `fechamento_${ano}_${mesFormatado}.xlsx`);
    await workbook.xlsx.writeFile(filePath);
    return filePath;
  }

  async gerarAnaliseIA(dados, mes, ano) {
    if (!process.env.GEMINI_API_KEY) {
      return 'Aviso: GEMINI_API_KEY não configurada. A análise da IA não pôde ser gerada.';
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Você é um consultor financeiro especializado em salões de beleza.
Analise os dados financeiros do mês ${mes}/${ano}:

- Total de Entradas (serviços realizados): R$ ${dados.resumo.totalEntradas.toFixed(2)}
- Total de Saídas (comissões pagas): R$ ${dados.resumo.totalSaidas.toFixed(2)}
- Lucro Líquido: R$ ${dados.resumo.lucroLiquido.toFixed(2)}
- Quantidade de atendimentos: ${dados.resumo.quantidadeAtendimentos}

Por favor, forneça:
1. Uma análise resumida do desempenho financeiro do mês
2. Pontos de atenção
3. Sugestões para melhorar a rentabilidade
4. Comparação com métricas típicas do setor de beleza`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  async enviarEmail(planilhaPath, analiseIA, mes, ano) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_DESTINATARIO) {
      console.warn('Configurações de e-mail ausentes no .env. Email não enviado.');
      return;
    }
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomeDoMes = meses[parseInt(mes) - 1];
    const analiseHtml = analiseIA.replace(/\n/g, '<br>');
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_DESTINATARIO,
      subject: `Fechamento Contábil - ${nomeDoMes}/${ano} - Salão Rosário CIA`,
      html: `
        <h2>Fechamento Contábil - ${nomeDoMes}/${ano}</h2>
        <p>Segue em anexo a planilha de fechamento e abaixo a análise do nosso consultor virtual:</p>
        <hr>
        <div>${analiseHtml}</div>
      `,
      attachments: [{ filename: path.basename(planilhaPath), path: planilhaPath }]
    };
    await transporter.sendMail(mailOptions);
  }
}

module.exports = new ContabilService();
