"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;
const ROLE_FILTERS = [
    { key: "all", label: "Todos" },
    { key: "provider", label: "Massagistas" },
    { key: "user", label: "Clientes" },
    { key: "admin", label: "Admin" },
];

function timeAgo(dateStr) {
    if (!dateStr) return "—";
    const s = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
    if (s < 60) return "agora";
    if (s < 3600) return `${Math.floor(s / 60)}min`;
    if (s < 86400) return `${Math.floor(s / 3600)}h`;
    if (s < 2592000) return `${Math.floor(s / 86400)}d`;
    return new Date(dateStr).toLocaleDateString("pt-BR");
}

function RoleBadge({ role }) {
    const map = {
        provider: "border-primary/30 bg-primary/10 text-primary",
        user: "border-sky-400/30 bg-sky-400/10 text-sky-400",
        admin: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    };
    const labels = { provider: "Massagista", user: "Cliente", admin: "Admin" };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${map[role] || map.user}`}>
            {labels[role] || "Cliente"}
        </span>
    );
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [role, setRole] = useState("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const debounceRef = useRef(null);
    const abortRef = useRef(null);

    const fetchUsers = useCallback(async (r, p) => {
        abortRef.current?.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p, limit: PAGE_SIZE });
            if (r !== "all") params.set("role", r);
            const res = await fetch(`/api/admin/users?${params}`, { signal: ctrl.signal });
            const json = await res.json();
            if (json.success) {
                let data = json.data || [];
                setTotal(json.metadata?.pagination?.total || data.length);
                setTotalPages(json.metadata?.pagination?.pages || 1);
                setUsers(data);
            }
        } catch (e) {
            if (e.name !== "AbortError") console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(role, page); }, [role, page, fetchUsers]);

    const filteredUsers = search
        ? users.filter(u => (u.name || "").toLowerCase().includes(search.toLowerCase()) || (u.email || "").toLowerCase().includes(search.toLowerCase()))
        : users;

    const handleSearch = (val) => {
        setSearch(val);
    };

    const handleBan = async (userId, ban) => {
        if (!confirm(ban ? "Banir este usuario?" : "Desbanir este usuario?")) return;
        await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, action: "ban", value: ban }),
        });
        fetchUsers(role, page);
    };

    return (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Usuarios</h1>
                    <p className="text-sm mt-1 text-text-muted">{total} cadastrados</p>
                </div>
                <button
                    onClick={() => fetchUsers(role, page)}
                    className="btn-secondary text-sm self-start flex items-center gap-2"
                >
                    🔄 Atualizar
                </button>
            </div>

            {/* Search + Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="text"
                    placeholder="Buscar por nome ou email..."
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="input-field sm:w-80"
                />
                <div className="flex gap-2 flex-wrap">
                    {ROLE_FILTERS.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => { setRole(f.key); setPage(1); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                                role === f.key
                                    ? "border-primary/40 bg-primary/10 text-primary"
                                    : "border-border text-text-muted hover:border-primary/20 hover:text-white"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="glass-card p-4 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-white/5" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-40 rounded bg-white/5" />
                                    <div className="h-3 w-60 rounded bg-white/5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Users List */}
            {!loading && (
                <>
                    {/* Desktop Table */}
                    <div className="hidden sm:block glass-card !p-0 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Usuario</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-text-muted">Role</th>
                                    <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">Verificado</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-text-muted">Creditos</th>
                                    <th className="text-right px-5 py-3 text-xs font-medium text-text-muted">Cadastro</th>
                                    <th className="text-center px-5 py-3 text-xs font-medium text-text-muted">Acoes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        className={`border-b border-border/50 transition-colors hover:bg-white/[0.03] ${user.isBanned ? "bg-red-500/[0.04]" : ""}`}
                                    >
                                        <td className="px-5 py-3">
                                            <Link href={`/admin/users/${user.id}`} className="flex items-center gap-3 group">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                                                    {(user.name || "?")[0].toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-semibold truncate text-white group-hover:text-primary transition-colors">
                                                        {user.name || "Sem nome"}
                                                        {user.isBanned && <span className="ml-2 text-xs text-red-400">🚫 Banido</span>}
                                                    </div>
                                                    <div className="text-xs truncate text-text-muted">{user.email}</div>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-5 py-3"><RoleBadge role={user.role} /></td>
                                        <td className="px-5 py-3 text-center">
                                            {user.verified
                                                ? <span className="text-green-400 font-bold">✓</span>
                                                : <span className="text-text-muted/30">✕</span>
                                            }
                                        </td>
                                        <td className="px-5 py-3 text-right font-mono text-text-muted">
                                            ${Number(user.credits || 0).toLocaleString()}
                                        </td>
                                        <td className="px-5 py-3 text-right text-xs text-text-muted">
                                            {timeAgo(user.createdAt)}
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <Link
                                                    href={`/admin/users/${user.id}`}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all"
                                                    title="Ver detalhes"
                                                >
                                                    👁
                                                </Link>
                                                <button
                                                    onClick={() => handleBan(user.id, !user.isBanned)}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                                        user.isBanned
                                                            ? "text-green-400 hover:bg-green-500/10"
                                                            : "text-red-400 hover:bg-red-500/10"
                                                    }`}
                                                    title={user.isBanned ? "Desbanir" : "Banir"}
                                                >
                                                    {user.isBanned ? "🔓" : "🔒"}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden space-y-3">
                        {filteredUsers.map((user) => (
                            <Link
                                key={user.id}
                                href={`/admin/users/${user.id}`}
                                className={`glass-card p-4 flex items-center gap-3 ${user.isBanned ? "border-red-500/20 bg-red-500/[0.03]" : ""}`}
                            >
                                <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 text-primary">
                                    {(user.name || "?")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-bold truncate text-white">{user.name || "Sem nome"}</span>
                                        <RoleBadge role={user.role} />
                                    </div>
                                    <div className="text-xs truncate text-text-muted">{user.email}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-text-muted font-mono">${Number(user.credits || 0)}</span>
                                        {user.verified && <span className="text-xs text-green-400">✓ Verificado</span>}
                                        {user.isBanned && <span className="text-xs text-red-400">🚫 Banido</span>}
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>
                        ))}
                    </div>

                    {/* Empty */}
                    {filteredUsers.length === 0 && (
                        <div className="glass-card p-12 text-center">
                            <p className="text-2xl mb-2">👥</p>
                            <p className="text-white font-bold">Nenhum usuario encontrado</p>
                            <p className="text-sm text-text-muted mt-1">Ajuste a busca ou filtros</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page <= 1}
                                className="btn-secondary text-sm disabled:opacity-30"
                            >
                                &larr; Anterior
                            </button>
                            <span className="text-sm text-text-muted">
                                Pagina <span className="text-white font-bold">{page}</span> de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page >= totalPages}
                                className="btn-secondary text-sm disabled:opacity-30"
                            >
                                Proxima &rarr;
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
