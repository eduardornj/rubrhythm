"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// -- Helpers -----------------------------------------------------------------

function formatCurrency(num) {
  if (num == null || isNaN(num)) return "$0";
  return `$${Number(num).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function RoleBadge({ role }) {
  const map = {
    provider: "border-primary/30 bg-primary/10 text-primary",
    user: "border-sky-400/30 bg-sky-400/10 text-sky-400",
    admin: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  };
  const labels = { provider: "Massagista", user: "Cliente", admin: "Admin" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${map[role] || map.user}`}>
      {labels[role] || "Cliente"}
    </span>
  );
}

function SkeletonKPI() {
  return (
    <div className="glass-card !p-4">
      <div className="h-3 w-20 rounded animate-pulse mb-3 bg-white/[0.06]" />
      <div className="h-7 w-16 rounded animate-pulse mb-1 bg-white/[0.08]" />
      <div className="h-3 w-24 rounded animate-pulse bg-white/[0.04]" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 border-b border-border/50 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 rounded bg-white/[0.06]" />
          <div className="h-3 w-60 rounded bg-white/[0.04]" />
        </div>
        <div className="h-6 w-16 rounded bg-white/[0.06]" />
      </div>
    </div>
  );
}

// -- Main Page ---------------------------------------------------------------

export default function CreditosPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Credit adjustment form
  const [creditUserId, setCreditUserId] = useState("");
  const [creditAmount, setCreditAmount] = useState("");
  const [creditReason, setCreditReason] = useState("");
  const [creditLoading, setCreditLoading] = useState(false);
  const [creditMessage, setCreditMessage] = useState(null);

  const abortRef = useRef(null);

  const fetchUsers = useCallback(async () => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users?limit=200", { signal: ctrl.signal });
      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const json = await res.json();

      if (json.success) {
        setUsers(json.data || []);
      } else {
        throw new Error(json.error?.message || "Erro ao carregar");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setError(err.message);
        console.error("[Creditos] fetch error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    return () => abortRef.current?.abort();
  }, [fetchUsers]);

  // -- Computed data -------------------------------------------------------

  const usersWithCredits = users
    .filter((u) => Number(u.credits || 0) > 0)
    .sort((a, b) => Number(b.credits || 0) - Number(a.credits || 0));

  const totalCredits = users.reduce((sum, u) => sum + Number(u.credits || 0), 0);
  const usersWithCreditsCount = usersWithCredits.length;
  const averageBalance = usersWithCreditsCount > 0 ? Math.round(totalCredits / usersWithCreditsCount) : 0;

  // -- Credit adjustment ---------------------------------------------------

  async function handleCreditSubmit(e) {
    e.preventDefault();
    if (!creditUserId.trim() || !creditAmount || !creditReason.trim()) return;

    setCreditLoading(true);
    setCreditMessage(null);

    try {
      const res = await fetch("/api/admin/financial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "adjust_credits",
          type: "adjust_credits",
          userId: creditUserId.trim(),
          amount: Number(creditAmount),
          reason: creditReason.trim(),
        }),
      });

      const json = await res.json();

      if (json.success) {
        setCreditMessage({ type: "success", text: "Creditos ajustados com sucesso!" });
        setCreditUserId("");
        setCreditAmount("");
        setCreditReason("");
        fetchUsers();
      } else {
        setCreditMessage({ type: "error", text: json.error || "Erro ao ajustar creditos" });
      }
    } catch (err) {
      console.error("[Credits] error:", err);
      setCreditMessage({ type: "error", text: "Erro de conexao" });
    } finally {
      setCreditLoading(false);
    }
  }

  // -- Render --------------------------------------------------------------

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in">
      {/* -- Header --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Creditos
          </h1>
          <p className="text-sm mt-1 text-text-muted">
            Saldo e gerenciamento de creditos dos usuarios
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto disabled:opacity-50"
          aria-label="Atualizar dados"
        >
          {loading ? "..." : "Atualizar"}
        </button>
      </div>

      {/* -- KPI Row -------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {loading ? (
          <>
            <SkeletonKPI />
            <SkeletonKPI />
            <SkeletonKPI />
          </>
        ) : (
          <>
            <div className="glass-card !p-4">
              <p className="text-xs font-medium text-text-muted mb-2">Total de Creditos</p>
              <p className="text-2xl font-bold tabular-nums text-green-400">
                {formatCurrency(totalCredits)}
              </p>
              <p className="text-xs text-text-muted mt-1">em circulacao no sistema</p>
            </div>
            <div className="glass-card !p-4">
              <p className="text-xs font-medium text-text-muted mb-2">Usuarios com Credito</p>
              <p className="text-2xl font-bold tabular-nums text-white">
                {usersWithCreditsCount}
              </p>
              <p className="text-xs text-text-muted mt-1">de {users.length} total</p>
            </div>
            <div className="glass-card !p-4">
              <p className="text-xs font-medium text-text-muted mb-2">Saldo Medio</p>
              <p className="text-2xl font-bold tabular-nums text-sky-400">
                {formatCurrency(averageBalance)}
              </p>
              <p className="text-xs text-text-muted mt-1">por usuario com saldo</p>
            </div>
          </>
        )}
      </div>

      {/* -- Error state ----------------------------------------------------- */}
      {error && (
        <div className="glass-card mb-6 border-red-500/20 bg-red-500/[0.04]">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* -- Users with credits table --------------------------------------- */}
      {!loading && usersWithCredits.length > 0 && (
        <>
          <h2 className="text-lg font-bold text-white mb-3">
            Usuarios com Saldo ({usersWithCreditsCount})
          </h2>

          {/* Desktop Table */}
          <div className="hidden sm:block glass-card !p-0 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Usuario</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Role</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-text-muted">Creditos</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">Acao</th>
                </tr>
              </thead>
              <tbody>
                {usersWithCredits.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-border/50 transition-colors hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                          {(user.name || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate text-white text-sm">
                            {user.name || "Sem nome"}
                          </div>
                          <div className="text-xs truncate text-text-muted">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-lg font-bold tabular-nums text-green-400">
                        {formatCurrency(user.credits)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <Link
                        href={`/admin/users/${user.id}`}
                        className="text-xs font-medium text-primary hover:text-white transition-colors"
                      >
                        Ver perfil
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden space-y-3 mb-6">
            {usersWithCredits.map((user) => (
              <Link
                key={user.id}
                href={`/admin/users/${user.id}`}
                className="glass-card p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                  {(user.name || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold truncate text-white">
                      {user.name || "Sem nome"}
                    </span>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="text-xs truncate text-text-muted">{user.email}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-bold tabular-nums text-green-400">
                    {formatCurrency(user.credits)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Empty: no users with credits */}
      {!loading && usersWithCredits.length === 0 && !error && (
        <div className="glass-card p-12 text-center mb-6">
          <p className="text-2xl mb-2">&#129689;</p>
          <p className="text-white font-bold">Nenhum usuario com creditos</p>
          <p className="text-sm text-text-muted mt-1">
            Use o formulario abaixo para adicionar creditos
          </p>
        </div>
      )}

      {/* -- Loading skeleton for table ------------------------------------- */}
      {loading && (
        <div className="glass-card !p-0 overflow-hidden mb-6">
          {Array.from({ length: 5 }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* -- Credit Adjustment Form ----------------------------------------- */}
      <div className="glass-card">
        <h2 className="text-base font-bold text-white mb-4">
          Ajustar Creditos
        </h2>
        <form onSubmit={handleCreditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 text-text-muted">
                User ID ou Email
              </label>
              <input
                type="text"
                value={creditUserId}
                onChange={(e) => setCreditUserId(e.target.value)}
                className="input-field w-full"
                placeholder="ID ou email do usuario"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 text-text-muted">
                Quantidade (positivo = add, negativo = deduct)
              </label>
              <input
                type="number"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="input-field w-full"
                placeholder="Ex: 50 ou -20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-text-muted">
              Motivo
            </label>
            <input
              type="text"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              className="input-field w-full"
              placeholder="Motivo do ajuste..."
            />
          </div>

          {/* Feedback message */}
          {creditMessage && (
            <div
              className={`rounded-lg px-3 py-2.5 text-xs font-medium border ${
                creditMessage.type === "success"
                  ? "border-green-500/25 bg-green-500/[0.08] text-green-400"
                  : "border-red-500/25 bg-red-500/[0.08] text-red-400"
              }`}
            >
              {creditMessage.text}
            </div>
          )}

          <button
            type="submit"
            disabled={creditLoading || !creditUserId.trim() || !creditAmount || !creditReason.trim()}
            className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creditLoading ? "Processando..." : "Ajustar Creditos"}
          </button>
        </form>
      </div>
    </div>
  );
}
