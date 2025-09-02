// Início do servidor
// Servidor Express principal do backend
const express = require('express');
const cors = require('cors');
<<<<<<< HEAD
const path = require('path'); // Importa o módulo path
=======
const path = require('path');
const supabase = require('./supabase'); // Cliente Supabase
>>>>>>> 618e272afaa1a1eebf8497b7c0af0bd9a1f8e735
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');
const { verifyToken } = require('./src/middlewares/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3049;

// Middlewares globais
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Servir arquivos estáticos do diretório uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
=======
// Rota de exemplo para testar a conexão com o Supabase
app.get('/', (req, res) => {
  res.send('API MarketHub com Supabase está funcionando!');
});
>>>>>>> 618e272afaa1a1eebf8497b7c0af0bd9a1f8e735

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

<<<<<<< HEAD
// Rota pública para servir imagens de produtos
app.get('/uploads/produtos/:img', (req, res) => {
=======
// Rota protegida para servir imagens de produtos
app.get('/uploads/produtos/:img', verifyToken, (req, res) => {
>>>>>>> 618e272afaa1a1eebf8497b7c0af0bd9a1f8e735
  const filePath = path.join(__dirname, 'uploads', 'produtos', req.params.img);
  res.sendFile(filePath);
});

// Rotas de produtos (implementação própria)
app.use('/api/produtos', produtoRoutes);

// Rotas de vendas (relatórios do vendedor)
const vendasRoutes = require('./src/routes/vendasRoutes');
app.use('/api/vendas', vendasRoutes);

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  if (err.code === 'ENOENT') {
    console.warn(`Arquivo não encontrado: ${err.path}`);
    return res.status(404).json({ message: 'Arquivo não encontrado.' });
  }

  console.error('Erro não tratado:', err);
  res.status(err.status || 500).json({ message: err.message || 'Erro interno do servidor' });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
