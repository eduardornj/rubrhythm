"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

// ── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "anuncios", label: "Anuncios", emoji: "\u{1F4CB}" },
  { key: "transacoes", label: "Transacoes", emoji: "\u{1F4B0}" },
  { key: "verificacao", label: "Verificacao", emoji: "\u{1FA99}" },
  { key: "reviews", label: "Reviews", emoji: "\u2B50" },
  { key: "reports", label: "Reports", emoji: "\u{1F6A8}" },
  { key: "security", label: "Security", emoji: "\u{1F512}" },
  { key: "escrows", label: "Escrows", emoji: "\u{1F91D}" },
  { key: "tips", label: "Tips", emoji: "\u{1F4B5}" },
];

const ROLE_MAP = {
  provider: { classes: "border-primary/30 bg-primary/10 text-primary", label: "Massagista" },
  user: { classes: "border-sky-400/30 bg-sky-400/10 text-sky-400", label: "Cliente" },
  admin: { classes: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400", label: "Admin" },
};

const SEVERITY_MAP = {
  low: "border-sky-400/30 bg-sky-400/10 text-sky-400",
  medium: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  high: "border-red-500/30 bg-red-500/10 text-red-400",
  critical: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400",
};

const TX_TYPE_MAP = {
  purchase: "border-sky-400/30 bg-sky-400/10 text-sky-400",
  credit: "border-green-500/30 bg-green-500/10 text-green-400",
  debit: "border-red-500/30 bg-red-500/10 text-red-400",
  refund: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  tip_sent: "border-primary/30 bg-primary/10 text-primary",
  tip_received: "border-green-500/30 bg-green-500/10 text-green-400",
  bump: "border-sky-400/30 bg-sky-400/10 text-sky-400",
  feature: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  highlight: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  escrow_fund: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  escrow_release: "border-green-500/30 bg-green-500/10 text-green-400",
  escrow_refund: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  admin_adjustment: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400",
};

const STATUS_MAP = {
  green: "border-green-500/30 bg-green-500/10 text-green-400",
  red: "border-red-500/30 bg-red-500/10 text-red-400",
  yellow: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  gray: "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
  gold: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  rose: "border-primary/30 bg-primary/10 text-primary",
  sky: "border-sky-400/30 bg-sky-400/10 text-sky-400",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(d) {
  if (!d) return "-";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function fmtCurrency(n) {
  if (n == null) return "R$ 0";
  return `R$ ${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtNumber(n) {
  if (n == null) return "0";
  return Number(n).toLocaleString("pt-BR");
}

function truncate(str, max) {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function stars(rating) {
  const r = Math.round(Number(rating) || 0);
  return "\u2B50".repeat(Math.min(r, 5));
}

// ── Reusable UI Pieces ──────────────────────────────────────────────────────

function RoleBadge({ role }) {
  const r = ROLE_MAP[role] || ROLE_MAP.user;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${r.classes}`}>
      {r.label}
    </span>
  );
}

function StatusBadge({ label, color }) {
  const c = STATUS_MAP[color] || STATUS_MAP.gray;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${c}`}>
      {label}
    </span>
  );
}

function SeverityBadge({ severity }) {
  const c = SEVERITY_MAP[severity] || SEVERITY_MAP.low;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase border whitespace-nowrap ${c}`}>
      {severity}
    </span>
  );
}

function TxBadge({ type }) {
  const c = TX_TYPE_MAP[type] || "border-zinc-500/30 bg-zinc-500/10 text-zinc-400";
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${c}`}>
      {type || "outro"}
    </span>
  );
}

function Pill({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap border border-border bg-white/[0.04] text-text-muted">
      {children}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-12 text-center text-zinc-600">
      <p className="text-sm">{message}</p>
    </div>
  );
}

function ImageModal({ src, onClose }) {
  if (!src) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      <div className="relative max-w-3xl max-h-[90vh] w-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white text-2xl font-bold hover:opacity-70 transition-opacity"
          aria-label="Fechar"
        >
          ✕
        </button>
        <img
          src={src}
          alt="Imagem ampliada"
          className="w-full h-full object-contain rounded-xl border border-border"
        />
      </div>
    </div>
  );
}

// ── Loading Skeleton ────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in">
      {/* Header skeleton */}
      <div className="glass-card !p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/[0.06] animate-pulse" />
          <div className="flex-1">
            <div className="h-7 w-48 rounded-lg bg-white/[0.06] animate-pulse mb-3" />
            <div className="h-4 w-64 rounded-lg bg-white/[0.04] animate-pulse mb-3" />
            <div className="flex gap-2">
              <div className="h-5 w-20 rounded-full bg-white/[0.04] animate-pulse" />
              <div className="h-5 w-24 rounded-full bg-white/[0.04] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="glass-card !p-3">
            <div className="h-5 w-6 rounded bg-white/[0.06] animate-pulse mb-2" />
            <div className="h-3 w-16 rounded bg-white/[0.04] animate-pulse mb-1.5" />
            <div className="h-6 w-12 rounded bg-white/[0.06] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-9 w-24 rounded-full shrink-0 bg-white/[0.04] animate-pulse" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card !p-5 h-[120px] animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// ── Error State ─────────────────────────────────────────────────────────────

function ErrorState({ message, onRetry }) {
  return (
    <div className="max-w-[1400px] mx-auto flex flex-col items-center justify-center py-24 animate-fade-in">
      <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
      <h2 className="text-lg font-bold text-red-400 mb-2">Erro ao carregar</h2>
      <p className="text-sm text-text-muted mb-6">{message}</p>
      <button onClick={onRetry} className="btn-primary text-sm">
        Tentar novamente
      </button>
    </div>
  );
}

// ── TAB: Anuncios ───────────────────────────────────────────────────────────

function ListingStatusBadge({ isApproved, isActive }) {
  if (!isApproved) return <StatusBadge label="Pendente" color="yellow" />;
  if (!isActive) return <StatusBadge label="Inativo" color="gray" />;
  return <StatusBadge label="Ativo" color="green" />;
}

function TabAnuncios({ listings, onImageClick }) {
  if (!listings?.length) return <EmptyState message="Nenhum anuncio encontrado." />;

  return (
    <div className="space-y-4">
      {listings.map((l) => (
        <div key={l.id} className="glass-card !p-0 overflow-hidden">
          <div className="p-4 sm:p-5">
            {/* Top row: image + title + status */}
            <div className="flex gap-4 mb-4">
              {/* Thumbnail */}
              <div className="shrink-0">
                {l.firstImage ? (
                  <img
                    src={l.firstImage}
                    alt={l.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border"
                    onClick={() => onImageClick(l.firstImage)}
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl flex items-center justify-center text-2xl bg-white/[0.03] border border-border">
                    {"\u{1F4F7}"}
                  </div>
                )}
              </div>

              {/* Title + Meta */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap mb-1">
                  <h3 className="text-base font-bold text-white truncate">
                    {l.title || "Sem titulo"}
                  </h3>
                  <ListingStatusBadge isApproved={l.isApproved} isActive={l.isActive} />
                  {l.isFeatured && <StatusBadge label="Destaque" color="gold" />}
                  {l.isHighlighted && <StatusBadge label="Highlighted" color="sky" />}
                  {l.isFoundingProvider && <StatusBadge label="Founding" color="rose" />}
                </div>
                <p className="text-sm text-text-muted mb-1">
                  {[l.city, l.state].filter(Boolean).join(", ") || "Local nao informado"}
                  {l.neighborhood ? ` - ${l.neighborhood}` : ""}
                </p>
                {l.description && (
                  <p className="text-xs leading-relaxed text-zinc-500">
                    {truncate(l.description, 150)}
                  </p>
                )}
              </div>
            </div>

            {/* Contact row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1.5 mb-3 text-xs text-text-muted">
              {l.phone && <span>{"\u{1F4DE}"} {l.phone}</span>}
              {l.whatsapp && <span>{"\u{1F4F1}"} WhatsApp: {l.whatsapp}</span>}
              {l.telegram && <span>{"\u2709\uFE0F"} Telegram: {l.telegram}</span>}
              {l.websiteUrl && (
                <a href={l.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">
                  {"\u{1F310}"} {truncate(l.websiteUrl, 40)}
                </a>
              )}
            </div>

            {/* Services pills */}
            {l.services?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {l.services.map((s, i) => (
                  <Pill key={i}>{typeof s === "string" ? s : s.name || JSON.stringify(s)}</Pill>
                ))}
              </div>
            )}

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-500 mb-3">
              <span>{"\u{1F441}"} {fmtNumber(l.viewCount)} views</span>
              <span>{stars(l.averageRating)} {Number(l.averageRating || 0).toFixed(1)}</span>
              <span>{"\u{1F4AC}"} {l.totalReviews || 0} reviews</span>
              {l.hourlyRate > 0 && <span>{"\u{1F4B2}"} R$ {l.hourlyRate}/h</span>}
              {l.age && <span>{"\u{1F382}"} {l.age} anos</span>}
              {l.bodyType && <span>{"\u{1F3CB}"} {l.bodyType}</span>}
              {l.ethnicity && <span>{"\u{1F30D}"} {l.ethnicity}</span>}
              {l.serviceLocation && <span>{"\u{1F4CD}"} {l.serviceLocation}</span>}
            </div>

            {/* Availability + auto settings */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600 mb-3">
              {l.availableNow && <span className="text-green-400">{"\u2705"} Disponivel agora</span>}
              {l.availableUntil && <span>Ate: {fmtDateTime(l.availableUntil)}</span>}
              {l.autoBumpEnabled && <span>{"\u{1F504}"} Auto-bump: {l.autoBumpHour || "?"}h</span>}
              {l.autoRenewFeatured && <span>{"\u{1F31F}"} Auto-renew destaque</span>}
              {l.autoRenewHighlight && <span>{"\u{1F4A1}"} Auto-renew highlight</span>}
              {l.autoRenewAvailable && <span>{"\u{1F7E2}"} Auto-renew available</span>}
            </div>

            {/* Feature tier + dates */}
            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600">
              {l.featureTier && <span>Tier: {l.featureTier}</span>}
              {l.featuredEndDate && <span>Destaque ate: {fmtDate(l.featuredEndDate)}</span>}
              {l.highlightEndDate && <span>Highlight ate: {fmtDate(l.highlightEndDate)}</span>}
              <span>Criado: {l.createdAgo || fmtDate(l.createdAt)}</span>
              {l.lastBumpAgo && <span>Ultimo bump: {l.lastBumpAgo}</span>}
              {l.imageCount > 0 && <span>{"\u{1F5BC}"} {l.imageCount} imagens</span>}
            </div>

            {/* Rates */}
            {l.rates?.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-zinc-600">Tabela de precos</p>
                <div className="flex flex-wrap gap-2">
                  {l.rates.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/[0.03] text-text-muted border border-border">
                      {r.duration || r.label || r.name || `Opcao ${i + 1}`}: R$ {r.price || r.value || r.amount || "?"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social links */}
            {l.socialLinks && Object.keys(l.socialLinks).length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-zinc-600">Redes sociais</p>
                <div className="flex flex-wrap gap-3 text-xs text-sky-400">
                  {Object.entries(l.socialLinks).map(([k, v]) =>
                    v ? (
                      <a key={k} href={v} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {k}: {truncate(String(v), 30)}
                      </a>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Images gallery */}
            {l.images?.length > 1 && (
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-zinc-600">Todas as imagens</p>
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {l.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Imagem ${i + 1}`}
                      className="w-16 h-16 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity shrink-0 border border-border"
                      onClick={() => onImageClick(img)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TAB: Transacoes ─────────────────────────────────────────────────────────

function TabTransacoes({ transactions }) {
  if (!transactions?.length) return <EmptyState message="Nenhuma transacao encontrada." />;

  return (
    <div className="glass-card !p-0 overflow-hidden">
      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">Data</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">Tipo</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-600">Valor</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">Descricao</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-white/[0.03] transition-colors duration-150 hover:bg-white/[0.03]">
                <td className="px-5 py-3 text-xs whitespace-nowrap text-zinc-500">{fmtDateTime(t.createdAt)}</td>
                <td className="px-5 py-3"><TxBadge type={t.type} /></td>
                <td className={`px-5 py-3 text-right text-sm font-mono font-semibold ${t.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {t.amount >= 0 ? "+" : ""}{fmtCurrency(t.amount)}
                </td>
                <td className="px-5 py-3 text-xs max-w-xs truncate text-text-muted">
                  {t.description || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile list */}
      <div className="sm:hidden divide-y divide-border">
        {transactions.map((t) => (
          <div key={t.id} className="px-4 py-3 transition-colors duration-150 hover:bg-white/[0.03]">
            <div className="flex items-center justify-between mb-1">
              <TxBadge type={t.type} />
              <span className={`text-sm font-mono font-semibold ${t.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                {t.amount >= 0 ? "+" : ""}{fmtCurrency(t.amount)}
              </span>
            </div>
            <p className="text-xs truncate text-text-muted">{t.description || "-"}</p>
            <p className="text-[11px] mt-1 text-zinc-600">{fmtDateTime(t.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── TAB: Verificacao ────────────────────────────────────────────────────────

function TabVerificacao({ verifications, onImageClick }) {
  if (!verifications?.length) return <EmptyState message="Nenhuma verificacao encontrada." />;

  const statusColor = (s) => {
    if (s === "approved") return "green";
    if (s === "rejected") return "red";
    return "yellow";
  };

  const statusLabel = (s) => {
    if (s === "approved") return "Aprovado";
    if (s === "rejected") return "Rejeitado";
    return "Pendente";
  };

  return (
    <div className="space-y-4">
      {verifications.map((v) => (
        <div key={v.id} className="glass-card !p-0 overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between mb-4">
              <StatusBadge label={statusLabel(v.status)} color={statusColor(v.status)} />
              <span className="text-xs text-zinc-600">{fmtDateTime(v.createdAt)}</span>
            </div>

            <div className="flex gap-4 flex-wrap">
              {/* Selfie */}
              <div>
                <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-zinc-600">Selfie</p>
                {v.selfiePath ? (
                  <img
                    src={v.selfiePath}
                    alt="Selfie"
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border"
                    onClick={() => onImageClick(v.selfiePath)}
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl flex items-center justify-center text-sm bg-white/[0.03] text-zinc-600 border border-border">
                    Sem selfie
                  </div>
                )}
              </div>

              {/* Document */}
              <div>
                <p className="text-[11px] font-semibold mb-1.5 uppercase tracking-wider text-zinc-600">Documento</p>
                {v.documentPath ? (
                  <img
                    src={v.documentPath}
                    alt="Documento"
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl object-cover cursor-pointer hover:opacity-80 transition-opacity border border-border"
                    onClick={() => onImageClick(v.documentPath)}
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl flex items-center justify-center text-sm bg-white/[0.03] text-zinc-600 border border-border">
                    Sem doc
                  </div>
                )}
              </div>
            </div>

            {v.status === "rejected" && v.rejectionReason && (
              <div className="mt-4 p-3 rounded-xl border border-red-500/20 bg-red-500/[0.06]">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-red-400">Motivo da rejeicao</p>
                <p className="text-sm text-red-300">{v.rejectionReason}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TAB: Reviews ────────────────────────────────────────────────────────────

function TabReviews({ reviewsReceived, reviewsGiven }) {
  const hasReceived = reviewsReceived?.length > 0;
  const hasGiven = reviewsGiven?.length > 0;
  if (!hasReceived && !hasGiven) return <EmptyState message="Nenhum review encontrado." />;

  const reviewStatusColor = (s) => {
    if (s === "approved") return "green";
    if (s === "rejected" || s === "removed") return "red";
    return "yellow";
  };

  return (
    <div className="space-y-6">
      {/* Received */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-300">
          <span>{"\u{1F4E5}"}</span> Recebidos ({reviewsReceived?.length || 0})
        </h3>
        {hasReceived ? (
          <div className="space-y-3">
            {reviewsReceived.map((r) => (
              <div key={r.id} className="glass-card !p-0 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stars(r.rating)}</span>
                      <StatusBadge label={r.status || "pending"} color={reviewStatusColor(r.status)} />
                      {r.isVerified && <StatusBadge label="Verificado" color="green" />}
                      {r.isAnonymous && <StatusBadge label="Anonimo" color="gray" />}
                    </div>
                    <span className="text-xs text-zinc-600">{fmtDateTime(r.createdAt)}</span>
                  </div>

                  {r.comment && <p className="text-sm mb-2 text-zinc-300">{r.comment}</p>}

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                    {r.user_review_reviewerIdTouser && (
                      <span>Por: {r.user_review_reviewerIdTouser.name || r.user_review_reviewerIdTouser.email}</span>
                    )}
                    {r.listing && <span>Anuncio: {r.listing.title}</span>}
                  </div>

                  {r.providerResponse && (
                    <div className="mt-3 p-3 rounded-xl bg-white/[0.03] border border-border">
                      <p className="text-[11px] font-semibold mb-1 text-zinc-600">Resposta do provider:</p>
                      <p className="text-xs text-text-muted">{r.providerResponse}</p>
                      {r.providerRespondedAt && (
                        <p className="text-[10px] mt-1 text-zinc-600">{fmtDateTime(r.providerRespondedAt)}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">Nenhum review recebido.</p>
        )}
      </div>

      {/* Given */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-300">
          <span>{"\u{1F4E4}"}</span> Dados ({reviewsGiven?.length || 0})
        </h3>
        {hasGiven ? (
          <div className="space-y-3">
            {reviewsGiven.map((r) => (
              <div key={r.id} className="glass-card !p-0 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{stars(r.rating)}</span>
                      <StatusBadge label={r.status || "pending"} color={reviewStatusColor(r.status)} />
                    </div>
                    <span className="text-xs text-zinc-600">{fmtDateTime(r.createdAt)}</span>
                  </div>

                  {r.comment && <p className="text-sm mb-2 text-zinc-300">{r.comment}</p>}

                  {r.listing && (
                    <p className="text-xs text-zinc-500">
                      Anuncio: {r.listing.title}
                      {r.listing.city && ` - ${r.listing.city}`}
                      {r.listing.state && `, ${r.listing.state}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-600">Nenhum review dado.</p>
        )}
      </div>
    </div>
  );
}

// ── TAB: Reports ────────────────────────────────────────────────────────────

function TabReports({ reports }) {
  if (!reports?.length) return <EmptyState message="Nenhum report encontrado." />;

  const statusColor = (s) => {
    if (s === "resolved") return "green";
    if (s === "dismissed") return "gray";
    return "yellow";
  };

  return (
    <div className="space-y-3">
      {reports.map((r) => (
        <div key={r.id} className="glass-card !p-0 overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-2">
                <SeverityBadge severity={r.severity || "low"} />
                <StatusBadge label={r.status || "pending"} color={statusColor(r.status)} />
                {r.type && <Pill>{r.type}</Pill>}
              </div>
              <span className="text-xs text-zinc-600">{fmtDateTime(r.createdAt)}</span>
            </div>

            {r.description && <p className="text-sm mb-3 text-zinc-300">{r.description}</p>}

            {r.user_fraudreport_reporterIdTouser && (
              <p className="text-xs mb-2 text-zinc-500">
                Reportado por: {r.user_fraudreport_reporterIdTouser.name || r.user_fraudreport_reporterIdTouser.email}
              </p>
            )}

            {r.evidence && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-zinc-600">Evidencia</p>
                <p className="text-xs text-text-muted">
                  {typeof r.evidence === "string" ? r.evidence : JSON.stringify(r.evidence)}
                </p>
              </div>
            )}

            {r.adminNotes && (
              <div className="p-3 rounded-xl mb-2 border border-yellow-500/20 bg-yellow-500/[0.06]">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-yellow-400">Notas admin</p>
                <p className="text-xs text-yellow-200">{r.adminNotes}</p>
              </div>
            )}

            {r.resolution && (
              <div className="p-3 rounded-xl border border-green-500/20 bg-green-500/[0.06]">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-green-400">Resolucao</p>
                <p className="text-xs text-green-200">{r.resolution}</p>
                {r.resolvedAt && <p className="text-[10px] mt-1 text-zinc-600">Resolvido em: {fmtDateTime(r.resolvedAt)}</p>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TAB: Security ───────────────────────────────────────────────────────────

function TabSecurity({ logs }) {
  if (!logs?.length) return <EmptyState message="Nenhum log de seguranca encontrado." />;

  return (
    <div className="glass-card !p-0 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">Data</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">Severidade</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">Mensagem</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-600">IP</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-b border-white/[0.03] transition-colors duration-150 hover:bg-white/[0.03]">
                <td className="px-5 py-3 text-xs whitespace-nowrap text-zinc-500">{fmtDateTime(l.createdAt)}</td>
                <td className="px-5 py-3"><Pill>{l.type || "unknown"}</Pill></td>
                <td className="px-5 py-3"><SeverityBadge severity={l.severity || "low"} /></td>
                <td className="px-5 py-3 text-xs max-w-sm text-text-muted">{l.message || "-"}</td>
                <td className="px-5 py-3 text-xs font-mono text-zinc-500">{l.ipAddress || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── TAB: Escrows ────────────────────────────────────────────────────────────

function TabEscrows({ escrows }) {
  if (!escrows?.length) return <EmptyState message="Nenhum escrow encontrado." />;

  const escrowStatusColor = (s) => {
    if (s === "completed" || s === "released") return "green";
    if (s === "disputed") return "red";
    if (s === "funded" || s === "pending") return "yellow";
    if (s === "refunded") return "sky";
    return "gray";
  };

  return (
    <div className="space-y-3">
      {escrows.map((e) => (
        <div key={e.id} className="glass-card !p-0 overflow-hidden">
          <div className="p-4 sm:p-5">
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold font-mono text-green-400">{fmtCurrency(e.amount)}</span>
                <StatusBadge label={e.status || "pending"} color={escrowStatusColor(e.status)} />
              </div>
              <span className="text-xs text-zinc-600">{fmtDateTime(e.createdAt)}</span>
            </div>

            {e.description && <p className="text-sm mb-3 text-text-muted">{e.description}</p>}

            {e.disputeReason && (
              <div className="p-3 rounded-xl mb-3 border border-red-500/20 bg-red-500/[0.06]">
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-red-400">Motivo da disputa</p>
                <p className="text-xs text-red-300">{e.disputeReason}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600">
              {e.fundedAt && <span>Fundado: {fmtDateTime(e.fundedAt)}</span>}
              {e.completedAt && <span>Completo: {fmtDateTime(e.completedAt)}</span>}
              {e.disputedAt && <span className="text-red-400">Disputado: {fmtDateTime(e.disputedAt)}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── TAB: Tips ───────────────────────────────────────────────────────────────

function TabTips({ tips }) {
  if (!tips?.length) return <EmptyState message="Nenhum tip recebido." />;

  const tipStatusColor = (s) => {
    if (s === "completed") return "green";
    if (s === "pending") return "yellow";
    if (s === "failed") return "red";
    return "gray";
  };

  return (
    <div className="space-y-3">
      {tips.map((t) => (
        <div key={t.id} className="glass-card !p-0 overflow-hidden">
          <div className="p-4 flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold font-mono text-green-400">+{fmtCurrency(t.amount)}</span>
                <StatusBadge label={t.status || "completed"} color={tipStatusColor(t.status)} />
              </div>
              {t.message && <p className="text-sm mb-1 text-zinc-300">{t.message}</p>}
              <p className="text-xs text-zinc-500">
                De: {t.user_tip_senderIdTouser?.name || "Anonimo"}
              </p>
            </div>
            <span className="text-xs shrink-0 text-zinc-600">{fmtDateTime(t.createdAt)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN PAGE COMPONENT ─────────────────────────────────────────────────────

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("anuncios");
  const [selectedImage, setSelectedImage] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" });

  const fetchData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = await res.json();
      if (!json.success) throw new Error("Resposta invalida do servidor");
      setData(json.data);
    } catch (err) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Actions ──────────────────────────────────────────────────────────

  async function handleBanToggle() {
    if (!data?.user) return;
    const isBanned = data.user.isBanned;
    const confirmed = confirm(isBanned ? "Desbanir este usuario?" : "Banir este usuario?");
    if (!confirmed) return;

    setActionLoading("ban");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "ban", value: !isBanned }),
      });
      if (!res.ok) throw new Error("Falha na operacao");
      await fetchData();
    } catch {
      alert("Erro ao alterar status de ban");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleVerifyToggle() {
    if (!data?.user) return;
    const verified = data.user.verified;
    setActionLoading("verify");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "verify", value: !verified }),
      });
      if (!res.ok) throw new Error("Falha");
      await fetchData();
    } catch {
      alert("Erro ao alterar verificacao");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleAdjustCredits() {
    const amountStr = prompt("Valor do ajuste (positivo para adicionar, negativo para remover):");
    if (amountStr == null) return;
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount === 0) { alert("Valor invalido"); return; }
    const reason = prompt("Motivo do ajuste:") || "Ajuste admin";

    setActionLoading("credits");
    try {
      const res = await fetch("/api/admin/financial", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "adjust_credits", type: "adjust_credits", userId, amount, reason }),
      });
      if (!res.ok) throw new Error("Falha");
      await fetchData();
    } catch {
      alert("Erro ao ajustar creditos");
    } finally {
      setActionLoading(null);
    }
  }

  function startEditing() {
    if (!data?.user) return;
    setEditForm({ name: data.user.name || "", email: data.user.email || "", role: data.user.role || "user" });
    setEditing(true);
  }

  async function handleSaveEdit() {
    setActionLoading("edit");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Falha");
      }
      setEditing(false);
      await fetchData();
    } catch (err) {
      alert(`Erro ao editar: ${err.message}`);
    } finally {
      setActionLoading(null);
    }
  }

  // ── Render ───────────────────────────────────────────────────────────

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;
  if (!data) return <ErrorState message="Dados nao encontrados" onRetry={fetchData} />;

  const { user, listings, transactions, verifications, reviewsGiven, reviewsReceived, reportsReceived, tipsReceived, escrows, securityLogs, stats } = data;

  const STAT_CARDS = [
    { emoji: "\u{1F4CB}", label: "Anuncios ativos", value: stats.activeListings },
    { emoji: "\u{1F441}", label: "Views total", value: fmtNumber(stats.totalViews) },
    { emoji: "\u2B50", label: "Rating medio", value: stats.avgRating || "0" },
    { emoji: "\u{1F4AC}", label: "Reviews recebidos", value: stats.reviewsReceivedCount },
    { emoji: "\u{1F4E8}", label: "Mensagens", value: fmtNumber(stats.messagesSent) },
    { emoji: "\u{1F5E3}", label: "Chats", value: stats.totalChats },
    { emoji: "\u{1FA99}", label: "Creditos", value: fmtCurrency(stats.creditBalance) },
    { emoji: "\u{1F4B8}", label: "Total gasto", value: fmtCurrency(stats.totalSpent) },
    { emoji: "\u{1F4B0}", label: "Total recebido", value: fmtCurrency(stats.totalEarned) },
    { emoji: "\u{1F4B5}", label: "Tips recebidos", value: stats.tipsReceivedCount },
    { emoji: "\u{1F91D}", label: "Escrows", value: stats.escrowCount },
    { emoji: "\u{1F6A8}", label: "Reports", value: stats.reportsReceivedCount },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "anuncios": return <TabAnuncios listings={listings} onImageClick={setSelectedImage} />;
      case "transacoes": return <TabTransacoes transactions={transactions} />;
      case "verificacao": return <TabVerificacao verifications={verifications} onImageClick={setSelectedImage} />;
      case "reviews": return <TabReviews reviewsReceived={reviewsReceived} reviewsGiven={reviewsGiven} />;
      case "reports": return <TabReports reports={reportsReceived} />;
      case "security": return <TabSecurity logs={securityLogs} />;
      case "escrows": return <TabEscrows escrows={escrows} />;
      case "tips": return <TabTips tips={tipsReceived} />;
      default: return null;
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in">
      {/* Image Modal */}
      <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />

      {/* ── Back Button ─────────────────────────────────────────────── */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 text-sm font-medium mb-6 transition-colors duration-150 text-text-muted/50 hover:text-white"
      >
        <span>&larr;</span>
        <span>Voltar para usuarios</span>
      </Link>

      {/* ── User Header ─────────────────────────────────────────────── */}
      <div className="glass-card !p-0 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            {/* Avatar */}
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-primary/40 shadow-lg shadow-primary/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 text-primary border-2 border-primary/40 shadow-lg shadow-primary/20">
                {(user.name || "?")[0].toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              {editing ? (
                /* Inline edit form */
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1 block">Nome</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      className="input-field text-sm !py-2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1 block">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
                      className="input-field text-sm !py-2"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-600 mb-1 block">Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      className="input-field text-sm !py-2"
                    >
                      <option value="user">Cliente</option>
                      <option value="provider">Massagista</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSaveEdit}
                      disabled={actionLoading === "edit"}
                      className="btn-primary text-xs !py-2 !px-4 disabled:opacity-50"
                    >
                      {actionLoading === "edit" ? "Salvando..." : "Salvar"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="btn-secondary text-xs !py-2 !px-4"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <h1 className="text-2xl font-black tracking-tight text-white">
                      {user.name || "Sem nome"}
                    </h1>
                    <RoleBadge role={user.role} />
                  </div>

                  <p className="text-sm mb-3 text-zinc-500">{user.email}</p>

                  {/* Status badges row */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {user.verified ? (
                      <StatusBadge label={"\u2705 Verificado"} color="green" />
                    ) : (
                      <StatusBadge label="Nao verificado" color="gray" />
                    )}
                    {user.isBanned && <StatusBadge label={"\u{1F6AB} Banido"} color="red" />}
                    {user.isFeatured && (
                      <StatusBadge
                        label={`\u{1F31F} Destaque${user.featuredEndDate ? ` ate ${fmtDate(user.featuredEndDate)}` : ""}`}
                        color="gold"
                      />
                    )}
                    {user.emailVerified && <StatusBadge label="Email verificado" color="sky" />}
                    {user.referralCode && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-border bg-white/[0.03] text-zinc-500">
                        Ref: {user.referralCode}
                      </span>
                    )}
                    {user.referredBy && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono border border-border bg-white/[0.03] text-zinc-500">
                        Indicado por: {user.referredBy}
                      </span>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-zinc-600">
                    <span>Membro desde {fmtDate(user.createdAt)} ({user.createdAgo})</span>
                    {user.lastSeen && <span>Visto: {user.lastSeenAgo || fmtDateTime(user.lastSeen)}</span>}
                    <span>ID: <span className="font-mono text-[10px] text-zinc-500">{user.id}</span></span>
                  </div>
                </>
              )}
            </div>

            {/* Action buttons */}
            {!editing && (
              <div className="flex flex-wrap gap-2 shrink-0 sm:flex-col sm:items-end">
                <button
                  onClick={handleBanToggle}
                  disabled={actionLoading === "ban"}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:opacity-80 disabled:opacity-50 ${
                    user.isBanned
                      ? "border-green-500/30 bg-green-500/10 text-green-400"
                      : "border-red-500/30 bg-red-500/10 text-red-400"
                  }`}
                >
                  {actionLoading === "ban" ? "..." : user.isBanned ? "Desbanir" : "Banir"}
                </button>

                <button
                  onClick={handleVerifyToggle}
                  disabled={actionLoading === "verify"}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:opacity-80 disabled:opacity-50 ${
                    user.verified
                      ? "border-zinc-500/30 bg-zinc-500/10 text-zinc-400"
                      : "border-green-500/30 bg-green-500/10 text-green-400"
                  }`}
                >
                  {actionLoading === "verify" ? "..." : user.verified ? "Desverificar" : "Verificar"}
                </button>

                <button
                  onClick={handleAdjustCredits}
                  disabled={actionLoading === "credits"}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:opacity-80 disabled:opacity-50 border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                >
                  {actionLoading === "credits" ? "..." : "Ajustar creditos"}
                </button>

                <button
                  onClick={startEditing}
                  disabled={actionLoading === "edit"}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:opacity-80 disabled:opacity-50 border-sky-400/30 bg-sky-400/10 text-sky-400"
                >
                  {actionLoading === "edit" ? "..." : "Editar usuario"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats Grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        {STAT_CARDS.map((s) => (
          <div
            key={s.label}
            className="glass-card !p-3 sm:!p-4 cursor-default hover:-translate-y-0.5"
          >
            <div className="text-lg mb-1.5">{s.emoji}</div>
            <div className="text-[11px] mb-1 truncate text-zinc-500">{s.label}</div>
            <div className="text-base sm:text-lg font-black text-white truncate">{s.value}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────── */}
      <div className="mb-6 overflow-x-auto pb-1 -mx-1 px-1 hide-scrollbar">
        <div className="flex gap-1.5 min-w-max">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium border transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border text-text-muted hover:border-primary/20 hover:text-white"
                }`}
              >
                <span className="mr-1.5">{tab.emoji}</span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Tab Content ─────────────────────────────────────────────── */}
      <div className="min-h-[200px]">
        {renderActiveTab()}
      </div>
    </div>
  );
}
