import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  cardClasses: string;
  iconClasses: string;
  labelClasses: string;
}

export function StatsCard({ title, value, icon: Icon, trend, cardClasses, iconClasses, labelClasses }: StatsCardProps) {
  return (
    <div className={`rounded-[32px] p-6 lg:p-8 border-2 transition-colors ${cardClasses}`}>
      <div className="flex items-start justify-between mb-6">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${iconClasses}`}
        >
          <Icon className="w-7 h-7" />
        </div>
        {trend && (
          <span
            className={`inline-flex px-3 py-1.5 rounded-xl text-sm font-bold border-2 ${
              trend.isPositive
                ? "bg-success-50 text-success-700 border-success-200"
                : "bg-error-50 text-error-700 border-error-200"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <p className={`text-sm font-bold mb-2 ${labelClasses}`}>{title}</p>
        <p className="text-3xl lg:text-4xl font-black tracking-tight">{value}</p>
      </div>
    </div>
  );
}
