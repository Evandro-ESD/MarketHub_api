const supabase = require('../../supabase'); // Cliente Supabase
const path = require('path');
const crypto = require('crypto');

// Buscar todos os produtos
exports.getAllProdutos = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// Criar produto
exports.createProduto = async (req, res, next) => {
  try {
    const { nome_produto, descricao, preco, estoque } = req.body;
    const id_vendedor = req.user.id_usuario;

    if (!req.file) {
      return res.status(400).json({ message: 'Nenhuma foto foi enviada.' });
    }

    // Gerar nome seguro para a foto
    const ext = path.extname(req.file.originalname).toLowerCase();
    const novoNomeArquivo = `${id_vendedor}-${crypto.randomBytes(16).toString('hex')}${ext}`;

    // Upload para Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fotos-produtos')
      .upload(novoNomeArquivo, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });
    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: publicUrlData } = supabase.storage
      .from('fotos-produtos')
      .getPublicUrl(novoNomeArquivo);
    const fotoUrl = publicUrlData.publicUrl;

    // Inserir produto no Supabase
    const { data: newProduct, error: insertError } = await supabase
      .from('produtos')
      .insert({ nome_produto, descricao, preco, estoque, id_vendedor, foto: fotoUrl })
      .select()
      .single();
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
    const { nome_produto, descricao, preco, estoque } = req.body;

    const { data, error } = await supabase
      .from('produtos')
      .update({ nome_produto, descricao, preco, estoque })
      .eq('id_produto', id_produto)
      .select()
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Produto não encontrado' });

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

    // Buscar produto para pegar a foto
    const { data: produto, error: fetchError } = await supabase
      .from('produtos')
      .select('foto')
      .eq('id_produto', id_produto)
      .single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    if (!produto) return res.status(404).json({ message: 'Produto não encontrado' });

    // Deletar produto
    const { error: deleteError } = await supabase
      .from('produtos')
      .delete()
      .eq('id_produto', id_produto);
    if (deleteError) throw deleteError;

    res.json({ message: 'Produto excluído com sucesso' });
    return;
  } catch (err) {
    next(err);
  }
};

// Buscar produtos do vendedor logado
exports.getProdutosByToken = async (req, res, next) => {
  try {
    const id_vendedor = req.user.id_usuario;

    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .eq('id_vendedor', id_vendedor);

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ message: 'Nenhum produto encontrado para este vendedor.' });
    }

    res.json(data);
  } catch (err) {
    console.error('Erro ao buscar produtos do vendedor logado:', err);
    next(err);
  }
};
