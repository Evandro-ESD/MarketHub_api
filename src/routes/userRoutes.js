const express = require('express');
const router = express.Router();


const userController = require('../controllers/userController');

// Buscar todos os usuários
router.get('/', userController.getAllUsers);

// Criar usuário
router.post('/', userController.createUser);

// Editar usuário
router.put('/:id_usuario', userController.updateUser);

// Excluir usuário
router.delete('/:id_usuario', userController.deleteUser);

module.exports = router;