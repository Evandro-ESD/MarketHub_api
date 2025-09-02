// Middleware para garantir que o vendedor só altere/exclua o próprio usuário
module.exports = (req, res, next) => {
  const { id_usuario } = req.params;
  // if (req.user.perfil === 'VENDEDOR' && String(req.user.id_usuario) !== String(id_usuario)) {
  //   return res.status(403).json({ message: 'Você só pode alterar/excluir seus próprios dados.' });
  // }


  ////  Alterado por EVANDRO //////////
  ///// MOTIVAÇÃO só impede vendedores de editar outro usuário, 
  // mas COMPRADOR pode alterar qualquer usuário, 
  // porque não há bloqueio para ele. Se a regra for "apenas o 
  // próprio usuário pode alterar/excluir", precisa ser genérico
  
  if (String(req.user.id_usuario) !== String(id_usuario)) {
    return res.status(403).json({ message: 'Você só pode alterar/excluir seus próprios dados.' });
  }
  next();
};
