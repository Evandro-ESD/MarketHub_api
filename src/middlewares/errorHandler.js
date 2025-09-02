//Tratamento de erros globais
function errorHandler(err, req, res, next) {
  console.error(err); // Loga o erro completo no console do servidor para depuração.

  // Status e mensagem padrão
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Ocorreu um erro interno no servidor.';

  // Personaliza a mensagem para o erro específico "Bucket not found"
  if (err.message && err.message.toLowerCase().includes('bucket not found')) {
    statusCode = 400; // Bad Request
    message = 'Erro de configuração do servidor: O repositório de arquivos (bucket) não foi encontrado.';
  }

  res.status(statusCode).json({
    message,
    // Em ambiente de desenvolvimento, é útil enviar o stack trace do erro.
    // Em produção, isso deve ser omitido por segurança.
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
}

module.exports = errorHandler;