// api/webhook.js
// Recebe notificações do Mercado Pago, confirma o pagamento,
// debita o estoque e envia e-mail de confirmação para o cliente e para o admin

import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// ── Verificação de assinatura do MP ──────────────────────
// Documentação: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
function verificarAssinatura(req) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true; // em desenvolvimento pode estar vazio

  const xRequestId   = req.headers['x-request-id']   || '';
  const xSignature   = req.headers['x-signature']     || '';
  const xTimestamp   = req.headers['x-timestamp']     || '';

  const sigParts = Object.fromEntries(
    xSignature.split(',').map(p => p.split('='))
  );
  const ts  = sigParts['ts']  || xTimestamp;
  const v1  = sigParts['v1']  || '';

  const dataId = req.body?.data?.id || '';
  const template = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(template)
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}

// ── Envio de e-mail via Resend ────────────────────────────
async function enviarEmailCliente(pedido) {
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) { console.warn('[webhook] RESEND_API_KEY não configurada'); return; }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${resendKey}`
    },
    body: JSON.stringify({
      from:    process.env.EMAIL_FROM    || 'noreply@fortsecsecurity.com',
      to:      [pedido.email],
      subject: '✅ Pedido Confirmado — FORTSEC Security',
      html: `
        <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:0 auto">
          <h1 style="color:#00ff88;font-size:24px;letter-spacing:2px;margin-bottom:8px">PEDIDO CONFIRMADO</h1>
          <p style="color:#b0b0b0;font-size:14px;margin-bottom:32px">FORTSEC OFFENSIVE SECURITY</p>

          <p style="color:#fff;font-size:16px;margin-bottom:24px">
            Olá, <strong>${pedido.nome.split(' ')[0]}</strong>! Seu pagamento foi confirmado.
          </p>

          <div style="background:#121212;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:24px;margin-bottom:24px">
            <p style="color:#00ffff;font-size:12px;letter-spacing:2px;margin-bottom:12px">RESUMO DO PEDIDO</p>
            <p style="color:#b0b0b0;font-size:14px;line-height:2">
              <strong style="color:#fff">Produto:</strong> Bluetooth Jammer 2.4 GHz<br>
              <strong style="color:#fff">Valor:</strong> R$ 350,00<br>
              <strong style="color:#fff">Entrega:</strong> ${pedido.logradouro}, ${pedido.numero}${pedido.complemento ? ', ' + pedido.complemento : ''} — ${pedido.bairro}, ${pedido.cidade}/${pedido.estado} — CEP ${pedido.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}
            </p>
          </div>

          <div style="background:#121212;border:1px solid rgba(153,69,255,0.3);border-radius:10px;padding:24px;margin-bottom:32px">
            <p style="color:#9945ff;font-size:12px;letter-spacing:2px;margin-bottom:8px">PRÓXIMOS PASSOS</p>
            <p style="color:#b0b0b0;font-size:14px;line-height:1.8">
              Seu aparelho será preparado e despachado em breve.<br>
              Assim que for enviado, você receberá um novo e-mail com o <strong style="color:#00ffff">código de rastreio dos Correios</strong>.
            </p>
          </div>

          <p style="color:#606060;font-size:12px;text-align:center">
            FORTSEC OFFENSIVE SECURITY · contato@fortsecsecurity.com
          </p>
        </div>
      `
    })
  });
}

async function enviarEmailAdmin(pedido) {
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!resendKey || !adminEmail) return;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${resendKey}`
    },
    body: JSON.stringify({
      from:    process.env.EMAIL_FROM || 'noreply@fortsecsecurity.com',
      to:      [adminEmail],
      subject: `🛒 Novo Pedido Confirmado — ${pedido.nome}`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#0a0a0a;color:#fff;padding:40px;border-radius:12px;max-width:600px;margin:0 auto">
          <h1 style="color:#00ffff;font-size:22px;letter-spacing:2px;margin-bottom:24px">NOVO PEDIDO PAGO</h1>

          <div style="background:#121212;border:1px solid rgba(0,255,255,0.3);border-radius:10px;padding:24px;margin-bottom:20px">
            <p style="color:#00ffff;font-size:11px;letter-spacing:2px;margin-bottom:14px">CLIENTE</p>
            <p style="color:#b0b0b0;font-size:14px;line-height:2.2">
              <strong style="color:#fff">Nome:</strong> ${pedido.nome}<br>
              <strong style="color:#fff">CPF:</strong>  ${pedido.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')}<br>
              <strong style="color:#fff">Email:</strong> ${pedido.email}<br>
              <strong style="color:#fff">MP ID:</strong> ${pedido.mp_payment_id}
            </p>
          </div>

          <div style="background:#121212;border:1px solid rgba(0,255,136,0.3);border-radius:10px;padding:24px">
            <p style="color:#00ff88;font-size:11px;letter-spacing:2px;margin-bottom:14px">ENDEREÇO DE ENTREGA (CORREIOS)</p>
            <p style="color:#b0b0b0;font-size:14px;line-height:2.2">
              <strong style="color:#fff">CEP:</strong> ${pedido.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}<br>
              <strong style="color:#fff">Logradouro:</strong> ${pedido.logradouro}, ${pedido.numero}${pedido.complemento ? ' — ' + pedido.complemento : ''}<br>
              <strong style="color:#fff">Bairro:</strong> ${pedido.bairro}<br>
              <strong style="color:#fff">Cidade/UF:</strong> ${pedido.cidade}/${pedido.estado}
            </p>
          </div>
        </div>
      `
    })
  });
}

// ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).end();

  // Verificar assinatura do MP
  try {
    if (!verificarAssinatura(req)) {
      console.warn('[webhook] assinatura inválida');
      return res.status(401).end();
    }
  } catch (_) {
    return res.status(401).end();
  }

  // MP envia notificações de vários tipos; só nos importa "payment"
  const topic = req.body?.type || req.body?.topic;
  if (topic !== 'payment') return res.status(200).end();

  const paymentId = String(req.body?.data?.id || '');
  if (!paymentId) return res.status(200).end();

  // Buscar status real do pagamento no MP
  let mpPayment;
  try {
    const payment = new Payment(mp);
    mpPayment = await payment.get({ id: paymentId });
  } catch (err) {
    console.error('[webhook] erro ao buscar pagamento MP:', err.message);
    return res.status(200).end(); // 200 para o MP não retentar em loop
  }

  if (mpPayment.status !== 'approved') {
    // Não aprovado ainda — nada a fazer
    return res.status(200).end();
  }

  // Buscar pedido no Supabase
  const { data: pedido, error: fetchErr } = await supabase
    .from('pedidos')
    .select('*')
    .eq('mp_payment_id', paymentId)
    .single();

  if (fetchErr || !pedido) {
    console.error('[webhook] pedido não encontrado:', paymentId);
    return res.status(200).end();
  }

  // Idempotência: se já foi processado, ignorar
  if (pedido.status === 'pago') return res.status(200).end();

  // Atualizar status no Supabase
  await supabase
    .from('pedidos')
    .update({ status: 'pago', pago_em: new Date().toISOString() })
    .eq('mp_payment_id', paymentId);

  // Decrementar estoque pela quantidade comprada
  const qtd = pedido.quantidade || 1;
  await supabase.rpc('decrementar_estoque_qtd', { produto_id: 'jammer', qtd });

  // Disparar e-mails
  await Promise.allSettled([
    enviarEmailCliente(pedido),
    enviarEmailAdmin(pedido)
  ]);

  console.log(`[webhook] pedido ${paymentId} confirmado para ${pedido.email}`);

  return res.status(200).end();
}
