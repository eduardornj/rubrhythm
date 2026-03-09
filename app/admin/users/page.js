"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const ROLE_LABELS = { provider: "Massagista", user: "Cliente", admin: "Admin" };
const ROLE_COLORS = {
    provider: "text-pink-400 bg-pink-500/10 border-pink-500/20",
    user: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    admin: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
};

function Avatar({ name }) {
    return (
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #e8459a44, #9333ea44)", border: "1px solid rgba(255,255,255,0.1)" }}>
            {name?.charAt(0)?.toUpperCase() || "?"}
        </div>
    );
}

function Field({ label, children }) {
    return <div><p className="text-white/30 text-xs mb-1">{label}</p><div className="text-white text-sm">{children}</div></div>;
}

export default function UsuariosPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selected, setSelected] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);

    // Modals
    const [banModal, setBanModal] = useState(null); // user
    const [banMotivo, setBanMotivo] = useState("");
    const [creditModal, setCreditModal] = useState(null); // user
    const [creditAmount, setCreditAmount] = useState("");
    const [creditOp, setCreditOp] = useState("add");

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    };

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        setUsers(json.data || []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
        const matchRole = roleFilter === "all" || u.role === roleFilter;
        const matchStatus = statusFilter === "all"
            || (statusFilter === "banned" && u.isBanned)
            || (statusFilter === "verified" && u.verified)
            || (statusFilter === "active" && !u.isBanned);
        return matchSearch && matchRole && matchStatus;
    });

    const doAction = async (userId, action, extra = {}) => {
        setActionLoading(userId);
        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, action, ...extra }),
            });
            const json = await res.json();
            if (res.ok) {
                showToast(json.data?.message || "Ação realizada com sucesso!");
                await load();
                // update selected
                setSelected(prev => prev?.id === userId ? { ...prev, ...(action === "ban" ? { isBanned: extra.value } : action === "verify" ? { verified: extra.value } : {}) } : prev);
            } else { showToast(json.error?.message || "Erro.", "error"); }
        } catch { showToast("Erro de rede.", "error"); }
        setActionLoading(null);
    };

    const doCredits = async () => {
        if (!creditAmount || isNaN(creditAmount)) return;
        setActionLoading(creditModal.id);
        try {
            const res = await fetch("/api/admin/financial", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: 'adjust', type: 'adjust_credits', userId: creditModal.id, amount: creditOp === 'add' ? Number(creditAmount) : -Number(creditAmount) }),
            });
            const json = await res.json();
            if (res.ok) { showToast(json.data?.message || "Créditos ajustados"); setCreditModal(null); setCreditAmount(""); await load(); }
            else showToast(json.error?.message || "Erro ao ajustar créditos", "error");
        } catch { showToast("Erro.", "error"); }
        setActionLoading(null);
    };

    const doBan = async () => {
        await doAction(banModal.id, "ban", { value: !banModal.isBanned, reason: banMotivo });
        setBanModal(null); setBanMotivo("");
    };

    const doDelete = async (u) => {
        if (!confirm(`Deletar permanentemente "${u.name}"? Esta ação NÃO pode ser desfeita.`)) return;
        setActionLoading(u.id);
        const res = await fetch(`/api/admin/users?userId=${u.id}`, { method: "DELETE" });
        const json = await res.json();
        if (res.ok) { showToast(json.data?.message || "Usuário deletado."); setSelected(null); await load(); }
        else showToast(json.error?.message || "Erro ao deletar.", "error");
        setActionLoading(null);
    };

    return (
        <div className="space-y-4">
            {/* Toast */}
            {toast && (
                <div className={`fixed top-5 right-5 z-[999] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
                    {toast.msg}
                </div>
            )}

            {/* Ban Modal */}
            {banModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setBanModal(null)}>
                    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-1">{banModal.isBanned ? "Desbanir" : "Banir"} Usuário</h3>
                        <p className="text-white/40 text-sm mb-4">{banModal.name} — {banModal.email}</p>
                        {!banModal.isBanned && (
                            <textarea value={banMotivo} onChange={e => setBanMotivo(e.target.value)} placeholder="Motivo do banimento..." rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:border-red-500/40 mb-4" />
                        )}
                        <div className="flex gap-2">
                            <button onClick={() => setBanModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-all">Cancelar</button>
                            <button onClick={doBan} className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${banModal.isBanned ? "bg-green-500/20 border border-green-500/30 text-green-400 hover:bg-green-500/30" : "bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30"}`}>
                                {banModal.isBanned ? "✅ Desbanir" : "🚫 Banir"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Credits Modal */}
            {creditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setCreditModal(null)}>
                    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-1">Ajustar Créditos</h3>
                        <p className="text-white/40 text-sm mb-4">{creditModal.name} — Saldo atual: <strong className="text-white">{Math.round(creditModal.credits || 0)}</strong></p>
                        <div className="flex gap-2 mb-3">
                            {["add", "remove"].map(op => (
                                <button key={op} onClick={() => setCreditOp(op)}
                                    className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${creditOp === op ? (op === "add" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400") : "border-white/10 text-white/40 hover:bg-white/5"}`}>
                                    {op === "add" ? "+ Adicionar" : "- Remover"}
                                </button>
                            ))}
                        </div>
                        <input type="number" value={creditAmount} onChange={e => setCreditAmount(e.target.value)} placeholder="Quantidade de créditos"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50 mb-4" />
                        <div className="flex gap-2">
                            <button onClick={() => setCreditModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:bg-white/5 transition-all">Cancelar</button>
                            <button onClick={doCredits} className="flex-1 py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/30 transition-all">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-white">👥 Gestão de Usuários</h1>
                    <p className="text-white/40 text-sm mt-0.5">{users.length} usuários cadastrados</p>
                </div>
                <button onClick={load} className="text-xs border border-white/10 text-white/40 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">🔄 Atualizar</button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-2">
                <input id="admin-users-search" name="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar por nome ou email..."
                    className="flex-1 min-w-48 bg-white/4 border border-white/8 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20" />
                <select id="admin-users-role" name="role" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none">
                    <option value="all">Todos os perfis</option>
                    <option value="provider">Massagistas</option>
                    <option value="user">Clientes</option>
                    <option value="admin">Admins</option>
                </select>
                <select id="admin-users-status" name="status" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-white/4 border border-white/8 rounded-xl px-3 py-2 text-sm text-white/70 focus:outline-none">
                    <option value="all">Todos os status</option>
                    <option value="active">Ativos</option>
                    <option value="verified">Verificados</option>
                    <option value="banned">Banidos</option>
                </select>
            </div>

            {/* Table */}
            <div className="grid grid-cols-12 gap-4">
                <div className="col-span-7">
                    <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/6">
                                    <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Usuário</th>
                                    <th className="text-left px-3 py-3 text-white/30 font-semibold text-xs">Perfil</th>
                                    <th className="text-left px-3 py-3 text-white/30 font-semibold text-xs">Créditos</th>
                                    <th className="text-left px-3 py-3 text-white/30 font-semibold text-xs">Status</th>
                                    <th className="px-3 py-3" />
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-white/20">Carregando...</td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-white/20">Nenhum usuário encontrado.</td></tr>
                                ) : filtered.map(u => (
                                    <tr key={u.id} onClick={() => setSelected(u)}
                                        className={`border-b border-white/4 cursor-pointer transition-all hover:bg-white/3 ${selected?.id === u.id ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={u.name} />
                                                <div>
                                                    <p className="text-white font-medium text-xs truncate max-w-28">{u.name || "—"}</p>
                                                    <p className="text-white/30 text-[10px] truncate max-w-28">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role] || ROLE_COLORS.user}`}>
                                                {ROLE_LABELS[u.role] || u.role}
                                            </span>
                                        </td>
                                        <td className="px-3 py-3 text-white/60 text-xs font-mono">{Math.round(u.credits || 0)}</td>
                                        <td className="px-3 py-3">
                                            <div className="flex flex-col gap-1">
                                                {u.verified && <span className="text-[10px] text-green-400">✓ Verified</span>}
                                                {u.isBanned && <span className="text-[10px] text-red-400">🚫 Banido</span>}
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button onClick={e => { e.stopPropagation(); doAction(u.id, "verify", { value: !u.verified }); }} title={u.verified ? "Remover verificação" : "Verificar"}
                                                    className={`text-xs px-2 py-0.5 rounded-lg border transition-all ${u.verified ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-white/30 hover:border-green-500/20 hover:text-green-400"}`}>
                                                    ✓
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); setBanModal(u); }}
                                                    className={`text-xs px-2 py-0.5 rounded-lg border transition-all ${u.isBanned ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-white/5 border-white/10 text-white/30 hover:border-red-500/20 hover:text-red-400"}`}>
                                                    {u.isBanned ? "🔓" : "🚫"}
                                                </button>
                                                <button onClick={e => { e.stopPropagation(); setCreditModal(u); setCreditAmount(""); }}
                                                    className="text-xs px-2 py-0.5 rounded-lg border bg-white/5 border-white/10 text-white/30 hover:border-yellow-500/20 hover:text-yellow-400 transition-all">
                                                    💰
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Detail panel */}
                <div className="col-span-5">
                    {!selected ? (
                        <div className="flex items-center justify-center h-48 bg-white/2 border border-white/6 rounded-2xl text-white/20 text-sm">
                            Selecione um usuário
                        </div>
                    ) : (
                        <div className="bg-white/2 border border-white/6 rounded-2xl p-5 space-y-4 sticky top-20">
                            {/* User header */}
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg"
                                    style={{ background: "linear-gradient(135deg, #e8459a66, #9333ea66)" }}>
                                    {selected.name?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                    <p className="text-white font-bold">{selected.name || "Sem nome"}</p>
                                    <p className="text-white/40 text-xs">{selected.email}</p>
                                </div>
                                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[selected.role] || ROLE_COLORS.user}`}>
                                    {ROLE_LABELS[selected.role] || selected.role}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Créditos"><span className="font-mono font-bold text-yellow-400">{Math.round(selected.credits || 0)}</span></Field>
                                <Field label="Cadastro">{selected.createdAt ? new Date(selected.createdAt).toLocaleDateString("pt-BR") : "—"}</Field>
                                <Field label="Verificado">{selected.verified ? <span className="text-green-400">✅ Sim</span> : <span className="text-white/30">Não</span>}</Field>
                                <Field label="Banido">{selected.isBanned ? <span className="text-red-400">🚫 Sim</span> : <span className="text-white/30">Não</span>}</Field>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <button onClick={() => doAction(selected.id, "verify", { value: !selected.verified })} disabled={actionLoading === selected.id}
                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${selected.verified ? "bg-white/5 border-white/10 text-white/40 hover:bg-red-500/10 hover:border-red-500/20 hover:text-red-400" : "bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25"}`}>
                                    {selected.verified ? "Remover Verificação" : "✅ Verificar"}
                                </button>
                                <button onClick={() => setBanModal(selected)}
                                    className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${selected.isBanned ? "bg-green-500/15 border-green-500/30 text-green-400 hover:bg-green-500/25" : "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"}`}>
                                    {selected.isBanned ? "🔓 Desbanir" : "🚫 Banir"}
                                </button>
                                <button onClick={() => { setCreditModal(selected); setCreditAmount(""); }}
                                    className="py-2.5 rounded-xl text-xs font-bold border bg-yellow-500/10 border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 transition-all">
                                    💰 Ajustar Créditos
                                </button>
                                <Link href={`/admin/listings?userId=${selected.id}`}
                                    className="py-2.5 rounded-xl text-xs font-bold border bg-white/5 border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all text-center">
                                    📋 Ver Anúncios
                                </Link>
                            </div>

                            {selected.role !== "admin" && (
                                <button onClick={() => doDelete(selected)} disabled={actionLoading === selected.id}
                                    className="w-full py-2.5 rounded-xl text-xs font-bold border border-red-900/40 bg-red-900/10 text-red-600 hover:bg-red-900/20 hover:text-red-400 transition-all">
                                    🗑 Deletar Conta Permanentemente
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
