// Middleware para garantir que o vendedor só altere/exclua seus próprios produtos
const pool = require('../../db');

module.exports = async (req, res, next) => {
  const { id_produto } = req.params;
  try {
    const [rows] = await pool.query('SELECT id_vendedor FROM produtos WHERE id_produto = ?', [id_produto]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Produto não encontrado.' });
    }
    if (String(rows[0].id_vendedor) !== String(req.user.id_usuario)) {
      return res.status(403).json({ message: 'Você só pode alterar/excluir seus próprios produtos.' });
    }
    next();
  } catch (err) {
    next(err);
  }
};
