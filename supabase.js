/**
 * @file Módulo de configuração e inicialização do cliente Supabase.
 *
 * Este arquivo é responsável por:
 * 1. Carregar as variáveis de ambiente necessárias (URL e Chave de Serviço).
 * 2. Criar uma instância única do cliente Supabase para ser usada em toda a aplicação.
 * 3. Utilizar a chave 'service_role' para operações de backend que exigem privilégios de administrador.
 * 4. Exportar o cliente configurado.
 */

const { createClient } = require('@supabase/supabase-js');

// Garante que as variáveis de ambiente do arquivo .env sejam carregadas.
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação crítica: A aplicação não deve iniciar sem as credenciais do Supabase.
if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('ERRO FATAL: As variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY devem ser definidas no arquivo .env');
  process.exit(1); // Encerra o processo com código de erro.
}

// Criação do cliente Supabase para o backend.
// Usamos a 'service_role' key para ter acesso administrativo total,
// o que permite contornar as políticas de Row Level Security (RLS).
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    // Desabilita o auto-refresh do token e a persistência de sessão no lado do servidor.
    // É uma boa prática, pois a chave de serviço não expira e não há sessão de usuário para gerenciar.
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('Cliente Supabase (Admin) inicializado com sucesso.');

module.exports = supabase;