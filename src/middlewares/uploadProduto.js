const multer = require('multer');
const path = require('path');

// Filtro de tipo de arquivo
function fileFilter(req, file, cb) {
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
    cb(null, path.join(__dirname, '../../uploads/produtos'));
  },
  filename: function (req, file, cb) {
    // Nome único: id_usuario-timestamp.extensão
    const ext = path.extname(file.originalname).toLowerCase();
    const nomeArquivo = `${req.user.id_usuario}-${Date.now()}${ext}`;
    cb(null, nomeArquivo);
  }
});

const uploadProduto = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB
});

module.exports = uploadProduto;
