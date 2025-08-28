
const pool = require('../../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Login: valida usuário e gera token JWT
exports.login = async (req, res, next) => {
	const { nome, senha } = req.body;
	try {
		const [rows] = await pool.query('SELECT * FROM usuarios WHERE nome = ?', [nome]);
		if (rows.length === 0) {
			return res.status(401).json({ message: 'Usuário não encontrado' });
		}
		const usuario = rows[0];
			const senhaValida = await bcrypt.compare(senha, usuario.senha);
			if (!senhaValida) {
				return res.status(401).json({ message: 'Senha incorreta' });
			}
		// Dados para o token
		const payload = {
			id_usuario: usuario.id_usuario,
			nome: usuario.nome,
			perfil: usuario.perfil
		};
		const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
		res.json({ token });
	} catch (err) {
		next(err);
	}
};
//Login, registro, refresh token