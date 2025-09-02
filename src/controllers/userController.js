
const User = require('../models/userModel');

// Busca todos os usuários
exports.getAllUsers = async (req, res, next) => {
	try {
		const users = await User.findAll();
		res.json(users);
	} catch (err) {
		next(err);
	}
};

// Criar usuário
exports.createUser = async (req, res, next) => {
	try {
		const { nome, senha, perfil } = req.body;
		if (!nome || !senha || !perfil) {
			return res
				.status(400)
				.json({ message: 'Campos nome, senha e perfil são obrigatórios.' });
		}
		const newUser = await User.create(req.body);
		res.status(201).json(newUser);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Usuário com este nome já existe.' });
		}
		next(err);
	}
};

// Editar usuário
exports.updateUser = async (req, res, next) => {
	try {
		const { id_usuario } = req.params;

		if (Object.keys(req.body).length === 0) {
			return res
				.status(400)
				.json({ message: 'Nenhum campo para atualizar foi fornecido.' });
		}

		const updatedUser = await User.update(id_usuario, req.body);

		if (!updatedUser) {
			return res
				.status(404)
				.json({ message: 'Usuário não encontrado ou nenhum dado para atualizar.' });
		}
		res.json(updatedUser);
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			return res.status(409).json({ message: 'Já existe um usuário com este nome.' });
		}
		next(err);
	}
};

// Excluir usuário
exports.deleteUser = async (req, res, next) => {
	try {
		const { id_usuario } = req.params;
		const affectedRows = await User.remove(id_usuario);
		if (affectedRows === 0) {
			return res.status(404).json({ message: 'Usuário não encontrado' });
		}
		res.status(200).json({ message: 'Usuário excluído com sucesso' });
	} catch (err) {
		next(err);
	}
};
