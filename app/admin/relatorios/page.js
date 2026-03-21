"use client";

import { useState, useCallback } from "react";

// ── Export Definitions ───────────────────────────────────────

const EXPORTS = [
  {
    id: "usuarios",
    emoji: "\u{1F465}",
    title: "Usuarios",
    description: "Exportar lista completa de usuarios",
    detail: "nome, email, role, verificado, banido, creditos, data cadastro",
    endpoint: "/api/admin/users?limit=9999",
    filename: "rubrhythm_usuarios",
    mapRow: (u) => ({
      nome: u.name || "",
      email: u.email || "",
      role: u.role || "",
      verificado: u.isVerified ? "Sim" : "Nao",
      banido: u.isBanned ? "Sim" : "Nao",
      creditos: u.credits ?? 0,
      data_cadastro: u.createdAt || "",
    }),
  },
  {
    id: "massagistas",
    emoji: "\u{1F486}",
    title: "Massagistas",
    description: "Exportar apenas massagistas",
    detail: "nome, email, verificado, creditos, data cadastro",
    endpoint: "/api/admin/users?role=provider&limit=9999",
    filename: "rubrhythm_massagistas",
    mapRow: (u) => ({
      nome: u.name || "",
      email: u.email || "",
      verificado: u.isVerified ? "Sim" : "Nao",
      banido: u.isBanned ? "Sim" : "Nao",
      creditos: u.credits ?? 0,
      data_cadastro: u.createdAt || "",
    }),
  },
  {
    id: "anuncios",
    emoji: "\u{1F4CB}",
    title: "Anuncios",
    description: "Exportar todos os anuncios",
    detail: "titulo, cidade, estado, provider, status, views, rating",
    endpoint: "/api/admin/listings?limit=9999",
    filename: "rubrhythm_anuncios",
    mapRow: (l) => ({
      titulo: l.title || "",
      cidade: l.city || "",
      estado: l.state || "",
      provider: l.user?.name || l.userName || "",
      aprovado: l.isApproved ? "Sim" : "Nao",
      ativo: l.isActive ? "Sim" : "Nao",
      views: l.views ?? 0,
      rating: l.averageRating ?? "",
      criado_em: l.createdAt || "",
    }),
  },
  {
    id: "verificacoes",
    emoji: "\u2705",
    title: "Verificacoes",
    description: "Exportar historico de verificacoes",
    detail: "usuario, tipo, status, data envio, data resposta",
    endpoint: "/api/admin/verifications?status=all&limit=9999",
    filename: "rubrhythm_verificacoes",
    mapRow: (v) => ({
      usuario: v.user?.name || v.userName || "",
      email: v.user?.email || v.userEmail || "",
      tipo: v.type || "",
      status: v.status || "",
      data_envio: v.createdAt || "",
      data_resposta: v.reviewedAt || "",
    }),
  },
  {
    id: "reviews",
    emoji: "\u2B50",
    title: "Reviews",
    description: "Exportar todas as avaliacoes",
    detail: "autor, massagista, nota, texto, status",
    endpoint: "/api/admin/reviews?status=all&limit=9999",
    filename: "rubrhythm_reviews",
    mapRow: (r) => ({
      autor: r.reviewer?.name || r.reviewerName || "",
      massagista: r.provider?.name || r.providerName || "",
      nota: r.rating ?? "",
      texto: r.comment || r.text || "",
      status: r.status || "",
      criado_em: r.createdAt || "",
    }),
  },
  {
    id: "financeiro",
    emoji: "\u{1F4B0}",
    title: "Financeiro",
    description: "Exportar escrows e transacoes",
    detail: "cliente, provider, valor, status, data",
    endpoint: "/api/admin/financial?view=escrows&limit=9999",
    filename: "rubrhythm_financeiro",
    mapRow: (e) => ({
      cliente: e.client?.name || e.clientName || "",
      provider: e.provider?.name || e.providerName || "",
      valor: e.amount ?? 0,
      status: e.status || "",
      criado_em: e.createdAt || "",
      atualizado_em: e.updatedAt || "",
    }),
  },
];

// ── CSV Helper ───────────────────────────────────────────────

function downloadCSV(data, filename) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? "").replace(/"/g, '""');
          return val.includes(",") || val.includes('"') || val.includes("\n")
            ? `"${val}"`
            : val;
        })
        .join(",")
    ),
  ];

  const csvString = csvRows.join("\n");
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csvString], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

// ── Main Component ───────────────────────────────────────────

export default function RelatoriosPage() {
  const [states, setStates] = useState({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const updateState = useCallback((id, patch) => {
    setStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }, []);

  const handleExport = useCallback(
    async (exportDef) => {
      const { id, endpoint, filename, mapRow } = exportDef;
      updateState(id, { loading: true, error: null, success: false });

      try {
        // Append date params if set
        const url = new URL(endpoint, window.location.origin);
        if (dateFrom) url.searchParams.set("from", dateFrom);
        if (dateTo) url.searchParams.set("to", dateTo);

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error(`Erro ${res.status}`);

        const json = await res.json();
        let items = json.data || json.users || json.listings || json.verifications || json.reviews || json.escrows || json.items || [];

        // Client-side date filtering (in case API doesn't support from/to)
        if (dateFrom || dateTo) {
          const fromTs = dateFrom ? new Date(dateFrom).getTime() : 0;
          const toTs = dateTo ? new Date(dateTo + "T23:59:59").getTime() : Infinity;

          items = items.filter((item) => {
            const dateField = item.createdAt || item.created_at || item.date;
            if (!dateField) return true;
            const ts = new Date(dateField).getTime();
            return ts >= fromTs && ts <= toTs;
          });
        }

        if (items.length === 0) {
          updateState(id, { loading: false, error: "Nenhum registro encontrado" });
          return;
        }

        const suffix = dateFrom || dateTo
          ? `_${dateFrom || "inicio"}_${dateTo || "fim"}`
          : "";
        const mapped = items.map(mapRow);
        downloadCSV(mapped, filename + suffix);
        updateState(id, { loading: false, success: true });

        setTimeout(() => updateState(id, { success: false }), 3000);
      } catch (err) {
        updateState(id, { loading: false, error: err.message || "Falha ao exportar" });
        setTimeout(() => updateState(id, { error: null }), 4000);
      }
    },
    [updateState, dateFrom, dateTo]
  );

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in">
      {/* ── Header ───────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Relatorios
        </h1>
        <p className="text-sm mt-1 text-text-muted">
          Exportar dados do sistema
        </p>
      </div>

      {/* ── Date Range Filter ──────────────────────────── */}
      <div className="glass-card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium mb-1.5 text-text-muted">
              De
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field w-full"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-medium mb-1.5 text-text-muted">
              Ate
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field w-full"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              className="btn-secondary text-sm whitespace-nowrap"
            >
              Limpar filtro
            </button>
          )}
        </div>
        {(dateFrom || dateTo) && (
          <p className="text-xs mt-3 text-text-muted">
            Exportando registros
            {dateFrom ? ` a partir de ${dateFrom}` : ""}
            {dateTo ? ` ate ${dateTo}` : ""}
          </p>
        )}
      </div>

      {/* ── Export Cards Grid ────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {EXPORTS.map((exp) => {
          const st = states[exp.id] || {};

          return (
            <div
              key={exp.id}
              className="glass-card flex flex-col transition-all duration-200 hover:-translate-y-0.5"
            >
              {/* Emoji + Title */}
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{exp.emoji}</span>
                <h2 className="text-base font-semibold text-white">
                  {exp.title}
                </h2>
              </div>

              {/* Description */}
              <p className="text-sm mb-1 text-text-muted">
                {exp.description}
              </p>

              {/* Fields included */}
              <p className="text-xs mb-4 flex-1 text-text-muted">
                {exp.detail}
              </p>

              {/* Button */}
              <button
                onClick={() => handleExport(exp)}
                disabled={st.loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {st.loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Gerando...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Exportar CSV
                  </>
                )}
              </button>

              {/* Feedback messages */}
              {st.success && (
                <p className="text-xs mt-2 text-center font-medium text-green-400">
                  Arquivo baixado!
                </p>
              )}
              {st.error && (
                <p className="text-xs mt-2 text-center font-medium text-red-400">
                  {st.error}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Footer Info ──────────────────────────────── */}
      <div className="mt-8 flex items-start gap-2">
        <svg
          className="w-4 h-4 mt-0.5 shrink-0 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-xs text-text-muted">
          Arquivos exportados em formato CSV, compativeis com Excel e Google
          Sheets.
        </p>
      </div>
    </div>
  );
}
