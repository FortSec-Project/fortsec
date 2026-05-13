// api/admin.js
// Rotas do painel administrativo — PROTEGIDAS por token Bearer
// Operações: GET estoque/pedidos/waitlist, POST atualizar-estoque, POST rastreio

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Autenticação ──────────────────────────────────────────
function autenticar(req) {
  const auth  = req.headers['authorization'] || '';
  const token = auth.replace('Bearer ', '').trim();
  const adminToken = process.env.ADMIN_TOKEN || '';
  if (!adminToken || token.length === 0) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(adminToken));
  } catch (_) { return false; }
}

function sanitize(val, max = 300) {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>"';&`\\]/g, '').trim().slice(0, max);
}

// ── Enviar e-mail de rastreio via Resend ──────────────────
async function enviarEmailRastreio(pedido, codigoRastreio) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${resendKey}`
    },
    body: JSON.stringify({
      from:    process.env.EMAIL_FROM || 'noreply@fortsecsecurity.com',
      to:      [pedido.email],
      subject: '🚚 Seu pedido foi enviado! — FORTSEC Security',
      html: `
        <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:0 auto">
          <h1 style="color:#00ffff;font-size:22px;letter-spacing:2px;margin-bottom:8px">PEDIDO ENVIADO!</h1>
          <p style="color:#b0b0b0;font-size:14px;margin-bottom:32px">FORTSEC OFFENSIVE SECURITY</p>

          <p style="color:#fff;font-size:16px;margin-bottom:24px">
            Olá, <strong>${pedido.nome.split(' ')[0]}</strong>! Seu Bluetooth Jammer foi despachado.
          </p>

          <div style="background:#121212;border:1px solid rgba(0,255,255,0.4);border-radius:12px;padding:28px;margin-bottom:24px;text-align:center">
            <p style="color:#00ffff;font-size:11px;letter-spacing:3px;margin-bottom:12px">CÓDIGO DE RASTREIO</p>
            <p style="color:#00ff88;font-size:28px;font-weight:bold;letter-spacing:4px;font-family:monospace">${codigoRastreio}</p>
            <p style="color:#606060;font-size:12px;margin-top:12px">
              Rastreie em <a href="https://rastreamento.correios.com.br/app/index.php" style="color:#00ffff">correios.com.br</a>
            </p>
          </div>

          <div style="background:#121212;border:1px solid rgba(0,255,136,0.2);border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="color:#b0b0b0;font-size:13px;line-height:2">
              <strong style="color:#fff">Destinatário:</strong> ${pedido.nome}<br>
              <strong style="color:#fff">Endereço:</strong> ${pedido.logradouro}, ${pedido.numero}${pedido.complemento ? ', ' + pedido.complemento : ''} — ${pedido.bairro}, ${pedido.cidade}/${pedido.estado}<br>
              <strong style="color:#fff">CEP:</strong> ${pedido.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
            </p>
          </div>

          <p style="color:#606060;font-size:12px;text-align:center">
            Qualquer dúvida: contato@fortsecsecurity.com<br>
            FORTSEC OFFENSIVE SECURITY
          </p>
        </div>
      `
    })
  });
}

// ── Notificar waitlist via Resend ─────────────────────────
async function notificarWaitlist() {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) return 0;

  const { data: lista } = await supabase.from('waitlist').select('email').limit(200);
  if (!lista?.length) return 0;

  // Resend suporta até 50 destinatários por chamada
  const chunks = [];
  for (let i = 0; i < lista.length; i += 50) chunks.push(lista.slice(i, i + 50));

  for (const chunk of chunks) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
      body: JSON.stringify({
        from:    process.env.EMAIL_FROM || 'noreply@fortsecsecurity.com',
        to:      chunk.map(r => r.email),
        subject: '⚡ Bluetooth Jammer voltou ao estoque — FORTSEC',
        html: `
          <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:0 auto">
            <h1 style="color:#00ff88;font-size:22px;letter-spacing:2px;margin-bottom:8px">VOLTOU AO ESTOQUE!</h1>
            <p style="color:#b0b0b0;font-size:14px;margin-bottom:24px">FORTSEC OFFENSIVE SECURITY</p>
            <p style="color:#fff;font-size:16px;margin-bottom:28px">
              O Bluetooth Jammer 2.4 GHz voltou ao estoque! <br>
              Corra — as unidades são limitadas.
            </p>
            <a href="${process.env.SITE_URL}/jammer-detalhes"
               style="display:inline-block;padding:16px 40px;background:linear-gradient(135deg,#00ff88,#00ffff);border-radius:30px;color:#000;font-weight:bold;font-size:15px;text-decoration:none;letter-spacing:2px">
              COMPRAR AGORA
            </a>
            <p style="color:#606060;font-size:11px;margin-top:32px;text-align:center">
              FORTSEC OFFENSIVE SECURITY · contato@fortsecsecurity.com
            </p>
          </div>
        `
      })
    });
  }

  return lista.length;
}

// ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (!autenticar(req)) return res.status(401).json({ erro: 'Não autorizado' });

  const { action } = req.query;

  // ── GET dashboard ─────────────────────────────────────
  if (req.method === 'GET' && action === 'dashboard') {
    const [{ data: stock }, { data: pedidos }, { data: waitlist }] = await Promise.all([
      supabase.from('estoque').select('quantidade').eq('produto', 'jammer').single(),
      supabase.from('pedidos').select('*').order('criado_em', { ascending: false }).limit(100),
      supabase.from('waitlist').select('email, criado_em').order('criado_em', { ascending: false }).limit(200),
    ]);

    return res.status(200).json({
      estoque:  stock?.quantidade ?? 0,
      pedidos:  pedidos  || [],
      waitlist: waitlist || [],
    });
  }

  // ── POST atualizar estoque ────────────────────────────
  if (req.method === 'POST' && action === 'estoque') {
    const qtd = parseInt(req.body?.quantidade ?? -1, 10);
    if (isNaN(qtd) || qtd < 0 || qtd > 9999)
      return res.status(422).json({ erro: 'Quantidade inválida (0–9999)' });

    const eraZero = await (async () => {
      const { data } = await supabase.from('estoque').select('quantidade').eq('produto', 'jammer').single();
      return (data?.quantidade ?? 0) === 0;
    })();

    const { error } = await supabase
      .from('estoque')
      .upsert({ produto: 'jammer', quantidade: qtd }, { onConflict: 'produto' });

    if (error) return res.status(500).json({ erro: 'Erro ao atualizar estoque' });

    // Se estava zerado e agora tem estoque → notificar lista de espera
    let notificados = 0;
    if (eraZero && qtd > 0) {
      notificados = await notificarWaitlist();
      // Limpa a waitlist após notificação
      await supabase.from('waitlist').delete().neq('email', '');
    }

    return res.status(200).json({ ok: true, quantidade: qtd, notificados });
  }

  // ── POST lançar código de rastreio ────────────────────
  if (req.method === 'POST' && action === 'rastreio') {
    const paymentId = sanitize(req.body?.payment_id || '', 30).replace(/\D/g, '');
    const codigo    = sanitize(req.body?.codigo     || '', 30).toUpperCase();

    if (!paymentId || !codigo) return res.status(422).json({ erro: 'Dados incompletos' });

    const { data: pedido, error: fetchErr } = await supabase
      .from('pedidos')
      .select('*')
      .eq('mp_payment_id', paymentId)
      .single();

    if (fetchErr || !pedido) return res.status(404).json({ erro: 'Pedido não encontrado' });

    await supabase
      .from('pedidos')
      .update({ rastreio: codigo, status: 'enviado', enviado_em: new Date().toISOString() })
      .eq('mp_payment_id', paymentId);

    await enviarEmailRastreio(pedido, codigo);

    return res.status(200).json({ ok: true });
  }

  return res.status(404).json({ erro: 'Ação não encontrada' });
}
