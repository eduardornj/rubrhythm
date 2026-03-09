"use client";
import { useState, useEffect } from "react";

const STATUS = {
  active: { color: "text-blue-400 bg-blue-500/10 border-blue-500/20", label: "Ativo" },
  pending: { color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", label: "Pendente" },
  completed: { color: "text-green-400 bg-green-500/10 border-green-500/20", label: "Concluído" },
  disputed: { color: "text-red-400 bg-red-500/10 border-red-500/20", label: "Em Disputa" },
  cancelled: { color: "text-white/30 bg-white/5 border-white/10", label: "Cancelado" },
};

export default function EscrowPage() {
  const [escrows, setEscrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/financial?view=escrows")
      .then(r => r.json())
      .then(d => { setEscrows(Array.isArray(d?.data?.escrows) ? d.data.escrows : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const doAction = async (id, action) => {
    try {
      // Map frontend action names to new backend action names if needed
      // Frontend uses: complete, refund, activate, cancel
      // Backend expects: force_complete, force_refund, etc.
      let backendAction = action;
      if (action === "complete") backendAction = "resolve_dispute";
      if (action === "refund") backendAction = "force_refund";
      if (action === "activate") backendAction = "force_complete";
      if (action === "cancel") backendAction = "force_refund";

      const res = await fetch("/api/admin/financial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'escrow', escrowIds: [id], action: backendAction }),
      });
      if (res.ok) { showToast("Escrow atualizado."); }
      else showToast("Erro ao atualizar.", "error");
    } catch { showToast("Erro.", "error"); }
  };

  const filtered = filter === "all" ? escrows : escrows.filter(e => e.status === filter);

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">🤝 Gestão de Escrow</h1>
          <p className="text-white/40 text-sm mt-0.5">{escrows.length} transações</p>
        </div>
        <div className="flex gap-1 bg-white/3 p-1 rounded-xl">
          {["all", "disputed", "pending", "active", "completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? (f === "disputed" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white") : "text-white/40 hover:text-white/60"}`}>
              {f === "all" ? "Todos" : STATUS[f]?.label || f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/20">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">Nenhum escrow {filter === "all" ? "" : STATUS[filter]?.label?.toLowerCase()}.</div>
      ) : (
        <div className="bg-white/2 border border-white/6 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">ID</th>
                <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Valor</th>
                <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Status</th>
                <th className="text-left px-4 py-3 text-white/30 font-semibold text-xs">Criado</th>
                <th className="text-right px-4 py-3 text-white/30 font-semibold text-xs">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => {
                const s = STATUS[e.status] || STATUS.pending;
                return (
                  <tr key={e.id} className="border-b border-white/4 hover:bg-white/2 transition-all">
                    <td className="px-4 py-3 text-white/40 text-xs font-mono">{e.id?.slice(0, 8)}...</td>
                    <td className="px-4 py-3">
                      <span className="text-white font-bold">${e.amount || 0}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.color}`}>{s.label}</span>
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs">
                      {e.createdAt ? new Date(e.createdAt).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {e.status === "disputed" && (
                          <>
                            <button onClick={() => doAction(e.id, "complete")} className="text-[10px] px-2.5 py-1 rounded-lg border bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all">
                              ✅ Resolver
                            </button>
                            <button onClick={() => doAction(e.id, "refund")} className="text-[10px] px-2.5 py-1 rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                              ↩ Reembolsar
                            </button>
                          </>
                        )}
                        {e.status === "pending" && (
                          <button onClick={() => doAction(e.id, "activate")} className="text-[10px] px-2.5 py-1 rounded-lg border bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                            ▶ Ativar
                          </button>
                        )}
                        {["active", "pending"].includes(e.status) && (
                          <button onClick={() => doAction(e.id, "cancel")} className="text-[10px] px-2.5 py-1 rounded-lg border border-red-900/30 text-red-600 hover:bg-red-900/20 hover:text-red-400 transition-all">
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}