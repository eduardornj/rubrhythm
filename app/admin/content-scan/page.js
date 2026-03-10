"use client";
import { useState } from "react";
import Link from "next/link";

export default function ContentScanPage() {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [severity, setSeverity] = useState("all");
    const [approved, setApproved] = useState("all");

    const runScan = async () => {
        setLoading(true);
        setResults(null);
        try {
            const params = new URLSearchParams({ severity, approved });
            const res = await fetch(`/api/admin/content-scan?${params}`);
            const data = await res.json();
            setResults(data);
        } catch {
            alert("Erro ao executar scan.");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-xl font-black text-white">🔍 Content Scan</h1>
                <p className="text-white/40 text-sm mt-0.5">
                    Escaneia todos os listings existentes com o filtro de conteúdo atualizado.
                </p>
            </div>

            {/* Filters + Run */}
            <div className="flex flex-wrap items-end gap-3 p-4 bg-white/2 border border-white/6 rounded-2xl">
                <div className="flex flex-col gap-1">
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wide">Severidade</label>
                    <select
                        value={severity}
                        onChange={e => setSeverity(e.target.value)}
                        className="bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                        <option value="all">Todos (RED + YELLOW)</option>
                        <option value="red">Só RED (bloqueado)</option>
                        <option value="yellow">Só YELLOW (flagged)</option>
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-white/40 text-xs font-semibold uppercase tracking-wide">Status do listing</label>
                    <select
                        value={approved}
                        onChange={e => setApproved(e.target.value)}
                        className="bg-white/6 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    >
                        <option value="all">Todos</option>
                        <option value="true">Aprovados</option>
                        <option value="false">Pendentes</option>
                    </select>
                </div>

                <button
                    onClick={runScan}
                    disabled={loading}
                    className="px-5 py-2 rounded-xl text-sm font-bold bg-primary/15 border border-primary/25 text-primary hover:bg-primary/25 transition-all disabled:opacity-40"
                >
                    {loading ? "Escaneando..." : "▶ Executar Scan"}
                </button>
            </div>

            {/* Summary */}
            {results && (
                <>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white/2 border border-white/6 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-black text-white">{results.total}</p>
                            <p className="text-white/40 text-xs mt-1">Listings escaneados</p>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-black text-red-400">{results.redCount}</p>
                            <p className="text-red-400/60 text-xs mt-1">RED — bloqueados</p>
                        </div>
                        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 text-center">
                            <p className="text-3xl font-black text-yellow-400">{results.yellowCount}</p>
                            <p className="text-yellow-400/60 text-xs mt-1">YELLOW — flagged</p>
                        </div>
                    </div>

                    {results.results.length === 0 ? (
                        <div className="text-center py-12 text-white/25 text-sm bg-white/2 border border-white/6 rounded-2xl">
                            Nenhum listing com termos problemáticos. Tudo limpo ✅
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {results.results.map(item => (
                                <div
                                    key={item.id}
                                    className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                                        item.hasBlocked
                                            ? "bg-red-500/5 border-red-500/20"
                                            : "bg-yellow-500/5 border-yellow-500/20"
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {item.hasBlocked && (
                                                    <span className="text-[10px] font-black uppercase tracking-wide bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                                                        🔴 RED
                                                    </span>
                                                )}
                                                {item.hasFlagged && (
                                                    <span className="text-[10px] font-black uppercase tracking-wide bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                                        🟡 YELLOW
                                                    </span>
                                                )}
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                    item.isApproved
                                                        ? "bg-green-500/15 text-green-400"
                                                        : "bg-white/10 text-white/40"
                                                }`}>
                                                    {item.isApproved ? "Aprovado" : "Pendente"}
                                                </span>
                                                <span className="text-white font-semibold text-sm truncate">{item.title}</span>
                                            </div>
                                            <p className="text-white/35 text-xs mt-1">
                                                {item.city}, {item.state} — {item.provider?.name || item.provider?.email || "Provider"}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/admin/listings?search=${item.id}`}
                                            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-white/6 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                        >
                                            Ver listing →
                                        </Link>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5">
                                        {item.blocked.map(t => (
                                            <span key={t} className="text-[11px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-full font-medium">
                                                {t}
                                            </span>
                                        ))}
                                        {item.flagged.map(t => (
                                            <span key={t} className="text-[11px] bg-yellow-500/15 text-yellow-300 px-2 py-0.5 rounded-full font-medium">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
