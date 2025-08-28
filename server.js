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

// Middleware global de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(err.status || 500).json({ message: err.message || 'Erro interno do servidor' });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
