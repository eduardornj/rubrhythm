"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminMobileNav({ nav, email, pendingCount }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14 glass border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20">
            R
          </div>
          <span className="text-white font-bold text-sm">Admin</span>
        </div>

        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <Link
              href="/admin/verificacao"
              className="text-[11px] font-black text-white px-2.5 py-1 rounded-full min-w-[22px] text-center leading-none bg-primary animate-glow"
            >
              {pendingCount}
            </Link>
          )}
          <button
            onClick={() => setOpen(true)}
            className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-lg transition-colors duration-150 bg-white/[0.06]"
            aria-label="Abrir menu"
          >
            <span className="block w-4 h-[1.5px] rounded-full bg-white" />
            <span className="block w-4 h-[1.5px] rounded-full bg-white" />
            <span className="block w-3 h-[1.5px] rounded-full bg-white" />
          </button>
        </div>
      </header>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Bottom Sheet Drawer */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl flex flex-col glass border-t border-border"
        style={{
          maxHeight: "80vh",
          transform: open ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
          willChange: "transform",
        }}
      >
        {/* Pull Handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/15" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm bg-gradient-to-br from-primary to-accent">
              R
            </div>
            <div>
              <span className="text-white font-bold text-sm">RubRhythm</span>
              <p className="text-[10px] tracking-widest uppercase text-text-muted/50">Admin</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.06]"
            aria-label="Fechar menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        <div className="mx-5 border-b border-border" />

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5 hide-scrollbar">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-all text-text-muted active:bg-white/[0.08] hover:text-white"
            >
              <span className="text-base w-6 text-center">{item.emoji}</span>
              <span>{item.label}</span>
              {item.badge && pendingCount > 0 && (
                <span className="ml-auto text-[11px] font-black text-white px-2 py-0.5 rounded-full min-w-[20px] text-center leading-none bg-primary">
                  {pendingCount}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 shrink-0 border-t border-border">
          <p className="text-[11px] truncate text-text-muted/50">{email}</p>
        </div>
      </div>
    </div>
  );
}
