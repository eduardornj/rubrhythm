"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// -- Constants ---------------------------------------------------------------

const PAGE_SIZE = 50;

const TYPE_FILTERS = [
  { key: "", label: "Todos" },
  { key: "ADMIN_ACTION", label: "Admin Action" },
  { key: "verification_review", label: "Verification" },
  { key: "login_attempt", label: "Login" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
];

const TYPE_STYLES = {
  ADMIN_ACTION: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  verification_review: "border-sky-400/30 bg-sky-400/10 text-sky-400",
  login_attempt: "border-green-500/30 bg-green-500/10 text-green-400",
  login: "border-green-500/30 bg-green-500/10 text-green-400",
  warning: "border-red-500/30 bg-red-500/10 text-red-400",
  error: "border-red-500/30 bg-red-500/10 text-red-400",
};

const SEVERITY_STYLES = {
  info: "border-sky-400/30 bg-sky-400/10 text-sky-400",
  low: "border-sky-400/30 bg-sky-400/10 text-sky-400",
  warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  medium: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  high: "border-red-500/30 bg-red-500/10 text-red-400",
  critical: "border-red-600/30 bg-red-600/10 text-red-500",
};

// -- Helpers -----------------------------------------------------------------

function formatDateTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatJsonDetails(details) {
  if (!details) return null;
  try {
    const obj = typeof details === "string" ? JSON.parse(details) : details;
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(details);
  }
}

// -- Micro-components --------------------------------------------------------

function TypeBadge({ type }) {
  const style = TYPE_STYLES[type] || "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-bold border whitespace-nowrap ${style}`}>
      {type}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const style = SEVERITY_STYLES[severity] || SEVERITY_STYLES.info;
  return (
    <span className={`px-2 py-0.5 rounded text-[11px] font-medium border whitespace-nowrap ${style}`}>
      {severity}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="p-4 border-b border-border/50 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="h-5 w-28 rounded bg-white/[0.06]" />
        <div className="h-5 w-16 rounded bg-white/[0.06]" />
        <div className="flex-1">
          <div className="h-4 w-64 rounded bg-white/[0.04]" />
        </div>
        <div className="h-3 w-24 rounded bg-white/[0.04]" />
      </div>
    </div>
  );
}

// -- Main Page ---------------------------------------------------------------

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const abortRef = useRef(null);

  const fetchLogs = useCallback(async (currentType, currentPage) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(PAGE_SIZE),
      });
      if (currentType) params.set("type", currentType);

      const res = await fetch(`/api/admin/logs?${params}`, { signal: ctrl.signal });
      if (!res.ok) throw new Error(`Erro ${res.status}`);

      const json = await res.json();

      if (json.success) {
        setLogs(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.pages || 1);
      }
    } catch (err) {
      if (err.name !== "AbortError") console.error("[Logs] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(typeFilter, page);
    return () => abortRef.current?.abort();
  }, [typeFilter, page, fetchLogs]);

  function handleTypeChange(type) {
    setTypeFilter(type);
    setPage(1);
    setExpandedId(null);
  }

  function toggleExpand(id) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  const isEmpty = !loading && logs.length === 0;

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in">
      {/* -- Header --------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Activity Logs
          </h1>
          {!loading && (
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums border border-primary/25 bg-primary/10 text-primary">
              {total.toLocaleString()} registros
            </span>
          )}
        </div>
        <button
          onClick={() => fetchLogs(typeFilter, page)}
          disabled={loading}
          className="btn-secondary self-start sm:self-auto disabled:opacity-50"
          aria-label="Atualizar logs"
        >
          {loading ? "..." : "Atualizar"}
        </button>
      </div>

      {/* -- Type Filter Chips ---------------------------------------------- */}
      <div className="flex gap-2 flex-wrap mb-6">
        {TYPE_FILTERS.map((f) => {
          const isActive = typeFilter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => handleTypeChange(f.key)}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap border ${
                isActive
                  ? "border-primary/40 bg-primary/90 text-white"
                  : "border-border text-text-muted hover:border-primary/20 hover:text-white"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* -- Loading Skeleton ----------------------------------------------- */}
      {loading && (
        <div className="glass-card !p-0 overflow-hidden">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      )}

      {/* -- Desktop Table -------------------------------------------------- */}
      {!loading && !isEmpty && (
        <>
          <div className="hidden md:block glass-card !p-0 overflow-hidden mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Tipo</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Severidade</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Mensagem</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">IP</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-text-muted">Data</th>
                  <th className="text-center px-5 py-3 text-xs font-medium text-text-muted w-10" />
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  const hasDetails = log.details && Object.keys(log.details).length > 0;

                  return (
                    <tr key={log.id} className="group">
                      <td colSpan={6} className="p-0">
                        {/* Main row */}
                        <div
                          className={`flex items-center px-5 py-3 transition-colors border-b border-border/50 ${
                            hasDetails ? "cursor-pointer hover:bg-white/[0.03]" : ""
                          }`}
                          onClick={() => hasDetails && toggleExpand(log.id)}
                          role={hasDetails ? "button" : undefined}
                          tabIndex={hasDetails ? 0 : undefined}
                          onKeyDown={(e) => {
                            if (hasDetails && (e.key === "Enter" || e.key === " ")) {
                              e.preventDefault();
                              toggleExpand(log.id);
                            }
                          }}
                        >
                          <div className="w-[160px] shrink-0">
                            <TypeBadge type={log.type} />
                          </div>
                          <div className="w-[100px] shrink-0">
                            <SeverityBadge severity={log.severity} />
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-white text-sm truncate">{log.message}</p>
                          </div>
                          <div className="w-[130px] shrink-0">
                            <span className="font-mono text-xs text-text-muted">
                              {log.ipAddress || "-"}
                            </span>
                          </div>
                          <div className="w-[150px] shrink-0 text-right">
                            <span className="text-xs tabular-nums text-text-muted">
                              {formatDateTime(log.createdAt)}
                            </span>
                          </div>
                          <div className="w-[40px] shrink-0 text-center">
                            {hasDetails && (
                              <span
                                className={`inline-block text-text-muted text-xs transition-transform duration-150 ${
                                  isExpanded ? "rotate-90" : ""
                                }`}
                              >
                                &#9654;
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && hasDetails && (
                          <div className="px-5 py-3 border-b border-border/50 bg-white/[0.015]">
                            <pre className="text-xs font-mono text-text-muted overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-60 overflow-y-auto">
                              {formatJsonDetails(log.details)}
                            </pre>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3 mb-6">
            {logs.map((log) => {
              const isExpanded = expandedId === log.id;
              const hasDetails = log.details && Object.keys(log.details).length > 0;

              return (
                <div
                  key={log.id}
                  className="glass-card"
                >
                  <div
                    className={`${hasDetails ? "cursor-pointer" : ""}`}
                    onClick={() => hasDetails && toggleExpand(log.id)}
                    role={hasDetails ? "button" : undefined}
                    tabIndex={hasDetails ? 0 : undefined}
                    onKeyDown={(e) => {
                      if (hasDetails && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        toggleExpand(log.id);
                      }
                    }}
                  >
                    {/* Badges row */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <TypeBadge type={log.type} />
                      <SeverityBadge severity={log.severity} />
                      {hasDetails && (
                        <span
                          className={`text-text-muted text-xs ml-auto transition-transform duration-150 ${
                            isExpanded ? "rotate-90" : ""
                          }`}
                        >
                          &#9654;
                        </span>
                      )}
                    </div>

                    {/* Message */}
                    <p className="text-sm text-white mb-2 leading-relaxed">{log.message}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-[11px] text-text-muted">
                      {log.ipAddress && (
                        <span className="font-mono">{log.ipAddress}</span>
                      )}
                      <span className="tabular-nums">{formatDateTime(log.createdAt)}</span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && hasDetails && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <pre className="text-xs font-mono text-text-muted overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
                        {formatJsonDetails(log.details)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* -- Empty State ---------------------------------------------------- */}
      {isEmpty && (
        <div className="glass-card p-12 text-center">
          <p className="text-2xl mb-2">&#128220;</p>
          <p className="text-white font-bold">Nenhum log encontrado</p>
          <p className="text-sm text-text-muted mt-1">
            {typeFilter ? `Nenhum registro do tipo "${typeFilter}"` : "Nenhum registro de atividade"}
          </p>
        </div>
      )}

      {/* -- Pagination ----------------------------------------------------- */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <span className="text-sm tabular-nums text-text-muted">
            Pagina <span className="text-white font-bold">{page}</span> de {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="btn-secondary disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Proxima
          </button>
        </div>
      )}
    </div>
  );
}
