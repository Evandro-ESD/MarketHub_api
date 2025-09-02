const pool = require('../../db');

// Buscar todos os produtos
exports.getAllProdutos = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// Criar produto

exports.createProduto = async (req, res, next) => {
  try {
    const { nome_produto, descricao, preco, estoque } = req.body;
    const id_vendedor = req.user.id_usuario;
    // Se imagem enviada, salva caminho; senão, salva vazio
    const foto = req.file ? req.file.path.replace(/\\/g, '/') : '';
    const [result] = await pool.query(
      'INSERT INTO produtos (nome_produto, descricao, preco, estoque, id_vendedor, foto) VALUES (?, ?, ?, ?, ?, ?)',
      [nome_produto, descricao, preco, estoque, id_vendedor, foto]
    );
    res.status(201).json({ id_produto: result.insertId, nome_produto, descricao, preco, estoque, id_vendedor, foto });
  } catch (err) {
    next(err);
  }
};

// Editar produto
exports.updateProduto = async (req, res, next) => {
  try {
    const { id_produto } = req.params;
    if(!req.body){
      console.warn('[UPDATE PRODUTO] req.body undefined antes do multer parsing. Content-Type:', req.headers['content-type']);
    }
    const body = req.body || {};
    // Buscar produto atual para preservar campos não enviados
    const [exist] = await pool.query('SELECT * FROM produtos WHERE id_produto = ?', [id_produto]);
    if (!exist.length) return res.status(404).json({ message: 'Produto não encontrado' });
    const atual = exist[0];

    // Campos que podem chegar (multipart form -> strings)
    const nome_produto = body.nome_produto ?? atual.nome_produto;
    const descricao = body.descricao ?? atual.descricao;
    // Converter números com fallback
    let preco = body.preco !== undefined ? parseFloat(body.preco) : atual.preco;
    if (isNaN(preco)) preco = atual.preco;
    let estoque = body.estoque !== undefined ? parseInt(body.estoque) : atual.estoque;
    if (isNaN(estoque)) estoque = atual.estoque;

    // Foto: se veio novo arquivo usar caminho; se veio string vazia significa remover; senão manter atual
    let foto = atual.foto;
    if (req.file) {
      foto = req.file.path.replace(/\\/g, '/');
    } else if (body.foto === '') {
      foto = '';
    }

    console.log('[UPDATE PRODUTO] id:', id_produto, {
      contentType: req.headers['content-type'],
      bodyRecebido: body,
      temFile: !!req.file,
      valoresAplicados: { nome_produto, descricao, preco, estoque, foto }
    });

    const [result] = await pool.query(
      'UPDATE produtos SET nome_produto = ?, descricao = ?, preco = ?, estoque = ?, foto = ? WHERE id_produto = ?',
      [nome_produto, descricao, preco, estoque, foto, id_produto]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ id_produto, nome_produto, descricao, preco, estoque, foto });
  } catch (err) {
  console.error('[UPDATE PRODUTO ERRO]', err);
    next(err);
  }
};

// Excluir produto
exports.deleteProduto = async (req, res, next) => {
  try {
    const { id_produto } = req.params;
    const [result] = await pool.query(
      'DELETE FROM produtos WHERE id_produto = ?',
      [id_produto]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    next(err);
  }
};
