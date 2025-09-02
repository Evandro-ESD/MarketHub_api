// Configuração principal do Express
const express = require('express');
const supabase = require('./supabase'); // Importa o cliente Supabase configurado

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON no corpo das requisições
app.use(express.json());

// Rota de exemplo para testar a conexão com o Supabase
app.get('/', (req, res) => {
  res.send('API MarketHub com Supabase está funcionando!');
});

// --- Exemplo de Rota para Interagir com o Supabase ---
// GET: Buscar todos os itens de uma tabela 'produtos'
app.get('/api/produtos', async (req, res) => {
  try {
    // Usa o cliente Supabase para fazer uma query
    const { data, error } = await supabase
      .from('produtos') // Substitua 'produtos' pelo nome da sua tabela
      .select('*');   // Seleciona todas as colunas

    // Se o Supabase retornar um erro na query
    if (error) {
      console.error('Erro do Supabase:', error.message);
      return res.status(400).json({ message: error.message });
    }

    res.status(200).json(data);
  } catch (e) {
    console.error('Erro inesperado no servidor:', e.message);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});