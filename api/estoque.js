// api/estoque.js
// Retorna a quantidade atual em estoque (endpoint público)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // CORS mínimo — só GET
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  try {
    const { data, error } = await supabase
      .from('estoque')
      .select('quantidade')
      .eq('produto', 'jammer')
      .single();

    if (error) throw error;

    return res.status(200).json({ quantidade: data.quantidade ?? 0 });
  } catch (err) {
    console.error('[estoque]', err.message);
    return res.status(500).json({ erro: 'Erro interno' });
  }
}
