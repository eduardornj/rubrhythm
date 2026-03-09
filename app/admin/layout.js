import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";

const NAV = [
    { icon: "🏠", label: "Dashboard", href: "/admin" },
    { icon: "💰", label: "Financeiro", href: "/admin/financeiro" },
    { icon: "✅", label: "Verificações", href: "/admin/verificacao", badge: "pendente" },
    { icon: "👥", label: "Usuários", href: "/admin/users" },
    { icon: "📋", label: "Anúncios", href: "/admin/listings" },
    { icon: "⭐", label: "Reviews", href: "/admin/reviews" },
    { icon: "📣", label: "Comunicação", href: "/admin/comunicacao" },
    { icon: "🪙", label: "Créditos", href: "/admin/creditos" },
    { icon: "💬", label: "Chats", href: "/admin/chats" },
    { icon: "🤝", label: "Escrow", href: "/admin/escrow" },
    { icon: "📊", label: "Relatórios", href: "/admin/relatorios" },
];

export default async function AdminLayout({ children }) {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") redirect("/login");

    const pendingVerificationsCount = await prisma.verificationrequest.count({
        where: { status: "pending" }
    });

    return (
        <div className="min-h-screen flex" style={{ background: "#08080d" }}>

            {/* ── Sidebar ─────────────────────────────────────────────────── */}
            <aside className="w-56 flex-shrink-0 border-r border-white/6 flex flex-col sticky top-0 h-screen overflow-y-auto"
                style={{ background: "#0d0d15" }}>

                {/* Logo area */}
                <div className="px-4 py-5 border-b border-white/6">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                            style={{ background: "linear-gradient(135deg, #e8459a, #9333ea)" }}>
                            A
                        </div>
                        <div>
                            <p className="text-white font-black text-sm leading-none">Admin</p>
                            <p className="text-white/30 text-[10px] mt-0.5">RubRhythm</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 py-3 space-y-0.5">
                    {NAV.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/6 transition-all text-sm group ${item.href === "/admin/verificacao" && pendingVerificationsCount > 0 ? "text-yellow-500" : ""}`}
                        >
                            <div className="flex items-center gap-2.5">
                                <span className="text-base w-5 text-center flex-shrink-0">{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            {item.badge === "pendente" && pendingVerificationsCount > 0 && (
                                <span className="bg-yellow-500/20 text-yellow-500 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                    {pendingVerificationsCount}
                                </span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-white/6">
                    <p className="text-white/30 text-[10px] truncate mb-2">{session.user.email}</p>
                    <Link href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 text-xs transition-colors">
                        <span>←</span> Ver site
                    </Link>
                </div>
            </aside>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col">
                {/* Top bar */}
                <header className="border-b border-white/6 px-6 py-3 flex items-center justify-between sticky top-0 z-30"
                    style={{ background: "#08080d" }}>
                    <div className="text-white/40 text-xs">
                        Painel Admin — <span className="text-white/60">RubRhythm</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {pendingVerificationsCount > 0 && (
                            <Link href="/admin/verificacao"
                                className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full hover:bg-yellow-500/20 transition-all font-medium">
                                ⏳ {pendingVerificationsCount} verificações pendentes
                            </Link>
                        )}
                    </div>
                </header>

                {/* Page */}
                <main className="flex-1 p-6 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
