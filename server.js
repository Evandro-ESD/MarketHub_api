// Início do servidor
// Servidor Express principal do backend
const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path'); // Importa o módulo path
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const PORT = process.env.PORT || 3049;

// Middlewares globais
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do diretório uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas de autenticação
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Rota pública para servir imagens de produtos
app.get('/uploads/produtos/:img', (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'produtos', req.params.img);
  res.sendFile(filePath);
});

//Rota de produtos
const produtoRoutes = require('./src/routes/produtoRoutes');
app.use('/api/produtos', produtoRoutes);

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
