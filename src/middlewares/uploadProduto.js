const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Verifica e cria o diretório 'uploads/produtos' se necessário
const uploadDir = path.join(__dirname, '../../uploads/produtos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log(`Diretório criado: ${uploadDir}`);
} else {
  console.log(`Diretório já existe: ${uploadDir}`);
}

console.log('Middleware uploadProduto iniciado. Verificando diretório:', uploadDir);

// Filtro de tipo de arquivo
function fileFilter(req, file, cb) {
  console.log('Middleware uploadProduto: Verificando se o arquivo está sendo recebido.');
  const allowedMime = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedExt = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Arquivo de imagem inválido. Apenas JPG, PNG ou GIF são permitidos.'));
  }
}

// Configuração do destino e nome do arquivo
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.join(__dirname, '../../uploads/produtos');
    console.log('Salvando arquivo no diretório:', dir);
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const nomeArquivo = `${req.user.id_usuario}-${Date.now()}${ext}`;
    console.log('Nome do arquivo gerado:', nomeArquivo);
    cb(null, nomeArquivo);
  }
});

const uploadProduto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = uploadProduto;
