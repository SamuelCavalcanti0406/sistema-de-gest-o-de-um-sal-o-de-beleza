const express = require('express');
const router = express.Router();
const agendamentoController = require('../controllers/agendamentoController');

router.get('/', agendamentoController.listarTodos);
router.post('/', agendamentoController.criar);
router.patch('/:id/status', agendamentoController.atualizarStatus);
router.delete('/:id', agendamentoController.deletar);

module.exports = router;