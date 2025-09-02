const express = require('express');
const router = express.Router();
const { verifyToken, verifyPerfil } = require('../middlewares/authMiddleware');
const vendasController = require('../controllers/vendasController');

router.use(verifyToken, verifyPerfil('VENDEDOR'));

router.get('/resumo', vendasController.resumo);
router.get('/diario', vendasController.diario);
router.get('/mensal', vendasController.mensal);
router.get('/anual', vendasController.anual);
router.get('/top-produtos', vendasController.topProdutos);

module.exports = router;