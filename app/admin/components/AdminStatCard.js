import Link from "next/link";
import { HiOutlineArrowTrendingUp, HiOutlineArrowTrendingDown } from "react-icons/hi2";

export default function AdminStatCard({
    icon,
    label,
    value,
    href,
    alert = false,
    trend = null,     // +12, -5, etc.
    trendLabel = null // "vs último mês"
}) {
    const isPositive = trend && trend > 0;
    const isNegative = trend && trend < 0;

    return (
        <Link
            href={href}
            className={`glass-card p-6 relative overflow-hidden group transition-all duration-300 block 
        ${alert && value > 0
                    ? "border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)] hover:bg-red-500/15"
                    : "hover:border-primary/50 hover:bg-white/5"}
      `}
        >
            {/* Decorative Glow */}
            <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-40 
        ${alert && value > 0 ? "bg-red-500" : "bg-primary"}
      `} />

            <div className="flex items-start justify-between relative z-10">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl 
          ${alert && value > 0
                        ? "bg-red-500/20 text-red-500 border border-red-500/30"
                        : "bg-white/5 text-white/80 border border-white/10 group-hover:bg-primary/20 group-hover:text-primary group-hover:border-primary/30 transition-colors"}
        `}>
                    {icon}
                </div>

                {/* Alert Badge */}
                {alert && value > 0 && (
                    <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/50 text-red-400 text-[10px] uppercase font-black px-2.5 py-1 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping absolute" />
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 relative" />
                        Urgente
                    </div>
                )}
            </div>

            <div className="mt-4 relative z-10">
                <h3 className="text-4xl font-black text-white tracking-tight drop-shadow-md">
                    {value}
                </h3>
                <p className="text-text-muted text-sm font-medium mt-1">
                    {label}
                </p>
            </div>

            {/* Trend Indicator */}
            {trend !== null && (
                <div className="mt-4 flex items-center gap-2 relative z-10">
                    <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md 
            ${isPositive ? "bg-emerald-500/10 text-emerald-400" : ""}
            ${isNegative ? "bg-red-500/10 text-red-400" : ""}
            ${!isPositive && !isNegative ? "bg-white/5 text-text-muted" : ""}
          `}>
                        {isPositive && <HiOutlineArrowTrendingUp />}
                        {isNegative && <HiOutlineArrowTrendingDown />}
                        <span>{trend > 0 ? "+" : ""}{trend}%</span>
                    </div>
                    {trendLabel && <span className="text-xs text-text-muted">{trendLabel}</span>}
                </div>
            )}
        </Link>
    );
}
