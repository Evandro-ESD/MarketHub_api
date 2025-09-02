
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Login: valida usuário e gera token JWT
exports.login = async (req, res, next) => {
	const { nome, senha } = req.body;
	if (!nome || !senha) {
		return res.status(400).json({ message: 'Nome e senha são obrigatórios.' });
	}

	try {
		// Busca o usuário pelo nome usando o model
		const usuario = await User.findByNome(nome);

		// Compara a senha de forma segura. Se o usuário não existir, a comparação falhará.
		const senhaValida = usuario ? await bcrypt.compare(senha, usuario.senha) : false;

		if (!senhaValida) {
			// Mensagem genérica para não informar se o usuário existe ou a senha está errada
			return res.status(401).json({ message: 'Usuário ou senha inválidos' });
		}

		// Dados para o token
		const payload = {
			id_usuario: usuario.id_usuario,
			nome: usuario.nome,
			perfil: usuario.perfil
		};
		const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
		res.json({
			token,
			nome: usuario.nome,
			foto: usuario.foto,
			perfil: usuario.perfil
		});
	} catch (err) {
		next(err);
	}
};
//Login, registro, refresh token