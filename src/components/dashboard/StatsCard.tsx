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
    <div className={`rounded-[24px] p-4 sm:p-6 transition-colors ${cardClasses}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-[24px] flex items-center justify-center shrink-0 ${iconClasses}`}
        >
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        {trend && (
          <span
            className={`inline-flex px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold ${
              trend.isPositive
                ? "bg-success-100/50 text-success-700"
                : "bg-error-100/50 text-error-700"
            }`}
          >
            {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-lg sm:text-2xl font-extrabold mb-1 truncate">{value}</p>
        <p className={`text-xs sm:text-sm font-semibold truncate ${labelClasses}`}>{title}</p>
      </div>
    </div>
  );
}
