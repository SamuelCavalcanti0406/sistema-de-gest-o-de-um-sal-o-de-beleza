const express = require('express');
const router = express.Router();
const servicoController = require('../controllers/servicoController');

router.get('/', servicoController.listarTodos);
router.post('/', servicoController.criar);
router.put('/:id', servicoController.atualizar);
router.delete('/:id', servicoController.deletar);


module.exports = router;