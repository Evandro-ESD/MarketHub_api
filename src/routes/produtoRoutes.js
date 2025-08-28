const express = require('express');
const router = express.Router();

const produtoController = require('../controllers/produtoController');
const { verifyToken, verifyPerfil } = require('../middlewares/authMiddleware');
const productOwnerMiddleware = require('../middlewares/productOwnerMiddleware');
const uploadProduto = require('../middlewares/uploadProduto');

// Proteger todas as rotas
router.use(verifyToken);

// Listar todos os produtos (VENDEDOR e COMPRADOR)
router.get('/', produtoController.getAllProdutos);

// Criar produto com upload de imagem (apenas VENDEDOR)
router.post('/', verifyPerfil('VENDEDOR'), uploadProduto.single('foto'), produtoController.createProduto);

// Editar produto (apenas VENDEDOR e só o próprio produto)
router.put('/:id_produto', verifyPerfil('VENDEDOR'), productOwnerMiddleware, produtoController.updateProduto);

// Excluir produto (apenas VENDEDOR e só o próprio produto)
router.delete('/:id_produto', verifyPerfil('VENDEDOR'), productOwnerMiddleware, produtoController.deleteProduto);

module.exports = router;
