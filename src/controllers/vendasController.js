const pool = require('../../db');

// Util: executa query segura
async function query(sql, params) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Resumo geral para o vendedor logado
exports.resumo = async (req, res, next) => {
  try {
    const idVendedor = req.user.id_usuario;

    const [totais] = await query(`
      SELECT 
        IFNULL(SUM(ip.quantidade * ip.preco_unitario),0) AS totalGeral
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ?
    `,[idVendedor]);

    const [hoje] = await query(`
      SELECT IFNULL(SUM(ip.quantidade * ip.preco_unitario),0) AS totalHoje,
             COUNT(DISTINCT p.id_pedido) AS pedidosHoje
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ? AND DATE(p.data_pedido) = CURDATE()
    `,[idVendedor]);

    const [mes] = await query(`
      SELECT IFNULL(SUM(ip.quantidade * ip.preco_unitario),0) AS totalMes
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ? AND YEAR(p.data_pedido)=YEAR(CURDATE()) AND MONTH(p.data_pedido)=MONTH(CURDATE())
    `,[idVendedor]);

    const [ano] = await query(`
      SELECT IFNULL(SUM(ip.quantidade * ip.preco_unitario),0) AS totalAno
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ? AND YEAR(p.data_pedido)=YEAR(CURDATE())
    `,[idVendedor]);

    res.json({
      totalGeral: Number(totais.totalGeral || 0),
      totalHoje: Number(hoje.totalHoje || 0),
      pedidosHoje: hoje.pedidosHoje || 0,
      totalMes: Number(mes.totalMes || 0),
      totalAno: Number(ano.totalAno || 0)
    });
  } catch(err){ next(err); }
};

// Série diária últimos N dias (default 7)
exports.diario = async (req,res,next)=>{
  try {
    const idVendedor = req.user.id_usuario;
    const dias = Math.min(parseInt(req.query.dias)||7, 60);
    const rows = await query(`
      SELECT DATE(p.data_pedido) AS dia, IFNULL(SUM(ip.quantidade * ip.preco_unitario),0) AS total
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ? AND p.data_pedido >= (CURDATE() - INTERVAL ? DAY)
      GROUP BY dia
      ORDER BY dia
    `,[idVendedor, dias]);
    res.json(rows);
  } catch(err){ next(err); }
};

// Série mensal ano informado (default ano atual)
exports.mensal = async (req,res,next)=>{
  try {
    const idVendedor = req.user.id_usuario;
    const ano = parseInt(req.query.ano) || new Date().getFullYear();
    const rows = await query(`
      SELECT MONTH(p.data_pedido) AS mes, IFNULL(SUM(ip.quantidade * ip.preco_unitario),0) AS total
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ? AND YEAR(p.data_pedido)=?
      GROUP BY mes
      ORDER BY mes
    `,[idVendedor, ano]);
    res.json({ ano, dados: rows });
  } catch(err){ next(err); }
};

// Série anual últimos X anos (default 5)
exports.anual = async (req,res,next)=>{
  try {
    const idVendedor = req.user.id_usuario;
    const anos = Math.min(parseInt(req.query.anos)||5, 20);
    const rows = await query(`
      SELECT YEAR(p.data_pedido) AS ano, IFNULL(SUM(ip.quantidade * ip.preco_unitario),0) AS total
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ? AND p.data_pedido >= DATE_SUB(CURDATE(), INTERVAL ? YEAR)
      GROUP BY ano
      ORDER BY ano
    `,[idVendedor, anos]);
    res.json(rows);
  } catch(err){ next(err); }
};

// Top produtos por faturamento
exports.topProdutos = async (req,res,next)=>{
  try {
    const idVendedor = req.user.id_usuario;
    const limite = Math.min(parseInt(req.query.limite)||5, 50);
    const rows = await query(`
      SELECT prod.id_produto, prod.nome_produto, 
             SUM(ip.quantidade) AS quantidade,
             SUM(ip.quantidade * ip.preco_unitario) AS faturamento
      FROM Pedidos p
      JOIN ItensPedido ip ON ip.id_pedido = p.id_pedido
      JOIN Produtos prod ON prod.id_produto = ip.id_produto
      WHERE prod.id_vendedor = ?
      GROUP BY prod.id_produto
      ORDER BY faturamento DESC
      LIMIT ?
    `,[idVendedor, limite]);
    res.json(rows);
  } catch(err){ next(err); }
};
