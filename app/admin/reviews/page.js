"use client";
import { useState, useEffect, useCallback } from "react";

const STARS = (n) => "★".repeat(n) + "☆".repeat(5 - n);

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [toast, setToast] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/reviews?status=all");
    const data = await res.json();
    const list = data?.data?.reviews || data?.reviews || (Array.isArray(data) ? data : []);
    setReviews(Array.isArray(list) ? list : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const doAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      // action could be "approve", "show", "hide"
      let status = "approved";
      if (action === "hide") status = "rejected";
      if (action === "show") status = "approved";

      const res = await fetch("/api/admin/reviews", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id, status }),
      });
      if (res.ok) { showToast("Review atualizado."); load(); }
      else showToast("Erro ao atualizar.", "error");
    } catch { showToast("Erro de rede.", "error"); }
    setActionLoading(null);
  };

  const doDelete = async (id) => {
    if (!confirm("Deletar review permanentemente?")) return;
    setActionLoading(id + "delete");
    try {
      const res = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
      if (res.ok) { showToast("Review deletado."); load(); }
      else showToast("Erro ao deletar.", "error");
    } catch { showToast("Erro de rede.", "error"); }
    setActionLoading(null);
  };

  const filtered = filter === "all" ? reviews : reviews.filter(r => {
    if (filter === "hidden") return r.status === "rejected";
    return r.status === filter;
  });

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed top-5 right-5 z-[999] px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl border ${toast.type === "success" ? "bg-green-500/20 border-green-500/30 text-green-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">⭐ Moderação de Reviews</h1>
          <p className="text-white/40 text-sm mt-0.5">{reviews.length} reviews no total</p>
        </div>
        <div className="flex gap-1 bg-white/3 p-1 rounded-xl">
          {["all", "pending", "approved", "hidden"].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === f ? "bg-white/10 text-white" : "text-white/40 hover:text-white/60"}`}>
              {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : f === "approved" ? "Aprovados" : "Ocultos"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-white/20">Carregando...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-white/30">Nenhuma review {filter === "all" ? "" : filter}.</div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(r => (
            <div key={r.id} className="bg-white/2 border border-white/6 rounded-2xl p-4 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-yellow-400 text-sm">{STARS(r.rating || 0)}</span>
                  <span className="text-white/30 text-xs">{r.rating}/5</span>
                  {r.status && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ml-1 ${r.status === "approved" ? "text-green-400 bg-green-500/10 border-green-500/20" : r.status === "pending" ? "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                      {r.status === "approved" ? "Aprovado" : r.status === "pending" ? "Pendente" : "Rejeitado"}
                    </span>
                  )}
                </div>
                <p className="text-white/80 text-sm mb-2">{r.comment || r.text || r.content || "(sem texto)"}</p>
                <div className="flex items-center gap-3 text-xs text-white/30">
                  <span>By: {r.user_review_reviewerIdTouser?.name || r.author?.name || r.reviewerName || "Anonymous"}</span>
                  {r.listing?.title && <span>Listing: {r.listing.title}</span>}
                  {r.createdAt && <span>📅 {new Date(r.createdAt).toLocaleDateString("pt-BR")}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {r.status !== "approved" && (
                  <button onClick={() => doAction(r.id, "approve")} className="text-[10px] px-3 py-1.5 rounded-lg border bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20 transition-all font-semibold">
                    ✅ Aprovar
                  </button>
                )}
                <button onClick={() => doAction(r.id, r.status === "rejected" ? "show" : "hide")} className="text-[10px] px-3 py-1.5 rounded-lg border bg-white/5 border-white/10 text-white/40 hover:bg-white/10 transition-all font-semibold">
                  {r.status === "rejected" ? "Mostrar" : "Ocultar"}
                </button>
                <button onClick={() => doDelete(r.id)} className="text-[10px] px-3 py-1.5 rounded-lg border border-red-900/30 text-red-600 hover:bg-red-900/20 hover:text-red-400 transition-all font-semibold">
                  🗑 Deletar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}