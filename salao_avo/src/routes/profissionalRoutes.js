const express = require('express');
const router = express.Router();
const profesionalController = require('../controllers/profissionalController');

router.get('/', profesionalController.listarTodos);
router.post('/', profesionalController.criar);
router.put('/:id', profesionalController.atualizar);
router.delete('/:id', profesionalController.deletar);

module.exports = router;