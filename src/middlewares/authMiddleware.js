//Valida JWT

// Middleware de autenticação e autorização baseado em JWT
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verifica se o header Authorization contém um token Bearer válido
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Token não fornecido' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ message: 'Formato de token inválido' });

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // adiciona informações do usuário ao req para uso posterior
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Middleware gerador para verificar perfil/role do usuário (ex: 'VENDEDOR', 'COMPRADOR')
exports.verifyPerfil = (perfil) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Usuário não autenticado' });
  if (req.user.perfil !== perfil) return res.status(403).json({ message: 'Acesso negado' });
  next();
};
