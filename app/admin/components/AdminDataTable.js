"use client";

import { useState } from "react";
import { HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineSearch } from "react-icons/hi";

export default function AdminDataTable({
    title,
    subtitle,
    icon,
    columns,
    data,
    isLoading,
    pagination, // { page, pages, total }
    onPageChange,
    searchPlaceholder,
    onSearch,
    emptyStateMessage = "Nenhum registro encontrado.",
    actions // Component for top right actions (like "Export" button)
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch) onSearch(searchTerm);
    };

    return (
        <div className="glass-card overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {icon && (
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl border border-primary/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h2 className="text-lg font-black text-white">{title}</h2>
                        {subtitle && <p className="text-sm text-text-muted">{subtitle}</p>}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {onSearch && (
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder={searchPlaceholder || "Buscar..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full sm:w-64 bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-white/30"
                            />
                            <button
                                type="submit"
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                            >
                                <HiOutlineSearch className="w-4 h-4" />
                            </button>
                        </form>
                    )}
                    {actions}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/[0.02] border-b border-white/5">
                            {columns.map((col, idx) => (
                                <th key={idx} className={`py-4 px-6 text-xs font-bold text-text-muted uppercase tracking-wider ${col.className || ""}`}>
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {isLoading ? (
                            [...Array(5)].map((_, i) => (
                                <tr key={`skeleton-${i}`} className="animate-pulse">
                                    {columns.map((_, colIdx) => (
                                        <td key={colIdx} className="py-4 px-6">
                                            <div className="h-4 bg-white/5 rounded w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data && data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr key={row.id || rowIndex} className="hover:bg-white/[0.02] transition-colors group">
                                    {columns.map((col, colIdx) => (
                                        <td key={colIdx} className={`py-4 px-6 text-sm text-white/90 ${col.cellClassName || ""}`}>
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-text-muted">
                                        <span className="text-4xl mb-3 opacity-20">📭</span>
                                        <p>{emptyStateMessage}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
                <div className="p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                    <p className="text-xs text-text-muted">
                        Mostrando página <span className="text-white font-medium">{pagination.page}</span> de <span className="text-white font-medium">{pagination.pages}</span>
                        {pagination.total && ` (${pagination.total} registros)`}
                    </p>

                    <div className="flex gap-2">
                        <button
                            onClick={() => onPageChange(pagination.page - 1)}
                            disabled={pagination.page <= 1}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.page + 1)}
                            disabled={pagination.page >= pagination.pages}
                            className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-text-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <HiOutlineChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
