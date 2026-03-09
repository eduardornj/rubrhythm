"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

import Image from "next/image";
import { HiOutlineCheckBadge } from "react-icons/hi2";

const STATUS_COLORS = {
    pending: { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", label: "Pendente" },
    approved: { bg: "bg-green-500/10", border: "border-green-500/20", text: "text-green-400", label: "Aprovado" },
    rejected: { bg: "bg-red-500/10", border: "border-red-500/20", text: "text-red-400", label: "Rejeitado" },
};

function Badge({ status }) {
    const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${c.bg} ${c.border} ${c.text}`}>
            {c.label}
        </span>
    );
}

function DocViewer({ url, label }) {
    const [err, setErr] = useState(false);
    if (!url) return <div className="flex items-center justify-center h-full bg-white/5 rounded-xl text-white/40 text-sm font-semibold">Sem {label}</div>;

    return err ? (
        <div className="flex items-center justify-center h-full bg-red-500/10 rounded-xl text-red-400 text-sm border border-red-500/20 p-4 text-center">
            <div>
                <p className="text-3xl mb-2">📄</p>
                <p className="font-bold">Erro ao carregar</p>
                <p className="text-[10px] mt-1 opacity-70 break-all">{url}</p>
            </div>
        </div>
    ) : (
        <div className="relative w-full h-full">
            <Image src={url} alt={label} fill unoptimized className="object-cover" onError={() => setErr(true)} />
        </div>
    );
}

export default function VerificacaoPage() {
    const [verifications, setVerifications] = useState([]);
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("pending");
    const [selected, setSelected] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [motivo, setMotivo] = useState("");
    const [showMotivo, setShowMotivo] = useState(false);
    const [pendingAction, setPendingAction] = useState(null);
    const [toast, setToast] = useState(null);

    const showToast = useCallback((msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            // Updated to hit the singular/plural normalized route
            const res = await fetch(`/api/admin/verifications?status=${filter}`);
            const json = await res.json();

            if (!res.ok || !json.success) {
                showToast(json.error?.message || "Erro crasso ao buscar dados.", "error");
                setVerifications([]);
                return;
            }

            // Using the new MCP data wrapper
            const payload = json.data;
            setVerifications(payload.verifications || []);
            setStats(payload.stats || {});

            if (payload.verifications?.length && filter === "pending") {
                setSelected(payload.verifications[0] || null);
            }
        } catch {
            showToast("Problema de rede. Tente recarregar a página.", "error");
        } finally {
            setLoading(false);
        }
    }, [filter, showToast]);

    useEffect(() => { load(); }, [load]);

    // Data is pre-filtered by the API now, but we keep this for visual consistency if needed
    const filtered = verifications;

    const doAction = async (id, action, reason = "") => {
        setActionLoading(id);
        try {
            const res = await fetch("/api/admin/verifications", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ verificationId: id, action, rejectionReason: reason }),
            });
            const json = await res.json();

            if (res.ok && json.success) {
                showToast(json.data?.message || "Operação realizada com sucesso!", "success");
                await load();
                setMotivo("");
                setShowMotivo(false);
                setPendingAction(null);
            } else {
                showToast(json.error?.message || "Erro do servidor ao processar.", "error");
            }
        } catch {
            showToast("Falha técnica ao executar a ação.", "error");
        }
        setActionLoading(null);
    };

    const handleApprove = (v) => doAction(v.id, "approve");
    const handleRejectInit = (v) => { setPendingAction(v); setShowMotivo(true); };
    const handleRejectConfirm = () => { if (pendingAction) doAction(pendingAction.id, "reject", motivo); };

    return (
        <div className="space-y-5">
            {/* Minimalist Glass Toast Notification */}
            {toast && (
                <div className={`fixed bottom-10 right-10 z-[100] px-6 py-4 rounded-2xl text-sm font-bold shadow-[0_10px_40px_rgba(0,0,0,0.5)] border backdrop-blur-xl animate-bounce-short
                    ${toast.type === "success"
                        ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                        : "bg-red-500/20 border-red-500/30 text-red-400"
                    }`}>
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{toast.type === "success" ? "✨" : "⚠️"}</span>
                        {toast.msg}
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showMotivo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setShowMotivo(false)}>
                    <div className="bg-[#0a0a0f] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center text-2xl mb-4 border border-red-500/20">
                                🛡️
                            </div>
                            <h3 className="text-xl text-white font-black mb-1">Rejeitar Verificação</h3>
                            <p className="text-white/40 text-sm leading-relaxed">O usuário será notificado imediatamente. Por favor, seja claro sobre o que ele deve corrigir.</p>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                            {["Documento ilegível", "Foto muito escura ou cortada", "Selfie não corresponde ao ID", "Documento expirado", "Falta a frente/verso do doc"].map((r) => (
                                <button key={r} onClick={() => setMotivo(prev => prev ? prev + " | " + r : r)} className="text-[10px] items-center px-2 py-1 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-white/50 transition-all font-semibold">
                                    + {r}
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={motivo}
                            onChange={e => setMotivo(e.target.value)}
                            placeholder="Motivo detalhado para o usuário (ou clique nas opções acima)..."
                            rows={4}
                            className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/40 mb-6 transition-all"
                        />
                        <div className="flex gap-3">
                            <button onClick={() => setShowMotivo(false)} className="flex-1 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-semibold text-sm hover:bg-white/10 hover:text-white transition-all">Cancelar</button>
                            <button onClick={handleRejectConfirm} className="flex-1 py-3.5 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-500 font-bold text-sm hover:bg-red-500/25 transition-all shadow-[0_0_15px_rgba(239,68,68,0.15)]">Confirmar Rejeição</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <span className="p-2 bg-primary/20 text-primary rounded-xl border border-primary/30">✅</span>
                        Centro de Auditoria
                    </h1>
                    <p className="text-white/40 text-sm mt-2">Valide a identidade das massagistas para manter a plataforma segura.</p>
                </div>
                <button onClick={load} className="btn-secondary px-4 py-2 rounded-xl text-sm whitespace-nowrap">
                    🔄 Sincronizar Fila
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Pendentes (Fila)", value: stats.pending, color: "text-amber-400", bg: "from-amber-500/10 to-transparent", border: "border-amber-500/20" },
                    { label: "Aprovações (All-time)", value: stats.approved, color: "text-emerald-400", bg: "from-emerald-500/10 to-transparent", border: "border-emerald-500/20" },
                    { label: "Rejeições (All-time)", value: stats.rejected, color: "text-rose-400", bg: "from-rose-500/10 to-transparent", border: "border-rose-500/20" },
                    { label: "Total Registrado", value: stats.total, color: "text-white", bg: "from-white/5 to-transparent", border: "border-white/10" },
                ].map((s, idx) => (
                    <div key={idx} className={`bg-gradient-to-b ${s.bg} border ${s.border} rounded-2xl p-5 backdrop-blur-sm relative overflow-hidden group`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-current opacity-5 blur-2xl rounded-full translate-x-12 -translate-y-8 ${s.color}`} />
                        <p className={`text-4xl font-black ${s.color} relative z-10`}>{s.value ?? 0}</p>
                        <p className="text-white/50 text-sm mt-2 font-medium relative z-10">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Container for Split Layout */}
            <div className="glass-card overflow-hidden shadow-2xl">
                {/* Filter tabs */}
                <div className="flex px-4 pt-4 pb-0 border-b border-white/5 overflow-x-auto no-scrollbar">
                    {["pending", "approved", "rejected"].map(f => (
                        <button key={f} onClick={() => { setFilter(f); setSelected(null); }}
                            className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap
                            ${filter === f ? "text-primary" : "text-white/40 hover:text-white/80"}`}>
                            {STATUS_COLORS[f].label.toUpperCase()}
                            {f === "pending" && stats.pending > 0 &&
                                <span className="ml-2 bg-amber-500/20 text-amber-500 border border-amber-500/30 text-[10px] font-black px-2 py-0.5 rounded-full inline-block -translate-y-0.5">
                                    {stats.pending}
                                </span>
                            }
                            {filter === f && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 min-h-[600px] divide-y md:divide-y-0 md:divide-x divide-white/5 relative">
                    {/* List Section (Left) */}
                    <div className="col-span-1 md:col-span-4 bg-black/20 p-4 overflow-y-auto absolute md:relative inset-x-0 top-0 bottom-0 md:h-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 opacity-50">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                                <span className="text-sm font-semibold text-primary">Sincronizando...</span>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                                <span className="text-5xl opacity-40 mb-4">✨</span>
                                <h3 className="text-white font-bold mb-1">Caixa Limpa!</h3>
                                <p className="text-white/40 text-sm">Nenhuma verificação {STATUS_COLORS[filter].label.toLowerCase()} no momento.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {filtered.map(v => (
                                    <button key={v.id} onClick={() => setSelected(v)}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all relative overflow-hidden group
                                        ${selected?.id === v.id
                                                ? "border-primary/50 bg-primary/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                                                : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/5"}`}>

                                        {/* Status Glow Indicator */}
                                        <div className={`absolute top-0 bottom-0 left-0 w-1 ${STATUS_COLORS[v.status].bg} bg-current opacity-50 ${STATUS_COLORS[v.status].text}`} />

                                        <div className="flex items-start gap-4 mb-3 pl-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-inner">
                                                {v.userName?.charAt(0) || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className="text-white text-sm font-bold truncate group-hover:text-primary transition-colors">{v.userName || "Sem nome"}</p>
                                                <p className="text-white/40 text-xs truncate mt-0.5">{v.userEmail}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between pl-2">
                                            <Badge status={v.status} />
                                            <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">
                                                {v.submittedAt ? new Date(v.submittedAt).toLocaleDateString("pt-BR") : "S/D"}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Viewer Section (Right) */}
                    <div className="col-span-1 md:col-span-8 p-6 md:p-8 bg-[#08080c] relative">
                        {loading && !selected ? (
                            <div className="absolute inset-0 z-10 bg-[#08080c]/80 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            </div>
                        ) : null}

                        {!selected ? (
                            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center border-2 border-dashed border-white/5 rounded-3xl">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-2xl mb-4 text-white/20">
                                    <HiOutlineCheckBadge className="w-8 h-8" />
                                </div>
                                <h3 className="text-white/60 font-bold mb-1">Selecione um Arquivo</h3>
                                <p className="text-white/30 text-sm max-w-xs">Clique em um item na lista ao lado para abrir e julgar os documentos de verificação.</p>
                            </div>
                        ) : (
                            <div className="animate-fade-in max-w-4xl mx-auto">
                                {/* User header expanded */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8 bg-white/5 border border-white/10 p-6 rounded-3xl">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/80 to-accent/80 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] border-2 border-white/10">
                                            {selected.userName?.charAt(0) || "?"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h2 className="text-xl text-white font-black">{selected.userName || "Sem nome"}</h2>
                                                {selected.status === 'approved' && <span className="text-emerald-500 text-lg" title="Verificado">🛡️</span>}
                                            </div>
                                            <p className="text-white/50 text-sm">{selected.userEmail}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-2">
                                        <Badge status={selected.status} />
                                        <Link href={`/admin/users?search=${selected.userEmail}`} className="text-xs text-primary font-bold hover:underline opacity-80 decoration-primary/50 underline-offset-4">
                                            Abrir Ficha do Usuário ↗
                                        </Link>
                                    </div>
                                </div>

                                {/* Active Controls / Action Panel */}
                                {selected.status === "pending" && (
                                    <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-primary/5 border border-primary/20 p-4 rounded-3xl">
                                        <div className="flex-1">
                                            <p className="text-xs text-primary uppercase tracking-widest font-black mb-1">Ação Requerida</p>
                                            <p className="text-white/60 text-sm">Revise as imagens abaixo confirmando clareza e veracidade antes de aprovar.</p>
                                        </div>
                                        <div className="flex sm:w-auto w-full flex-shrink-0 gap-3">
                                            <button
                                                onClick={() => handleRejectInit(selected)}
                                                disabled={actionLoading === selected.id}
                                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 font-bold text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
                                            >
                                                Refusar
                                            </button>
                                            <button
                                                onClick={() => handleApprove(selected)}
                                                disabled={actionLoading === selected.id}
                                                className="flex-1 sm:flex-none px-8 py-2.5 rounded-xl bg-green-500/20 border border-green-500/40 text-green-400 font-black text-sm hover:bg-green-500/30 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(34,197,94,0.15)]"
                                            >
                                                {actionLoading === selected.id ? "⌛" : "Aprovar Identidade"}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Rejected Banner/Reason */}
                                {selected.notes && selected.status === "rejected" && (
                                    <div className="bg-red-500/10 border-l-4 border-l-red-500 border-r border-t border-b border-red-500/20 rounded-r-2xl p-5 mb-8">
                                        <div className="flex items-start gap-3">
                                            <span className="text-red-500 mt-0.5">⚠️</span>
                                            <div>
                                                <p className="text-red-400 text-xs font-black uppercase tracking-wider mb-1">Rejeitado Pelo Admin</p>
                                                <p className="text-white/80 text-sm leading-relaxed">{selected.notes}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Documents Evidence View */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {selected.documents?.map((doc, idx) => (
                                        <div key={idx} className="flex flex-col h-full">
                                            <div className="flex items-center justify-between mb-3 px-1">
                                                <p className="text-white font-bold text-sm flex items-center gap-2">
                                                    {doc.type === 'id' ? '🪪' : '🤳'} {doc.name}
                                                </p>
                                                <a href={doc.path} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/40 hover:text-white uppercase font-bold tracking-wider">
                                                    Abrir Original ↗
                                                </a>
                                            </div>
                                            <div className="flex-1 w-full bg-[#050508] border border-white/10 rounded-3xl overflow-hidden group relative transition-all hover:border-white/20 hover:shadow-2xl">
                                                <div className="aspect-[4/3] w-full">
                                                    <DocViewer url={doc.path} label={doc.name} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {(!selected.documents || selected.documents.length === 0) && (
                                        <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-16 bg-red-500/5 border border-red-500/20 rounded-3xl text-center">
                                            <span className="text-4xl mb-3">👻</span>
                                            <p className="text-red-400 font-bold">Arquivos Corrompidos ou Inexistentes</p>
                                            <p className="text-white/40 text-sm mt-1 max-w-sm">Os ponteiros de arquivo desta solicitação estão quebrados. Peça ao usuário para reenviar as imagens.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Immutable audit log info */}
                                <div className="bg-black/40 rounded-2xl p-4 flex flex-wrap gap-y-2 items-center justify-between text-xs text-white/30 border border-white/5 font-mono">
                                    <span>ID: {selected.id}</span>
                                    <span>Submetido: {selected.submittedAt ? new Date(selected.submittedAt).toLocaleString("pt-BR") : "N/A"}</span>
                                    {selected.reviewedAt && <span className="text-primary/70">Ultima auditoria: {new Date(selected.reviewedAt).toLocaleString("pt-BR")}</span>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
