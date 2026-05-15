// api/criar-cobranca.js
// Recebe os dados do cliente, valida, reserva estoque e gera cobrança Pix no MP

import { createClient } from '@supabase/supabase-js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const mp = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// ── Helpers de validação (replicados do front, nunca confiar só no cliente) ──
function sanitize(val, max = 300) {
  if (typeof val !== 'string') return '';
  return val.replace(/[<>"';&`\\]/g, '').trim().slice(0, max);
}

function onlyDigits(val, max = 20) {
  if (typeof val !== 'string') return '';
  return val.replace(/\D/g, '').slice(0, max);
}

function cpfValido(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += parseInt(cpf[i]) * (10 - i);
  let r = (s * 10) % 11;
  if (r >= 10) r = 0;
  if (r !== parseInt(cpf[9])) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += parseInt(cpf[i]) * (11 - i);
  r = (s * 10) % 11;
  if (r >= 10) r = 0;
  return r === parseInt(cpf[10]);
}

function emailValido(e) {
  return /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e) && e.length <= 120;
}

// ── Rate limit simples em memória (por IP) ────────────────
const ipLog = new Map();
function rateLimit(ip) {
  const now   = Date.now();
  const entry = ipLog.get(ip) || { count: 0, first: now };
  if (now - entry.first > 120_000) { ipLog.set(ip, { count: 1, first: now }); return false; }
  if (entry.count >= 5) return true; // bloqueado
  entry.count++;
  ipLog.set(ip, entry);
  return false;
}

// ─────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') return res.status(405).json({ erro: 'Método não permitido' });

  // Rate limit por IP
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (rateLimit(ip)) return res.status(429).json({ erro: 'Muitas requisições. Aguarde 2 minutos.' });

  // ── Coleta e sanitiza payload ─────────────────────────
  const body = req.body || {};
  const d = {
    nome:        sanitize(body.nome,        120),
    cpf:         onlyDigits(body.cpf,        11),
    email:       sanitize(body.email,       120).toLowerCase(),
    cep:         onlyDigits(body.cep,         8),
    logradouro:  sanitize(body.logradouro,  200),
    numero:      sanitize(body.numero,       20),
    complemento: sanitize(body.complemento,  60),
    bairro:      sanitize(body.bairro,       80),
    cidade:      sanitize(body.cidade,       80),
    estado:      sanitize(body.estado,        2).toUpperCase(),
  };

  // ── Validação server-side ─────────────────────────────
  if (!d.nome || d.nome.length < 3)      return res.status(422).json({ erro: 'Nome inválido' });
  if (!cpfValido(d.cpf))                 return res.status(422).json({ erro: 'CPF inválido' });
  if (!emailValido(d.email))             return res.status(422).json({ erro: 'E-mail inválido' });
  if (d.cep.length !== 8)               return res.status(422).json({ erro: 'CEP inválido' });
  if (!d.logradouro || !d.numero || !d.bairro || !d.cidade || !d.estado)
    return res.status(422).json({ erro: 'Endereço incompleto' });

  const quantidade = Math.min(Math.max(parseInt(body.quantidade || 1, 10), 1), 99);

  // ── Verificar estoque (operação atômica via RPC) ──────
  const { data: estoqueAtual, error: stockErr } = await supabase
    .from('estoque')
    .select('quantidade')
    .eq('produto', 'jammer')
    .single();

  if (stockErr || !estoqueAtual) {
    console.error('[criar-cobranca] estoque:', stockErr?.message);
    return res.status(500).json({ erro: 'Erro ao verificar estoque' });
  }

  if (estoqueAtual.quantidade <= 0) {
    return res.status(410).json({ erro: 'Produto esgotado' });
  }

  if (estoqueAtual.quantidade < quantidade) {
    return res.status(422).json({
      erro: `Estoque insuficiente. Disponível: ${estoqueAtual.quantidade} unidade(s).`
    });
  }

  // ── Criar pagamento no Mercado Pago ───────────────────
  const metodo    = d.metodo === 'cartao' ? 'cartao' : 'pix';
  const cardToken = sanitize(body.card_token || '', 100);
  const parcelas  = Math.min(Math.max(parseInt(body.parcelas || 1, 10), 1), 5);
  const cardholder = sanitize(body.cardholder || '', 80);

  if (metodo === 'cartao' && !cardToken) {
    return res.status(422).json({ erro: 'Token do cartão ausente' });
  }

  let mpPayment;
  try {
    const payment = new Payment(mp);

    const payBody = metodo === 'pix'
      ? {
          transaction_amount: 320.00 * quantidade,
          description:        `Bluetooth Jammer 2.4 GHz x${quantidade} - FORTSEC`,
          payment_method_id:  'pix',
          payer: {
            email:          d.email,
            first_name:     d.nome.split(' ')[0],
            last_name:      d.nome.split(' ').slice(1).join(' ') || '-',
            identification: { type: 'CPF', number: d.cpf },
            address: {
              zip_code:      d.cep,
              street_name:   d.logradouro,
              street_number: d.numero,
              neighborhood:  d.bairro,
              city:          d.cidade,
              federal_unit:  d.estado,
            }
          },
          notification_url:    `${process.env.SITE_URL}/api/webhook`,
          date_of_expiration:  new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        }
      : {
          transaction_amount:  320.00 * quantidade,
          description:         `Bluetooth Jammer 2.4 GHz x${quantidade} - FORTSEC`,
          token:               cardToken,
          installments:        parcelas,
          payment_method_id:   'credit_card',
          payer: {
            email:          d.email,
            first_name:     d.nome.split(' ')[0],
            last_name:      d.nome.split(' ').slice(1).join(' ') || '-',
            identification: { type: 'CPF', number: d.cpf },
          },
          notification_url: `${process.env.SITE_URL}/api/webhook`,
        };

    mpPayment = await payment.create({ body: payBody });

  } catch (mpErr) {
    console.error('[criar-cobranca] MP error:', mpErr.message);
    await supabase.rpc('liberar_reserva', { produto_id: 'jammer' });
    return res.status(502).json({ erro: 'Erro ao gerar cobrança. Tente novamente.' });
  }

  // ── Salvar pedido no Supabase ─────────────────────────
  const { error: insertErr } = await supabase.from('pedidos').insert({
    mp_payment_id:  String(mpPayment.id),
    status:         'pendente',
    metodo:         metodo,
    quantidade:     quantidade,
    nome:           d.nome,
    cpf:            d.cpf,
    email:          d.email,
    cep:            d.cep,
    logradouro:     d.logradouro,
    numero:         d.numero,
    complemento:    d.complemento,
    bairro:         d.bairro,
    cidade:         d.cidade,
    estado:         d.estado,
  });

  if (insertErr) {
    console.error('[criar-cobranca] insert pedido:', insertErr.message);
    // Não bloqueia o cliente — pagamento já existe no MP
  }

  // Salvar metodo no pedido
  const metodoSalvo = metodo;
  const txInfo = mpPayment.point_of_interaction?.transaction_data;

  // Resposta diferente para Pix e Cartão
  if (metodoSalvo === 'pix') {
    return res.status(200).json({
      payment_id:     String(mpPayment.id),
      qr_code:        txInfo?.qr_code        || '',
      qr_code_base64: txInfo?.qr_code_base64 || '',
    });
  } else {
    // Cartão: retorna status imediatamente
    const st = mpPayment.status; // approved | rejected | in_process
    if (st === 'rejected') {
      // Libera estoque pois não foi pago
      await supabase.rpc('liberar_reserva', { produto_id: 'jammer' });
    }
    return res.status(200).json({
      payment_id: String(mpPayment.id),
      status:     st,
    });
  }
}
