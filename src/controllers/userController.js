
const pool = require('../../db');

// Busca todos os usuários
exports.getAllUsers = async (req, res, next) => {
	try {
		const [rows] = await pool.query('SELECT * FROM usuarios');
		res.json(rows);
	} catch (err) {
		next(err);
	}
};

// Criar usuário

const bcrypt = require('bcrypt');

exports.createUser = async (req, res, next) => {
	try {
		const { nome, senha, perfil, foto, authtoken } = req.body;
		const hash = await bcrypt.hash(senha, 10);
		const [result] = await pool.query(
			'INSERT INTO usuarios (nome, senha, perfil, foto, authtoken) VALUES (?, ?, ?, ?, ?)',
			[nome, hash, perfil, foto, authtoken]
		);
		res.status(201).json({ id_usuario: result.insertId, nome, perfil, foto, authtoken });
	} catch (err) {
		next(err);
	}
};

// Editar usuário
exports.updateUser = async (req, res, next) => {
	try {
		const { id_usuario } = req.params;
		const { nome, senha, perfil, foto, authtoken } = req.body;
		const [result] = await pool.query(
			'UPDATE usuarios SET nome = ?, senha = ?, perfil = ?, foto = ?, authtoken = ? WHERE id_usuario = ?',
			[nome, senha, perfil, foto, authtoken, id_usuario]
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: 'Usuário não encontrado' });
		}
		res.json({ id_usuario, nome, senha, perfil, foto, authtoken });
	} catch (err) {
		next(err);
	}
};

// Excluir usuário
exports.deleteUser = async (req, res, next) => {
	try {
		const { id_usuario } = req.params;
		const [result] = await pool.query(
			'DELETE FROM usuarios WHERE id_usuario = ?',
			[id_usuario]
		);
		if (result.affectedRows === 0) {
			return res.status(404).json({ message: 'Usuário não encontrado' });
		}
		res.json({ message: 'Usuário excluído com sucesso' });
	} catch (err) {
		next(err);
	}
};
