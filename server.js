// Início do servidor
// Servidor Express principal do backend
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./supabase'); // Cliente Supabase
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');
const { verifyToken } = require('./src/middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3049;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rota de exemplo para testar a conexão com o Supabase
app.get('/', (req, res) => {
  res.send('API MarketHub com Supabase está funcionando!');
});

// Rota para buscar todos os produtos direto do Supabase
app.get('/api/produtos', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*');
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

// Rotas de autenticação e usuários
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Rota protegida para servir imagens de produtos
app.get('/uploads/produtos/:img', verifyToken, (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'produtos', req.params.img);
  res.sendFile(filePath);
});

// Rotas de produtos (implementação própria)
app.use('/api/produtos', produtoRoutes);

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(err.status || 500).json({ message: err.message || 'Erro interno do servidor' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
