// api/waitlist.js
// Cadastra e-mail na lista de espera

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

function sanitize(val, max = 120) {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>"';&`\\]/g, '').trim().toLowerCase().slice(0, max);
}

function emailValido(e) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e);
}

// Rate limit por IP
const ipLog = new Map();
function rateLimit(ip) {
  const now   = Date.now();
  const entry = ipLog.get(ip) || { count: 0, first: now };
  if (now - entry.first > 60_000) { ipLog.set(ip, { count: 1, first: now }); return false; }
  if (entry.count >= 3) return true;
  entry.count++;
  ipLog.set(ip, entry);
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (rateLimit(ip)) return res.status(429).json({ erro: 'Muitas tentativas.' });

  const email = sanitize(req.body?.email || '');

  if (!emailValido(email)) return res.status(422).json({ erro: 'E-mail inválido' });

  // Upsert — se já existe ignora silenciosamente
  const { error } = await supabase
    .from('waitlist')
    .upsert({ email, criado_em: new Date().toISOString() }, { onConflict: 'email', ignoreDuplicates: true });

  if (error) {
    console.error('[waitlist]', error.message);
    return res.status(500).json({ erro: 'Erro ao cadastrar' });
  }

  return res.status(200).json({ ok: true });
}
