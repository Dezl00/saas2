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
    <div className={`rounded-[24px] p-6 border transition-colors ${cardClasses}`}>
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconClasses}`}
        >
          <Icon className="w-6 h-6" />
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
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className={`text-sm font-semibold ${labelClasses}`}>{title}</p>
      </div>
    </div>
  );
}
