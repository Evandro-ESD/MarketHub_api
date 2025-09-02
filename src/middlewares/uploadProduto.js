const multer = require('multer');
const path = require('path');

// Filtro de tipo de arquivo
function fileFilter(req, file, cb) {
  console.log('Middleware uploadProduto: Verificando se o arquivo está sendo recebido.');
  const allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    // Para o error handler global, é útil adicionar um status code ao erro.
    const error = new Error('Arquivo de imagem inválido. Apenas JPG, PNG ou GIF são permitidos.');
    error.statusCode = 400;
    cb(error);
  }
}

// Configuração do armazenamento em memória.
// O arquivo ficará disponível em `req.file.buffer`.
const storage = multer.memoryStorage();

const uploadProduto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = uploadProduto;
