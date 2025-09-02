const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const pedidosController = require('../controllers/pedidosController');

router.use(verifyToken); // comprador autenticado
router.post('/', pedidosController.criarPedido);

module.exports = router;
