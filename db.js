// Conexão com banco (MySQL)

// Conexão com o banco MySQL usando mysql2/promise
const mysql = require('mysql2/promise');
require('dotenv').config();


const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'market_hub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
// tratamento de erro de conexão ao banco de dados
pool.getConnection()
  .then(conn => {
    console.log('Conexão MySQL OK');
    conn.release();
  })
  .catch(err => {
    console.error('Erro ao conectar no MySQL:', err.message);
  });

// Exporta o pool para uso pelos controllers
module.exports = pool;
