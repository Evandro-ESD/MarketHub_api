const pool = require('../../db');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs'); // Adiciona a importação do módulo fs para verificar a existência de arquivos

// Buscar todos os produtos
exports.getAllProdutos = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');

    // Adiciona o caminho completo da imagem para cada produto
    const produtosComCaminhoCompleto = rows.map(produto => {
      let foto = produto.foto;

      // Adiciona a extensão .jpg se estiver ausente
      if (foto && !foto.includes('.')) {
        foto += '.jpg';
      }

      // Verifica se o arquivo existe antes de retornar o caminho completo
      const caminhoFoto = path.join(__dirname, '../../uploads/produtos', foto);
      if (foto && !fs.existsSync(caminhoFoto)) {
        console.warn(`Arquivo não encontrado: ${caminhoFoto}`);
        foto = null; // Define como null se o arquivo não existir
      }

      return {
        ...produto,
        foto: foto ? `${req.protocol}://${req.get('host')}/uploads/produtos/${foto}` : null
      };
    });

    res.json(produtosComCaminhoCompleto);
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
    const novoNomeArquivo = `${fotoId}${ext}`; // Inclui a extensão
    const novoCaminho = path.join(path.dirname(req.file.path), novoNomeArquivo);
    fs.renameSync(req.file.path, novoCaminho);

    // Salvar o nome completo no banco
    const foto = novoNomeArquivo;

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
