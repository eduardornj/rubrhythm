import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import AdminMobileNav from "./components/AdminMobileNav";

const NAV_ITEMS = [
  { emoji: "🏠", label: "Dashboard", href: "/admin" },
  { emoji: "💰", label: "Financeiro", href: "/admin/financeiro" },
  { emoji: "✅", label: "Verificacoes", href: "/admin/verificacao", badge: true },
  { emoji: "👥", label: "Usuarios", href: "/admin/users" },
  { emoji: "📋", label: "Anuncios", href: "/admin/listings" },
  { emoji: "⭐", label: "Reviews", href: "/admin/reviews" },
  { emoji: "📣", label: "Comunicacao", href: "/admin/comunicacao" },
  { emoji: "🪙", label: "Creditos", href: "/admin/creditos" },
  { emoji: "💬", label: "Chats", href: "/admin/chats" },
  { emoji: "🔍", label: "Content Scan", href: "/admin/content-scan" },
  { emoji: "🤝", label: "Escrow", href: "/admin/escrow" },
  { emoji: "📊", label: "Relatorios", href: "/admin/relatorios" },
];

export default async function AdminLayout({ children }) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/login");
  }

  const pendingCount = await prisma.verificationrequest.count({
    where: { status: "pending" },
  });

  const userEmail = session.user.email;

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-60 sticky top-0 h-screen shrink-0 z-30 glass border-r border-border">
        {/* Logo */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
              R
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-wide">
                RubRhythm
              </span>
              <p className="text-[10px] tracking-widest uppercase text-text-muted/50">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        <div className="mx-4 mb-3 border-b border-border" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 hide-scrollbar">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 text-text-muted hover:text-white hover:bg-white/[0.06] group"
            >
              <span className="text-base w-5 text-center">{item.emoji}</span>
              <span className="group-hover:text-white transition-colors duration-150">
                {item.label}
              </span>
              {item.badge && pendingCount > 0 && (
                <span className="ml-auto text-[11px] font-bold text-white px-2 py-0.5 rounded-full min-w-[22px] text-center leading-none bg-primary animate-glow">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 space-y-3 border-t border-border">
          <p className="text-[11px] truncate text-text-muted/50">
            {userEmail}
          </p>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs transition-colors duration-150 text-text-muted hover:text-white"
          >
            <span>&larr;</span>
            <span>Ver site</span>
          </Link>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Bar */}
        <header className="hidden md:flex items-center justify-between sticky top-0 z-20 px-6 h-14 shrink-0 glass border-b border-border">
          <h1 className="text-sm font-medium text-text-muted">
            Painel Admin
          </h1>
          {pendingCount > 0 && (
            <Link
              href="/admin/verificacao"
              className="flex items-center gap-2 text-xs font-bold text-white px-4 py-1.5 rounded-full transition-all btn-primary"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              {pendingCount} pendente{pendingCount !== 1 ? "s" : ""}
            </Link>
          )}
        </header>

        {/* Mobile Nav */}
        <AdminMobileNav
          nav={NAV_ITEMS}
          email={userEmail}
          pendingCount={pendingCount}
        />

        {/* Content */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
