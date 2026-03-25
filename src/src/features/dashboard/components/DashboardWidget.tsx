import Image from "next/image";
import { ReactNode } from "react";

type DashboardWidgetProps = {
  label: string;
  title: string;
  value?: string | number;
  subtitle?: string;
  icon: ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  button?: {
    text: string;
    icon?: ReactNode;
    onClick?: () => void;
  };
};

export function DashboardWidget({
  label,
  title,
  value,
  subtitle,
  icon,
  iconBgColor = "bg-blue-500/10",
  iconColor = "text-blue-500",
  button,
}: DashboardWidgetProps) {
  return (
    <div className="glass-card kpi-card-shadow p-6 rounded-2xl hover:border-slate-300 dark:hover:border-slate-600 transition-all group cursor-pointer flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <h3 className="text-lg font-bold text-charcoal dark:text-white">{title}</h3>
        </div>
        <div className={`w-10 h-10 ${iconBgColor} rounded-xl flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
      {button ? (
        <button
          onClick={button.onClick}
          className="mt-4 w-full bg-primary py-2.5 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
        >
          {button.text}
          {button.icon}
        </button>
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-charcoal dark:text-white">{value}</span>
          {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}
