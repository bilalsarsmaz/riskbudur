import React from 'react';
import { IconType } from '@tabler/icons-react';

interface ModernStatsCardProps {
    label: string;
    value: number | string;
    icon: IconType;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    gradient: string;
    onClick?: () => void;
}

export default function ModernStatsCard({
    label,
    value,
    icon: Icon,
    trend,
    gradient,
    onClick
}: ModernStatsCardProps) {
    return (
        <div
            onClick={onClick}
            className={`group relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300 ${onClick ? 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl' : ''
                }`}
            style={{
                backgroundColor: 'var(--app-surface)',
                borderColor: 'var(--app-border)',
            }}
        >
            {/* Gradient Background */}
            <div
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-300"
                style={{ background: gradient }}
            />

            {/* Content */}
            <div className="relative p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--app-subtitle)' }}>
                            {label}
                        </p>
                        <h3 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--app-body-text)' }}>
                            {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
                        </h3>

                        {/* Trend Indicator */}
                        {trend && (
                            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend.isPositive ? 'text-green-500' : 'text-red-500'
                                }`}>
                                <span>{trend.isPositive ? '↑' : '↓'}</span>
                                <span>{Math.abs(trend.value)}%</span>
                                <span className="text-xs" style={{ color: 'var(--app-subtitle)' }}>vs last month</span>
                            </div>
                        )}
                    </div>

                    {/* Icon with Gradient */}
                    <div
                        className="relative p-4 rounded-xl group-hover:scale-110 transition-transform duration-300"
                        style={{ background: gradient }}
                    >
                        <Icon className="w-7 h-7 text-white" />
                        {/* Glow Effect */}
                        <div
                            className="absolute inset-0 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                            style={{ background: gradient }}
                        />
                    </div>
                </div>

                {/* Bottom Accent Line */}
                <div className="h-1 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--app-border)' }}>
                    <div
                        className="h-full transition-all duration-500 group-hover:w-full"
                        style={{ background: gradient, width: '60%' }}
                    />
                </div>
            </div>

            {/* Hover Shimmer Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
        </div>
    );
}
