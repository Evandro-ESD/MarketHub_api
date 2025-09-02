const pool = require('../../db');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

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

    // Verifica se o arquivo foi recebido
    if (!req.file) {
      console.error('Nenhum arquivo foi recebido pelo middleware uploadProduto.');
      return res.status(400).json({ message: 'Nenhuma foto foi enviada.' });
    }

    // Gerar identificador seguro para a foto
    const fotoId = crypto.randomBytes(16).toString('hex');
    console.log('Identificador seguro gerado para a foto:', fotoId);

    // Renomear o arquivo para usar o identificador seguro
    const ext = path.extname(req.file.originalname).toLowerCase();
    const novoNomeArquivo = `${fotoId}${ext}`;
    const novoCaminho = path.join(path.dirname(req.file.path), novoNomeArquivo);
    fs.renameSync(req.file.path, novoCaminho);

    // Salvar apenas o identificador no banco
    const foto = fotoId;

    const [result] = await pool.query(
      'INSERT INTO produtos (nome_produto, descricao, preco, estoque, id_vendedor, foto) VALUES (?, ?, ?, ?, ?, ?)',
      [nome_produto, descricao, preco, estoque, id_vendedor, foto]
    );

    res.status(201).json({ id_produto: result.insertId, nome_produto, descricao, preco, estoque, id_vendedor, foto });
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    next(err);
  }
};

// Editar produto
exports.updateProduto = async (req, res, next) => {
  try {
    const { id_produto } = req.params;
    const { nome_produto, descricao, preco, estoque, foto } = req.body;
    const [result] = await pool.query(
      'UPDATE produtos SET nome_produto = ?, descricao = ?, preco = ?, estoque = ?, foto = ? WHERE id_produto = ?',
      [nome_produto, descricao, preco, estoque, foto, id_produto]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json({ id_produto, nome_produto, descricao, preco, estoque, foto });
  } catch (err) {
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

// Buscar produtos do vendedor logado
exports.getProdutosByToken = async (req, res, next) => {
  try {
    const id_vendedor = req.user.id_usuario; // vem do token decodificado

    const [rows] = await pool.query(
      'SELECT * FROM produtos WHERE id_vendedor = ?',
      [id_vendedor]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Nenhum produto encontrado para este vendedor.' });
    }

    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar produtos do vendedor logado:', err);
    next(err);
  }
};
