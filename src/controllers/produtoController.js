const supabase = require('../../supabase'); // 1. Importe o cliente Supabase
const path = require('path');
const crypto = require('crypto');
<<<<<<< HEAD
const fs = require('fs'); // Adiciona a importação do módulo fs para verificar a existência de arquivos
=======
>>>>>>> 618e272afaa1a1eebf8497b7c0af0bd9a1f8e735

// Buscar todos os produtos
exports.getAllProdutos = async (req, res, next) => {
  try {
<<<<<<< HEAD
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
=======
    // 2. Substitua pool.query por supabase.from().select()
    const { data, error } = await supabase.from('produtos').select('*');

    if (error) throw error; // Lança o erro para o catch
    res.json(data);
>>>>>>> 618e272afaa1a1eebf8497b7c0af0bd9a1f8e735
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

    // 3. Lógica de upload para o Supabase Storage
    const ext = path.extname(req.file.originalname).toLowerCase();
<<<<<<< HEAD
    const novoNomeArquivo = `${fotoId}${ext}`; // Inclui a extensão
    const novoCaminho = path.join(path.dirname(req.file.path), novoNomeArquivo);
    fs.renameSync(req.file.path, novoCaminho);

    // Salvar o nome completo no banco
    const foto = novoNomeArquivo;
=======
    const novoNomeArquivo = `${id_vendedor}-${crypto.randomBytes(16).toString('hex')}${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fotos-produtos') // Nome do seu "bucket" no Supabase Storage
      .upload(novoNomeArquivo, req.file.buffer, { // <-- Usar req.file.buffer diretamente
        contentType: req.file.mimetype,
        upsert: false,
      });
>>>>>>> 618e272afaa1a1eebf8497b7c0af0bd9a1f8e735

    if (uploadError) throw uploadError;

    // 4. Obtenha a URL pública para salvar no banco
    const { data: publicUrlData } = supabase.storage
      .from('fotos-produtos')
      .getPublicUrl(novoNomeArquivo);

    const fotoUrl = publicUrlData.publicUrl;

    // 5. Substitua o INSERT
    const { data: newProduct, error: insertError } = await supabase
      .from('produtos')
      .insert({ nome_produto, descricao, preco, estoque, id_vendedor, foto: fotoUrl })
      .select() // .select() retorna o registro inserido
      .single(); // .single() para retornar um objeto em vez de um array

    if (insertError) throw insertError;

    res.status(201).json(newProduct);
  } catch (err) {
    console.error('Erro ao criar produto:', err);
    next(err);
  }
};

// Editar produto
exports.updateProduto = async (req, res, next) => {
  try {
    const { id_produto } = req.params;
<<<<<<< HEAD
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
=======
    const { nome_produto, descricao, preco, estoque } = req.body; // Foto é tratada separadamente

    // 6. Substitua o UPDATE
    const { data, error } = await supabase
      .from('produtos')
      .update({ nome_produto, descricao, preco, estoque })
      .eq('id_produto', id_produto) // A cláusula WHERE
      .select()
      .single();

    if (error) throw error;
    if (!data) {
>>>>>>> 618e272afaa1a1eebf8497b7c0af0bd9a1f8e735
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(data);
  } catch (err) {
  console.error('[UPDATE PRODUTO ERRO]', err);
    next(err);
  }
};

// Excluir produto
exports.deleteProduto = async (req, res, next) => {
  try {
    const { id_produto } = req.params;

    // 1. Primeiro, buscar o produto para obter a URL da foto antes de deletar
    const { data: produto, error: fetchError } = await supabase
      .from('produtos')
      .select('foto')
      .eq('id_produto', id_produto)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // Ignora o erro 'PGRST116' que significa "0 linhas retornadas", pois tratamos isso abaixo
      throw fetchError;
    }
    if (!produto) {
      return res.status(404).json({ message: 'Produto não encontrado' });
    }

    // 2. Excluir o registro do produto no banco de dados
    const { error: deleteError } = await supabase
      .from('produtos')
      .delete()
      .eq('id_produto', id_produto);

    if (deleteError) throw deleteError;

    // 3. Se o registro foi excluído e havia uma foto, apagar o arquivo do Storage
    if (produto.foto) {
      const nomeArquivo = produto.foto.split('/').pop();
      const { error: storageError } = await supabase.storage.from('fotos-produtos').remove([nomeArquivo]);
      if (storageError) {
        // Não retorna erro ao cliente, mas loga no servidor para possível limpeza manual
        console.error(`Falha ao excluir o arquivo ${nomeArquivo} do storage:`, storageError);
      }
    }

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    next(err);
  }
};
