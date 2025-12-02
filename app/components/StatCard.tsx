import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: string;
    trendLabel?: string;
    color?: 'cyan' | 'blue' | 'orange' | 'purple' | 'gray';
    variant?: 'default' | 'solid';
}

export function StatCard({ title, value, icon: Icon, description, trend, trendLabel, color = 'cyan', variant = 'default' }: StatCardProps) {
    const colorClasses = {
        cyan: {
            default: 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] dark:bg-[var(--color-brand-cyan)]/20',
            solid: 'bg-gradient-to-br from-[var(--color-brand-cyan)] to-[#009ec9] text-white'
        },
        blue: {
            default: 'bg-[var(--color-brand-dark-blue)]/10 text-[var(--color-brand-dark-blue)] dark:bg-[var(--color-brand-dark-blue)]/20',
            solid: 'bg-gradient-to-br from-[var(--color-brand-dark-blue)] to-[#00506b] text-white'
        },
        orange: {
            default: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
            solid: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
        },
        purple: {
            default: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
            solid: 'bg-gradient-to-br from-purple-400 to-purple-600 text-white'
        },
        gray: {
            default: 'bg-gray-50 text-gray-600 dark:bg-gray-900/20 dark:text-gray-400',
            solid: 'bg-gradient-to-br from-gray-500 to-gray-700 text-white'
        },
    };

    const isSolid = variant === 'solid';
    const currentColors = colorClasses[color] || colorClasses.cyan;
    const containerClasses = isSolid ? currentColors.solid : 'bg-white border border-gray-100 dark:bg-zinc-900 dark:border-zinc-800';
    const iconClasses = isSolid ? 'bg-white/20 text-white' : currentColors.default;

    const isPositiveTrend = trend && (trend.startsWith('+') || parseFloat(trend) > 0);
    const isNeutralTrend = trend === '0' || trend === '+0';

    return (
        <div className={`rounded-2xl p-6 shadow-sm transition-all hover:shadow-md ${containerClasses}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium ${isSolid ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>{title}</p>
                    <p className={`mt-2 text-3xl font-bold ${isSolid ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</p>
                </div>
                <div className={`rounded-xl p-3 ${iconClasses}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
            {(description || trend) && (
                <div className="mt-4 flex items-center text-sm">
                    {trend && (
                        <span className={`font-medium ${isSolid
                            ? 'text-white'
                            : isNeutralTrend
                                ? 'text-gray-500'
                                : isPositiveTrend
                                    ? 'text-green-600 dark:text-green-400'
                                    : 'text-red-600 dark:text-red-400'
                            }`}>
                            {trend}
                        </span>
                    )}
                    {(trend && trendLabel) && (
                        <span className={`ml-2 ${isSolid ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                            {trendLabel}
                        </span>
                    )}
                    {(!trend && description) && (
                        <span className={`${isSolid ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                            {description}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
