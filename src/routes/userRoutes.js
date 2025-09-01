
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyPerfil } = require('../middlewares/authMiddleware');
const ownerMiddleware = require('../middlewares/ownerMiddleware');


// Buscar todos os usuários (VENDEDOR e COMPRADOR podem visualizar)
// router.get('/', verifyPerfil('VENDEDOR'), userController.getAllUsers);
// router.get('/', verifyPerfil('COMPRADOR'), userController.getAllUsers);

/////////////// ALTERADO POR EVANDRO ////////////
// MOTIVAÇÃO ROTAS DUPLICADAS SE SOBREPONDO

router.get('/', verifyToken, (req, res, next) => {
  if (['VENDEDOR', 'COMPRADOR'].includes(req.user.perfil)) {
    return userController.getAllUsers(req, res, next);
  }
  return res.status(403).json({ message: 'Acesso negado' });
});



// Cadastro de usuário aberto (sem autenticação)
router.post('/', userController.createUser);

router.use(verifyToken);

// Editar e excluir apenas o próprio usuário VENDEDOR
router.put('/:id_usuario', verifyPerfil('VENDEDOR'), ownerMiddleware, userController.updateUser);
router.delete('/:id_usuario', verifyPerfil('VENDEDOR'), ownerMiddleware, userController.deleteUser);

module.exports = router;