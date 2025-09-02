// Middleware para garantir que o vendedor só altere/exclua seus próprios produtos
const Product = require('../models/productModel');

module.exports = async (req, res, next) => {
  const { id_produto } = req.params;
  // Assumindo que um middleware de autenticação anterior já populou req.user
  const userId = req.user.id_usuario;

  try {
    const product = await Product.findById(id_produto);

    if (!product) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }

    // Compara o ID do vendedor do produto com o ID do usuário logado.
    // A conversão para String é uma boa prática para evitar problemas com tipos diferentes (Number vs String).
    if (String(product.id_vendedor) !== String(userId)) {
      return res.status(403).json({ message: 'Você só pode alterar/excluir seus próprios produtos.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};
