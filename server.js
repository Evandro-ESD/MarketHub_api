// Início do servidor

// Servidor Express principal do backend
const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const app = express();
const PORT = process.env.PORT || 3049;

// Middlewares globais
app.use(cors());
app.use(express.json());


// Rotas de autenticação
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Rota protegida para servir imagens de produtos
const { verifyToken } = require('./src/middlewares/authMiddleware');
const path = require('path');
app.get('/uploads/produtos/:img', verifyToken, (req, res) => {
  const filePath = path.join(__dirname, 'uploads', 'produtos', req.params.img);
  res.sendFile(filePath);
});

//Rota de produtos
const produtoRoutes = require('./src/routes/produtoRoutes');
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
