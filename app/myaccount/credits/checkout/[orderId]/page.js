"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

const POLL_INTERVAL = 10000; // 10s
const MAX_POLLS = 36; // 6 min
const EXPIRE_SECONDS = 20 * 60; // 20 min countdown

function QRCode({ value, size = 200 }) {
  const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=18181b&color=f4f4f5&margin=10`;
  return (
    <img
      src={src}
      alt="QR Code Bitcoin"
      width={size}
      height={size}
      className="rounded-xl border border-white/10"
    />
  );
}

function CopyButton({ text, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="shrink-0 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 text-xs font-medium transition-all flex items-center gap-1.5"
    >
      {copied ? (
        <><span className="text-green-400">✓</span> Copiado!</>
      ) : (
        <><span>📋</span> {label || "Copiar"}</>
      )}
    </button>
  );
}

function Countdown({ expiresAt, onExpire }) {
  const [remaining, setRemaining] = useState(null);

  useEffect(() => {
    const end = expiresAt ? new Date(expiresAt).getTime() : Date.now() + EXPIRE_SECONDS * 1000;
    const tick = () => {
      const diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
      setRemaining(diff);
      if (diff === 0 && onExpire) onExpire();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [expiresAt]);

  if (remaining === null) return null;
  const m = Math.floor(remaining / 60).toString().padStart(2, "0");
  const s = (remaining % 60).toString().padStart(2, "0");
  const isLow = remaining < 120;

  return (
    <div className={`flex items-center gap-2 text-sm font-mono font-bold ${isLow ? "text-red-400 animate-pulse" : "text-white/40"}`}>
      <span>⏱</span>
      <span>{m}:{s}</span>
    </div>
  );
}

export default function CheckoutPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [payment, setPayment] = useState(null); // loaded from sessionStorage
  const [status, setStatus] = useState("waiting"); // waiting | confirmed | expired | error
  const [polls, setPolls] = useState(0);
  const intervalRef = useRef(null);

  // Load payment data from sessionStorage (set by buy page)
  useEffect(() => {
    const raw = sessionStorage.getItem(`payment_${orderId}`);
    if (raw) {
      try { setPayment(JSON.parse(raw)); } catch { }
    }
  }, [orderId]);

  // Poll check-payment
  useEffect(() => {
    if (!orderId || status !== "waiting") return;

    const check = async () => {
      try {
        const res = await fetch(`/api/credits/check-payment?orderId=${orderId}`);
        const d = await res.json();
        if (d.confirmed) {
          setStatus("confirmed");
          clearInterval(intervalRef.current);
          sessionStorage.removeItem(`payment_${orderId}`);
        }
      } catch { /* ignore */ }

      setPolls((p) => {
        if (p >= MAX_POLLS) {
          clearInterval(intervalRef.current);
        }
        return p + 1;
      });
    };

    check();
    intervalRef.current = setInterval(check, POLL_INTERVAL);
    return () => clearInterval(intervalRef.current);
  }, [orderId, status]);

  const handleExpire = () => {
    setStatus("expired");
    clearInterval(intervalRef.current);
  };

  // ── CONFIRMED ──────────────────────────────────────────────────────────────
  if (status === "confirmed") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
          <span className="text-5xl">✅</span>
        </div>
        <h1 className="text-3xl font-black text-white">Pagamento Confirmado!</h1>
        <p className="text-text-muted max-w-sm text-sm">
          Seu pagamento Bitcoin foi confirmado na rede. {payment?.credits} créditos foram adicionados à sua conta.
        </p>
        <Link
          href="/myaccount/credits"
          className="btn-primary px-8 py-3 rounded-xl font-bold text-white"
        >
          Ver Meus Créditos →
        </Link>
      </div>
    );
  }

  // ── EXPIRED ────────────────────────────────────────────────────────────────
  if (status === "expired") {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 animate-fade-in">
        <div className="w-24 h-24 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <span className="text-5xl">⏰</span>
        </div>
        <h1 className="text-3xl font-black text-white">Tempo Expirado</h1>
        <p className="text-text-muted max-w-sm text-sm">
          O endereço BTC expirou. Gere um novo pagamento para continuar.
        </p>
        <Link
          href="/myaccount/credits/buy"
          className="btn-primary px-8 py-3 rounded-xl font-bold text-white"
        >
          Tentar Novamente
        </Link>
      </div>
    );
  }

  // ── WAITING (main checkout UI) ─────────────────────────────────────────────
  const btcAddress = payment?.payAddress || "";
  const btcAmount = payment?.payAmount || "";
  const btcUri = btcAddress ? `bitcoin:${btcAddress}${btcAmount ? `?amount=${btcAmount}` : ""}` : "";

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-fade-in">

      {/* Header */}
      <div className="glass-card p-6 bg-gradient-to-r from-orange-500/10 via-background to-yellow-500/10 border-orange-500/20 flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 shrink-0">
          <span className="text-2xl">₿</span>
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-white">Pagar com Bitcoin</h1>
          {payment && (
            <p className="text-text-muted text-sm mt-0.5">
              {payment.label} — <span className="text-orange-400 font-bold">${payment.priceUSD}</span> →{" "}
              <span className="text-primary font-bold">⚡ {payment.credits} créditos</span>
            </p>
          )}
        </div>
        {payment?.expiresAt && (
          <Countdown expiresAt={payment.expiresAt} onExpire={handleExpire} />
        )}
      </div>

      {/* No payment data fallback */}
      {!payment && (
        <div className="glass-card p-6 bg-yellow-500/5 border-yellow-500/20 text-center space-y-3">
          <p className="text-yellow-300 text-sm">Dados do pagamento não encontrados. Retorne e tente novamente.</p>
          <Link href="/myaccount/credits/buy" className="btn-secondary px-6 py-2 rounded-xl text-sm inline-block">
            ← Voltar
          </Link>
        </div>
      )}

      {payment && (
        <>
          {/* QR + Address */}
          <div className="glass-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* QR Code */}
              <div className="shrink-0">
                <a href={btcUri} title="Abrir na carteira Bitcoin">
                  <QRCode value={btcUri || btcAddress} size={180} />
                </a>
                <p className="text-white/30 text-xs text-center mt-2">Clique para abrir na carteira</p>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4 w-full">
                {/* BTC Amount */}
                <div>
                  <p className="text-white/40 text-xs mb-1.5 uppercase tracking-wider">Valor a Pagar</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-orange-400 font-bold text-lg truncate">
                      {btcAmount} BTC
                    </div>
                    <CopyButton text={String(btcAmount)} label="BTC" />
                  </div>
                  <p className="text-white/25 text-xs mt-1 ml-1">≈ ${payment.priceUSD} USD</p>
                </div>

                {/* BTC Address */}
                <div>
                  <p className="text-white/40 text-xs mb-1.5 uppercase tracking-wider">Endereço Bitcoin</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 font-mono text-white/70 text-xs break-all">
                      {btcAddress}
                    </div>
                    <CopyButton text={btcAddress} label="Endereço" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Status polling */}
          <div className="glass-card p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
              <svg className="animate-spin w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-sm">Aguardando pagamento na rede Bitcoin</p>
              <p className="text-white/30 text-xs mt-0.5">
                Esta página verifica automaticamente a cada 10 segundos. Não feche esta aba.
              </p>
            </div>
            <span className="text-white/20 text-xs font-mono">{polls}/{MAX_POLLS}</span>
          </div>

          {/* Instructions */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-white font-bold text-sm">Como pagar</h3>
            <ol className="space-y-2 text-text-muted text-xs list-decimal list-inside">
              <li>Abra sua carteira Bitcoin (Coinbase, Cash App, Exodus, etc.)</li>
              <li>Escaneie o QR Code <strong className="text-white/60">ou</strong> copie o endereço acima</li>
              <li>Envie exatamente <strong className="text-orange-400">{btcAmount} BTC</strong></li>
              <li>Aguarde — seus créditos aparecem automaticamente após confirmação</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="glass-card p-4 bg-red-500/5 border-red-500/10 flex items-start gap-3">
            <span className="text-red-400 text-lg shrink-0 mt-0.5">⚠️</span>
            <p className="text-red-300/70 text-xs">
              Envie <strong className="text-red-300">apenas Bitcoin (BTC)</strong> para este endereço. Outros tokens ou redes resultam em perda permanente de fundos.
            </p>
          </div>

          {/* Order ID */}
          <div className="flex items-center justify-between text-white/20 text-xs px-1">
            <span>Order: <span className="font-mono">{orderId}</span></span>
            <Link href="/myaccount/credits/buy" className="hover:text-white/40 transition-all">
              ← Cancelar
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
