const express = require('express');
const router = express.Router();
const comissaoController = require('../controllers/comissaoController');

router.get('/calcular', comissaoController.calcular);
router.post('/pagar', comissaoController.pagar);

module.exports = router;
