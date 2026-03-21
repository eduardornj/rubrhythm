"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Constants ────────────────────────────────────────────────

const SEVERITY_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "red", label: "Red Only" },
  { key: "yellow", label: "Yellow Only" },
];

const APPROVED_FILTERS = [
  { key: "all", label: "Todos" },
  { key: "true", label: "Aprovados" },
  { key: "false", label: "Pendentes" },
];

// ── Helpers ──────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(dateStr) {
  if (!dateStr) return "--";
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "agora";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}min atras`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atras`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d atras`;
  return formatDate(dateStr);
}

// ── Micro-components ─────────────────────────────────────────

function StatCard({ label, value, colorKey }) {
  const colorMap = {
    rose: "border-primary/25 bg-primary/[0.08] text-primary",
    red: "border-red-500/25 bg-red-500/[0.08] text-red-400",
    yellow: "border-yellow-500/25 bg-yellow-500/[0.08] text-yellow-400",
    amber: "border-amber-500/25 bg-amber-500/[0.08] text-amber-400",
    gray: "border-border bg-white/[0.03] text-text-muted",
  };
  const cls = colorMap[colorKey] || colorMap.gray;

  return (
    <div className={`rounded-lg p-4 transition-all duration-200 border ${cls}`}>
      <div className="text-xs mb-1 truncate text-text-muted">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function FilterChips({ items, active, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
              isActive
                ? "border-primary/40 bg-primary/10 text-primary"
                : "border-border text-text-muted hover:border-primary/20 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function ApprovalBadge({ isApproved }) {
  if (isApproved) {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border border-green-500/30 bg-green-500/10 text-green-400">
        Aprovado
      </span>
    );
  }
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap border border-yellow-500/30 bg-yellow-500/10 text-yellow-400">
      Pendente
    </span>
  );
}

function TermChip({ term, variant }) {
  const isRed = variant === "red";
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap border ${
        isRed
          ? "border-red-500/35 bg-red-500/15 text-red-400"
          : "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
      }`}
    >
      {term}
    </span>
  );
}

function ScanResultCard({ item }) {
  const isRed = item.hasBlocked;

  return (
    <div
      className={`glass-card overflow-hidden transition-all duration-200 hover:-translate-y-0.5 ${
        isRed ? "!border-l-[3px] !border-l-red-500 shadow-[0_0_24px_rgba(239,68,68,0.12)]" : "!border-l-[3px] !border-l-yellow-400"
      }`}
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Top row: title + status */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold truncate text-white">
                {item.title}
              </h3>
              <ApprovalBadge isApproved={item.isApproved} />
            </div>
            <p className="text-xs mt-1 text-text-muted">
              {item.city}, {item.state}
            </p>
          </div>
          <span className="text-xs shrink-0 text-text-muted">
            {timeAgo(item.createdAt)}
          </span>
        </div>

        {/* Provider info */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
            {(item.provider?.name || "?")[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <span className="text-xs font-medium text-text-muted">
              {item.provider?.name || "Desconhecido"}
            </span>
            <span className="text-xs ml-2 text-text-muted">
              {item.provider?.email || ""}
            </span>
          </div>
        </div>

        {/* Blocked terms */}
        {item.blocked?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wider mb-1.5 text-red-400">
              Blocked terms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.blocked.map((term) => (
                <TermChip key={term} term={term} variant="red" />
              ))}
            </div>
          </div>
        )}

        {/* Flagged terms */}
        {item.flagged?.length > 0 && (
          <div>
            <p className="text-[10px] uppercase font-semibold tracking-wider mb-1.5 text-yellow-400">
              Flagged terms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {item.flagged.map((term) => (
                <TermChip key={term} term={term} variant="yellow" />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-1 border-t border-border/50">
          <Link
            href="/admin/listings"
            className="text-xs font-medium transition-colors duration-150 hover:underline text-primary"
          >
            Ver anuncio
          </Link>
          {item.provider?.id && (
            <Link
              href={`/admin/users/${item.provider.id}`}
              className="text-xs font-medium transition-colors duration-150 hover:underline text-sky-400"
            >
              Ver provider
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-10 h-10 rounded-full border-2 border-primary/30 border-t-transparent animate-spin mb-4" />
      <p className="text-sm font-medium text-text-muted">
        Scanning...
      </p>
      <p className="text-xs mt-1 text-text-muted">
        Isso pode levar alguns segundos
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <span className="text-4xl mb-3">&#x2705;</span>
      <p className="text-sm font-medium text-text-muted">
        Nenhum conteudo flagged
      </p>
      <p className="text-xs mt-1 text-text-muted">
        Todos os anuncios estao limpos
      </p>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function ContentScanPage() {
  const [severity, setSeverity] = useState("all");
  const [approved, setApproved] = useState("all");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (severity !== "all") params.set("severity", severity);
      if (approved !== "all") params.set("approved", approved);
      const qs = params.toString();
      const url = `/api/admin/content-scan${qs ? `?${qs}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("[ContentScan]", err);
      setError("Erro ao carregar scan. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [severity, approved]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const results = data?.results || [];
  const hasResults = results.length > 0;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Content Scan
          </h1>
          <p className="text-sm mt-1 text-text-muted">
            Analise de termos proibidos e suspeitos nos anuncios
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto disabled:opacity-50"
        >
          <span className={loading ? "animate-spin" : ""}>&#x1F50D;</span>
          Scan Now
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────── */}
      {data && !loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Total escaneados" value={data.total ?? 0} colorKey="gray" />
          <StatCard label="Flagged total" value={data.flaggedCount ?? 0} colorKey="rose" />
          <StatCard label="Red (blocked)" value={data.redCount ?? 0} colorKey="red" />
          <StatCard label="Yellow (flagged)" value={data.yellowCount ?? 0} colorKey="amber" />
        </div>
      )}

      {/* ── Filter Row ─────────────────────────────────────── */}
      <div className="glass-card flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">
            Severidade
          </p>
          <FilterChips items={SEVERITY_FILTERS} active={severity} onChange={setSeverity} />
        </div>
        <div className="hidden sm:block w-px h-8 shrink-0 bg-border" />
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase font-semibold tracking-wider text-text-muted">
            Aprovacao
          </p>
          <FilterChips items={APPROVED_FILTERS} active={approved} onChange={setApproved} />
        </div>
      </div>

      {/* ── Results ────────────────────────────────────────── */}
      {loading && <LoadingState />}

      {error && !loading && (
        <div className="rounded-lg p-6 text-center border border-red-500/25 bg-red-500/[0.06]">
          <p className="text-sm font-medium text-red-400">{error}</p>
          <button
            onClick={fetchData}
            className="text-xs font-medium mt-2 transition-colors hover:underline text-primary"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {!loading && !error && !hasResults && <EmptyState />}

      {!loading && !error && hasResults && (
        <div className="space-y-3">
          {results.map((item) => (
            <ScanResultCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
