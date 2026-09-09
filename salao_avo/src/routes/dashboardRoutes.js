const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/resumo', dashboardController.obterResumo);

module.exports = router;