
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
