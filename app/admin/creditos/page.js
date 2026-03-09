"use client";
import { useState, useEffect, useCallback } from "react";

const TYPE_LABELS = {
    admin_credit_addition: { label: "+ Adição Manual", color: "text-green-400" },
    admin_credit_removal: { label: "- Remoção Manual", color: "text-red-400" },
    purchase: { label: "🛒 Compra", color: "text-blue-400" },
    message_sent: { label: "💬 Mensagem", color: "text-yellow-400" },
    default: { label: "Transação", color: "text-white/50" },
};

export default function CreditosPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [addModal, setAddModal] = useState(null);
    const [amount, setAmount] = useState("");
    const [op, setOp] = useState("add");
    const [toast, setToast] = useState(null);
    const [saving, setSaving] = useState(false);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const load = useCallback(async () => {
        setLoading(true);
        const res = await fetch("/api/admin/users");
        const d = await res.json();
        setUsers(d.data || []);
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    const doCredits = async () => {
        if (!amount || isNaN(amount) || !addModal) return;
        setSaving(true);
        const res = await fetch("/api/admin/financial", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type: 'adjust_credits',
                userId: addModal.id,
                amount: op === 'remove' ? -Number(amount) : Number(amount)
            }),
        });
        const d = await res.json();
        if (res.ok) { showToast(d.data?.message || "Sucesso!"); setAddModal(null); setAmount(""); await load(); }
        else showToast(d.error?.message || d.error || "Erro", "error");
        setSaving(false);
    };

    const nonAdminUsers = users.filter(u => u.role !== 'admin');
    const total = nonAdminUsers.reduce((s, u) => s + (u.credits || 0), 0);
    const filtered = nonAdminUsers.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4">
            {toast && (
                <div className={`fixed top-5 right-5 z-[999] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
                    {toast.msg}
                </div>
            )}

            {addModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setAddModal(null)}>
                    <div className="bg-[#0d0d15] border border-white/10 rounded-2xl p-6 w-full max-w-sm" onClick={e => e.stopPropagation()}>
                        <h3 className="text-white font-bold mb-1">Ajustar Créditos</h3>
                        <p className="text-white/40 text-sm mb-4">{addModal.name} — Saldo: <strong className="text-yellow-400">{Math.round(addModal.credits || 0)}</strong></p>
                        <div className="flex gap-2 mb-3">
                            {["add", "remove"].map(o => (
                                <button key={o} onClick={() => setOp(o)} className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-all ${op === o ? (o === "add" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400") : "border-white/10 text-white/40 hover:bg-white/5"}`}>
                                    {o === "add" ? "+ Adicionar" : "- Remover"}
                                </button>
                            ))}
                        </div>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Quantidade"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm placeholder-white/20 focus:outline-none focus:border-primary/50 mb-4" />
                        <div className="flex gap-2">
                            <button onClick={() => setAddModal(null)} className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm">Cancelar</button>
                            <button onClick={doCredits} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-primary/20 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/30 transition-all">
                                {saving ? "..." : "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-black text-white">🪙 Créditos</h1>
                    <p className="text-white/40 text-sm mt-0.5">Total no sistema: <span className="text-yellow-400 font-bold">{Math.round(total)}</span> créditos</p>
                </div>
                <button onClick={load} className="text-xs border border-white/10 text-white/40 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all">🔄</button>
            </div>

            <input id="admin-credits-search" name="search" value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Buscar usuário..."
                className="w-full max-w-sm bg-white/4 border border-white/8 rounded-xl px-3.5 py-2 text-sm text-white placeholder-white/25 focus:outline-none" />

            <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-white/6">
                            <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Usuário</th>
                            <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Perfil</th>
                            <th className="text-right px-4 py-3 text-white/30 font-semibold text-xs">Créditos</th>
                            <th className="text-right px-4 py-3 text-white/30 font-semibold text-xs">Cadastro</th>
                            <th className="text-right px-4 py-3 text-white/30 font-semibold text-xs">Ação</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={5} className="text-center py-10 text-white/20">Carregando...</td></tr>
                        ) : filtered.map(u => (
                            <tr key={u.id} className="border-b border-white/4 hover:bg-white/2 transition-all">
                                <td className="px-4 py-3">
                                    <p className="text-white text-xs font-medium">{u.name || "—"}</p>
                                    <p className="text-white/30 text-[10px]">{u.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "provider" ? "text-pink-400 bg-pink-500/10" : "text-blue-400 bg-blue-500/10"}`}>
                                        {u.role === "provider" ? "Massagista" : u.role === "admin" ? "Admin" : "Cliente"}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className="text-yellow-400 font-black font-mono">{Math.round(u.credits || 0)}</span>
                                </td>
                                <td className="px-4 py-3 text-right text-white/30 text-xs">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "—"}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <button onClick={() => { setAddModal(u); setAmount(""); setOp("add"); }}
                                        className="text-xs px-2.5 py-1 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 transition-all">
                                        Ajustar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
