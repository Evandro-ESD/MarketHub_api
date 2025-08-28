const express = require('express');
const router = express.Router();


const userController = require('../controllers/userController');
const { verifyToken, verifyPerfil } = require('../middlewares/authMiddleware');
// Buscar todos os usuários
router.get('/', userController.getAllUsers);

// Criar usuário
router.post('/', userController.createUser);

// Editar usuário
router.put('/:id_usuario', userController.updateUser);

// Excluir usuário
router.delete('/:id_usuario', userController.deleteUser);



// Proteger todas as rotas (usuário precisa estar autenticado)
router.use(verifyToken);

// Exemplo: rota que só permite perfil 'VENDEDOR'
router.post('/', verifyPerfil('VENDEDOR'), userController.createUser);

// Exemplo: rota que só permite perfil 'COMPRADOR'
router.post('/', verifyPerfil('COMPRADOR'), userController.createUser);

module.exports = router;