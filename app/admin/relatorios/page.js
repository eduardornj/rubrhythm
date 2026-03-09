"use client";
import { useState } from "react";

function Section({ title, desc, icon, onExport, loading }) {
    return (
        <div className="bg-white/2 border border-white/6 rounded-2xl p-5 flex items-start justify-between gap-4">
            <div>
                <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-2xl">{icon}</span>
                    <h3 className="text-white font-bold">{title}</h3>
                </div>
                <p className="text-white/40 text-sm">{desc}</p>
            </div>
            <button onClick={onExport} disabled={loading}
                className="flex-shrink-0 px-4 py-2.5 rounded-xl bg-primary/15 border border-primary/30 text-primary font-bold text-sm hover:bg-primary/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                {loading ? "Gerando..." : "⬇ Exportar CSV"}
            </button>
        </div>
    );
}

const csvDownload = (rows, filename) => {
    const csv = rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const header = Object.keys(rows[0]).join(",");
    const blob = new Blob([header + "\n" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
};

export default function RelatoriosPage() {
    const [loading, setLoading] = useState({});

    const setLoad = (key, val) => setLoading(prev => ({ ...prev, [key]: val }));

    const exportUsers = async () => {
        setLoad("users", true);
        const res = await fetch("/api/admin/users");
        const json = await res.json();
        const users = json.data || [];
        const rows = users.map(u => ({
            id: u.id, nome: u.name || "", email: u.email || "",
            perfil: u.role, verificado: u.verified ? "Sim" : "Não",
            banido: u.isBanned ? "Sim" : "Não", creditos: Math.round(u.credits || 0),
            cadastro: u.createdAt ? new Date(u.createdAt).toLocaleDateString("pt-BR") : "",
        }));
        csvDownload(rows, `rubrhythm_usuarios_${Date.now()}.csv`);
        setLoad("users", false);
    };

    const exportVerifications = async () => {
        setLoad("verif", true);
        const res = await fetch("/api/admin/verifications");
        const json2 = await res.json();
        const verifications = json2.data?.verifications || [];
        const rows = verifications.map(v => ({
            id: v.id, usuario: v.userName, email: v.userEmail, status: v.status,
            enviado: v.submittedAt ? new Date(v.submittedAt).toLocaleDateString("pt-BR") : "",
            revisado: v.reviewedAt ? new Date(v.reviewedAt).toLocaleDateString("pt-BR") : "",
            notas: v.notes || "",
        }));
        csvDownload(rows, `rubrhythm_verificacoes_${Date.now()}.csv`);
        setLoad("verif", false);
    };

    const exportListings = async () => {
        setLoad("listings", true);
        const res = await fetch("/api/admin/listings?limit=500");
        const json3 = await res.json();
        const listings = json3.data?.listings || [];
        const rows = listings.map(l => ({
            id: l.id, titulo: l.title, cidade: l.city, estado: l.state,
            aprovado: l.isApproved ? "Sim" : "Não", ativo: l.isActive ? "Sim" : "Não",
            destaque: l.isFeatured ? "Sim" : "Não",
            usuario: l.user?.email || "", criado: new Date(l.createdAt).toLocaleDateString("pt-BR"),
        }));
        csvDownload(rows, `rubrhythm_anuncios_${Date.now()}.csv`);
        setLoad("listings", false);
    };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-xl font-black text-white">📊 Relatórios e Exportação</h1>
                <p className="text-white/40 text-sm mt-0.5">Exporte dados do sistema em formato CSV</p>
            </div>

            <div className="space-y-3">
                <Section
                    icon="👥" title="Exportar Usuários" loading={loading.users} onExport={exportUsers}
                    desc="Todos os usuários com nome, email, perfil, créditos, verificado, banido e data de cadastro."
                />
                <Section
                    icon="✅" title="Exportar Verificações" loading={loading.verif} onExport={exportVerifications}
                    desc="Histórico completo de verificações com status, data de envio e notas do revisor."
                />
                <Section
                    icon="📋" title="Exportar Anúncios" loading={loading.listings} onExport={exportListings}
                    desc="Todos os anúncios com título, cidade, estado, aprovação, destaque e proprietário."
                />
            </div>

            <div className="bg-amber-500/5 border border-amber-500/15 rounded-2xl p-4 text-amber-400/60 text-sm">
                ⚠️ Os arquivos CSV são gerados no seu navegador a partir dos dados atuais do banco. Dados sensíveis foram omitidos (senhas, IPs).
            </div>
        </div>
    );
}
