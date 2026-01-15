import React from 'react';
import { IconType } from '@tabler/icons-react';

interface StatsCardProps {
    label: string;
    value: number | string;
    icon: IconType;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    onClick?: () => void;
    colorClass?: string; // e.g. "text-blue-500"
}

export default function StatsCard({
    label,
    value,
    icon: Icon,
    trend,
    onClick,
    colorClass = "text-white"
}: StatsCardProps) {
    return (
        <div
            onClick={onClick}
            className={`group p-5 rounded-xl border border-gray-800 bg-[#0f0f0f] transition-all duration-200 ${onClick ? 'cursor-pointer hover:border-gray-700 hover:bg-[#151515]' : ''
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg bg-white/5 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                </div>

                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full bg-white/5 ${trend.isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                        <span>{trend.isPositive ? '+' : ''}{trend.value}%</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-2xl font-bold text-white tracking-tight mb-1">
                    {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                    {label}
                </p>
            </div>
        </div>
    );
}
