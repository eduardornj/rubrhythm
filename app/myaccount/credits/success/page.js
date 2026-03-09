"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function PaymentSuccessPage() {
    const params = useSearchParams();
    const orderId = params.get("orderId");
    const [status, setStatus] = useState("pending"); // pending | confirmed | timeout
    const [attempts, setAttempts] = useState(0);

    // Poll our DB every 10s to check if the webhook was received and credits added
    useEffect(() => {
        if (!orderId) return;
        let interval;

        const check = async () => {
            try {
                const res = await fetch(`/api/credits/check-payment?orderId=${orderId}`);
                const d = await res.json();
                if (d.confirmed) {
                    setStatus("confirmed");
                    clearInterval(interval);
                }
            } catch { /* ignore */ }

            setAttempts((a) => {
                if (a >= 18) { // 18 * 10s = 3min max wait
                    setStatus("timeout");
                    clearInterval(interval);
                }
                return a + 1;
            });
        };

        check();
        interval = setInterval(check, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "#08080d" }}>
            <div className="max-w-md w-full mx-4 text-center">
                {status === "pending" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                            <span className="text-4xl animate-pulse">⚡</span>
                        </div>
                        <h1 className="text-2xl font-black text-white">Aguardando Confirmação</h1>
                        <p className="text-white/40 text-sm">
                            Seu pagamento Bitcoin está sendo processado na rede. Normalmente leva de 1 a 5 minutos.
                        </p>
                        <div className="bg-white/4 border border-white/8 rounded-2xl p-4">
                            <p className="text-white/30 text-xs mb-2">Order ID</p>
                            <p className="text-white/60 text-xs font-mono break-all">{orderId}</p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-white/30 text-sm">
                            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Verificando... ({attempts}/18)
                        </div>
                    </div>
                )}

                {status === "confirmed" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <span className="text-4xl">✅</span>
                        </div>
                        <h1 className="text-2xl font-black text-white">Créditos Adicionados!</h1>
                        <p className="text-white/50 text-sm">
                            Seu pagamento Bitcoin foi confirmado e os créditos já estão disponíveis na sua conta.
                        </p>
                        <Link
                            href="/myaccount/credits"
                            className="block w-full py-3 rounded-xl bg-green-500/15 border border-green-500/25 text-green-400 font-bold hover:bg-green-500/25 transition-all"
                        >
                            Ver Meus Créditos →
                        </Link>
                    </div>
                )}

                {status === "timeout" && (
                    <div className="space-y-6">
                        <div className="w-20 h-20 mx-auto rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                            <span className="text-4xl">⏳</span>
                        </div>
                        <h1 className="text-2xl font-black text-white">Pagamento em Processamento</h1>
                        <p className="text-white/50 text-sm">
                            O Bitcoin pode demorar um pouco mais para confirmar. Assim que a rede confirmar, seus créditos aparecem automaticamente.
                        </p>
                        <div className="space-y-3">
                            <Link
                                href="/myaccount/credits"
                                className="block w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/8 transition-all"
                            >
                                Verificar Créditos
                            </Link>
                            <Link
                                href="/myaccount/credits/buy"
                                className="block text-white/30 text-sm hover:text-white/50 transition-all"
                            >
                                Voltar
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
