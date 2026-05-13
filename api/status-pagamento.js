// api/status-pagamento.js
// Consulta o status de um pagamento específico (usado pelo front para verificar após o Pix)

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') return res.status(405).json({ erro: 'Método não permitido' });

  const id = String(req.query.id || '').replace(/\D/g, '');
  if (!id || id.length > 20) return res.status(400).json({ erro: 'ID inválido' });

  const { data, error } = await supabase
    .from('pedidos')
    .select('status, email')
    .eq('mp_payment_id', id)
    .single();

  if (error || !data) return res.status(404).json({ erro: 'Pedido não encontrado' });

  return res.status(200).json({ status: data.status, email: data.email });
}
