const pool = require('../../db');

async function query(sql, params){
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Cria um novo pedido a partir de itens do carrinho
// Body esperado: { itens:[{ id_produto, quantidade }], endereçoOpcional, observacao }
exports.criarPedido = async (req,res,next)=>{
  const { itens } = req.body || {};
  const idComprador = req.user.id_usuario;
  if(!Array.isArray(itens) || !itens.length){
    return res.status(400).json({ message: 'Carrinho vazio.' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Buscar dados de produtos e validar estoque
    const ids = itens.map(i=> i.id_produto);
    const produtos = await conn.query(`SELECT id_produto, preco, estoque FROM Produtos WHERE id_produto IN (${ids.map(()=>'?').join(',')}) FOR UPDATE`, ids);
    const map = new Map(produtos[0].map(p=> [p.id_produto, p]));
    let total = 0;
    for(const item of itens){
      const p = map.get(item.id_produto);
      if(!p) throw new Error(`Produto ${item.id_produto} não encontrado`);
      if(p.estoque < item.quantidade) throw new Error(`Estoque insuficiente para produto ${item.id_produto}`);
      total += p.preco * item.quantidade;
    }
    // Criar pedido
    const [pedidoResult] = await conn.query(`INSERT INTO Pedidos (id_comprador, status_pedido, total) VALUES (?, 'PENDENTE', ?)`, [idComprador, total]);
    const idPedido = pedidoResult.insertId;
    // Inserir itens e atualizar estoque
    for(const item of itens){
      const p = map.get(item.id_produto);
      await conn.query(`INSERT INTO ItensPedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES (?,?,?,?)`, [idPedido, item.id_produto, item.quantidade, p.preco]);
      await conn.query(`UPDATE Produtos SET estoque = estoque - ? WHERE id_produto=?`, [item.quantidade, item.id_produto]);
    }
    await conn.commit();
    res.status(201).json({ id_pedido: idPedido, total });
  } catch(err){
    await conn.rollback();
    err.status = 400;
    next(err);
  } finally {
    conn.release();
  }
};
