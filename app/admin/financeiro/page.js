"use client";
import { useState, useEffect } from "react";

function KpiCard({ icon, label, value, sub, color = "text-white" }) {
    return (
        <div className="bg-white/2 border border-white/6 rounded-2xl p-4">
            <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{icon}</span>
            </div>
            <p className={`text-3xl font-black ${color}`}>{value ?? "—"}</p>
            <p className="text-white/50 text-sm mt-1">{label}</p>
            {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
        </div>
    );
}

const RANGES = [
    { label: "7 dias", value: "7d" },
    { label: "30 dias", value: "30d" },
    { label: "90 dias", value: "90d" },
    { label: "1 ano", value: "1y" },
];

export default function FinanceiroPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("30d");
    const [transactions, setTransactions] = useState([]);
    const [txLoading, setTxLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/admin/system?range=${range}`)
            .then(r => r.json())
            .then(d => { setData(d?.data || null); setLoading(false); })
            .catch(() => setLoading(false));
    }, [range]);

    useEffect(() => {
        // Try to get credit transactions
        setTxLoading(true);
        fetch("/api/admin/users")
            .then(r => r.json())
            .then(d => {
                // Sort users by credits desc to show top spenders. Using correctly packaged d.data array.
                const userList = Array.isArray(d?.data) ? d.data : [];
                const sorted = userList.sort((a, b) => (b.credits || 0) - (a.credits || 0));
                setTransactions(sorted.slice(0, 10));
                setTxLoading(false);
            })
            .catch(() => setTxLoading(false));
    }, []);

    const overview = data?.overview;
    const actions = data?.actionQueue;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-white">💰 Dashboard Financeiro</h1>
                    <p className="text-white/40 text-sm mt-0.5">Créditos, transações e performance do negócio</p>
                </div>
                {/* Range selector */}
                <div className="flex gap-1 bg-white/3 p-1 rounded-xl">
                    {RANGES.map(r => (
                        <button key={r.value} onClick={() => setRange(r.value)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === r.value ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
                            {r.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-white/20">Carregando dados...</div>
            ) : (
                <>
                    {/* KPIs — Users */}
                    <div>
                        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">👥 Usuários</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <KpiCard icon="👤" label="Total de usuários" value={overview?.users?.total} color="text-white" />
                            <KpiCard icon="💆" label="Massagistas (Providers)" value={overview?.users?.providers} color="text-pink-400" />
                            <KpiCard icon="✅" label="Total Ativos" value={overview?.users?.total} color="text-green-400" />
                        </div>
                    </div>

                    {/* KPIs — Listings */}
                    <div>
                        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">📋 Anúncios</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <KpiCard icon="📋" label="Total de anúncios" value={overview?.listings?.total} color="text-white" />
                            <KpiCard icon="✅" label="Ativos" value={overview?.listings?.active} color="text-green-400" />
                            <KpiCard icon="⏳" label="Aguardando aprovação" value={overview?.listings?.pending} color="text-yellow-400" />
                        </div>
                    </div>

                    {/* KPIs — Verifications */}
                    <div>
                        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">✅ Ações Pendentes</p>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <KpiCard icon="⏳" label="Verificações na Fila" value={actions?.pendingVerificationsCount} color="text-yellow-400" />
                            <KpiCard icon="💬" label="Reviews na Fila" value={actions?.pendingReviewsCount} color="text-yellow-400" />
                        </div>
                    </div>

                    {/* KPIs — Transactions */}
                    <div>
                        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">🤝 Escrow & Financeiro</p>
                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <KpiCard icon="💰" label="Arrecadação Total" value={`$${(overview?.financial?.totalRevenue || 0).toLocaleString()}`} color="text-purple-400" />
                            <KpiCard icon="💵" label="Créditos no Sistema" value={`$${Math.round(overview?.financial?.totalCreditsInSystem || 0)}`} color="text-white" />
                            <KpiCard icon="🏦" label="Em Custódia Escrow" value={`$${overview?.financial?.totalEscrowAmount?.toLocaleString() || 0}`} color="text-green-400" />
                            <KpiCard icon="⏳" label="Transações Escrow" value={overview?.financial?.pendingEscrows} color="text-yellow-400" />
                            <KpiCard icon="⚠️" label="Em disputa" value={overview?.financial?.disputedEscrows} color="text-red-400" />
                        </div>
                    </div>

                    {/* Top Users by Credits */}
                    <div>
                        <p className="text-white/30 text-xs font-semibold uppercase tracking-wider mb-3">🏆 Top Usuários por Créditos</p>
                        <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-white/6">
                                        <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">#</th>
                                        <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Usuário</th>
                                        <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Perfil</th>
                                        <th className="text-right px-4 py-3 text-white/30 font-semibold text-xs">Créditos</th>
                                        <th className="text-right px-4 py-3 text-white/30 font-semibold text-xs">Cadastro</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {txLoading ? (
                                        <tr><td colSpan={5} className="text-center py-6 text-white/20">Carregando...</td></tr>
                                    ) : transactions.map((u, i) => (
                                        <tr key={u.id} className="border-b border-white/4 hover:bg-white/3 transition-all">
                                            <td className="px-4 py-3 text-white/30 text-xs font-mono">#{i + 1}</td>
                                            <td className="px-4 py-3">
                                                <div>
                                                    <p className="text-white text-xs font-medium">{u.name || "—"}</p>
                                                    <p className="text-white/30 text-[10px]">{u.email}</p>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "provider" ? "text-pink-400 bg-pink-500/10" : "text-blue-400 bg-blue-500/10"}`}>
                                                    {u.role === "provider" ? "Massagista" : "Cliente"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-yellow-400 font-black font-mono">{Math.round(u.credits || 0)}</span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-white/30 text-xs">
                                                {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
