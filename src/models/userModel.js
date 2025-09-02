const supabase = require('../../supabase');
const bcrypt = require('bcrypt');

// Retorna todos os usuários sem suas senhas
exports.findAll = async () => {
	const { data, error } = await supabase
		.from('usuarios')
		.select('id_usuario, nome, perfil, foto, authtoken');

	if (error) throw error;
	return data;
};

// Encontra um usuário pelo ID
exports.findById = async (id) => {
	const { data, error } = await supabase
		.from('usuarios')
		.select('*')
		.eq('id_usuario', id)
		.single(); // .single() retorna um objeto em vez de um array

	if (error) throw error;
	return data;
};

// Encontra um usuário pelo nome (útil para login)
exports.findByNome = async (nome) => {
	const { data, error } = await supabase
		.from('usuarios')
		.select('*')
		.eq('nome', nome)
		.single();

	if (error) throw error;
	return data;
};

// Cria um novo usuário
exports.create = async (userData) => {
	const { nome, senha, perfil, foto, authtoken } = userData;
	const hash = await bcrypt.hash(senha, 10);

	const { data, error } = await supabase
		.from('usuarios')
		.insert({ nome, senha: hash, perfil, foto, authtoken })
		.select('id_usuario, nome, perfil, foto, authtoken') // Retorna os dados inseridos sem a senha
		.single();

	if (error) throw error;
	return data;
};

// Atualiza os dados de um usuário
exports.update = async (id, userData) => {
	const fieldsToUpdate = { ...userData };

	// Garante que a chave primária não seja alterada
	delete fieldsToUpdate.id_usuario;

	// Se a senha for atualizada, faz o hash
	if (fieldsToUpdate.senha) {
		fieldsToUpdate.senha = await bcrypt.hash(fieldsToUpdate.senha, 10);
	}

	if (Object.keys(fieldsToUpdate).length === 0) {
		return null;
	}

	const { data, error } = await supabase
		.from('usuarios')
		.update(fieldsToUpdate)
		.eq('id_usuario', id)
		.select('id_usuario, nome, perfil, foto, authtoken')
		.single();

	// O erro 'PGRST116' indica que o registro não foi encontrado para atualizar
	if (error && error.code === 'PGRST116') {
		return null;
	}
	if (error) throw error;

	return data;
};

// Deleta um usuário pelo ID
exports.remove = async (id) => {
	const { count, error } = await supabase
		.from('usuarios')
		.delete({ count: 'exact' }) // Pede para o Supabase retornar a contagem de linhas afetadas
		.eq('id_usuario', id);

	if (error) throw error;

	return count; // Retorna o número de linhas deletadas (0 ou 1)
};