const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Pega as variáveis de ambiente para a conexão com o Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Cria e exporta o cliente Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;