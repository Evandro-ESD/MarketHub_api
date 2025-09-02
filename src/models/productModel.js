const supabase = require('../../supabase');

/**
 * Encontra um produto pelo seu ID.
 * @param {number | string} id - O ID do produto.
 * @returns {Promise<object|null>} O objeto do produto ou null se não for encontrado.
 */
exports.findById = async (id) => {
	const { data, error } = await supabase
		.from('produtos')
		.select('*')
		.eq('id_produto', id)
		.single();

	if (error) throw error;
	return data;
};

// No futuro, você pode adicionar outras funções aqui, como findAll, create, update, etc.