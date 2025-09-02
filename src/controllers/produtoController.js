const supabase = require('../../supabase'); // 1. Importe o cliente Supabase
const path = require('path');
const crypto = require('crypto');

// Buscar todos os produtos
exports.getAllProdutos = async (req, res, next) => {
  try {
    // 2. Substitua pool.query por supabase.from().select()
    const { data, error } = await supabase.from('produtos').select('*');

    if (error) throw error; // Lança o erro para o catch
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

    // Verifica se o arquivo foi recebido
    if (!req.file) {
      console.error('Nenhum arquivo foi recebido pelo middleware uploadProduto.');
      return res.status(400).json({ message: 'Nenhuma foto foi enviada.' });
    }

    // 3. Lógica de upload para o Supabase Storage
    const ext = path.extname(req.file.originalname).toLowerCase();
    const novoNomeArquivo = `${id_vendedor}-${crypto.randomBytes(16).toString('hex')}${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('fotos-produtos') // Nome do seu "bucket" no Supabase Storage
      .upload(novoNomeArquivo, req.file.buffer, { // <-- Usar req.file.buffer diretamente
        contentType: req.file.mimetype,
        upsert: false,
      });

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
      return res.status(404).json({ message: 'Produto não encontrado' });
    }
    res.json(data);
  } catch (err) {
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
