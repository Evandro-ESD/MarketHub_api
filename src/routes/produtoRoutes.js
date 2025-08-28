const express = require('express');
const router = express.Router();

const produtoController = require('../controllers/produtoController');
const { verifyToken, verifyPerfil } = require('../middlewares/authMiddleware');
const productOwnerMiddleware = require('../middlewares/productOwnerMiddleware');

// Proteger todas as rotas
router.use(verifyToken);

// Listar todos os produtos (VENDEDOR e COMPRADOR)
router.get('/', produtoController.getAllProdutos);

// Criar produto (apenas VENDEDOR)
router.post('/', verifyPerfil('VENDEDOR'), produtoController.createProduto);

// Editar produto (apenas VENDEDOR e só o próprio produto)
router.put('/:id_produto', verifyPerfil('VENDEDOR'), productOwnerMiddleware, produtoController.updateProduto);

// Excluir produto (apenas VENDEDOR e só o próprio produto)
router.delete('/:id_produto', verifyPerfil('VENDEDOR'), productOwnerMiddleware, produtoController.deleteProduto);

module.exports = router;
