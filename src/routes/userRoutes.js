
const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

const { verifyToken, verifyPerfil } = require('../middlewares/authMiddleware');
const ownerMiddleware = require('../middlewares/ownerMiddleware');

// Proteger todas as rotas abaixo (usuário precisa estar autenticado)
router.use(verifyToken);


// Buscar todos os usuários (VENDEDOR e COMPRADOR podem visualizar)
router.get('/', verifyPerfil('VENDEDOR'), userController.getAllUsers);
router.get('/', verifyPerfil('COMPRADOR'), userController.getAllUsers);


// Criar apenas VENDEDOR
router.post('/', verifyPerfil('VENDEDOR'), userController.createUser);

// Editar e excluir apenas o próprio usuário VENDEDOR
router.put('/:id_usuario', verifyPerfil('VENDEDOR'), ownerMiddleware, userController.updateUser);
router.delete('/:id_usuario', verifyPerfil('VENDEDOR'), ownerMiddleware, userController.deleteUser);

module.exports = router;