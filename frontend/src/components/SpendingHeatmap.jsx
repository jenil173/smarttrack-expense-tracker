import React from 'react';
import { formatCurrency } from '../utils/currencyFormatter';

const SpendingHeatmap = ({ data }) => {
    const days = 30;
    const heatmapDays = Array.from({ length: days }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        const dayData = data?.[dateStr] || 0;
        return {
            date: dateStr,
            total: typeof dayData === 'number' ? dayData : dayData.total || 0,
            count: dayData.count || (dayData.total > 0 ? 1 : 0),
            displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        };
    });

    const getColor = (amount) => {
        if (amount === 0) return 'bg-gray-100';
        if (amount < 1000) return 'bg-primary/20';
        if (amount < 3000) return 'bg-primary/40';
        if (amount < 7000) return 'bg-primary/60';
        if (amount < 15000) return 'bg-primary/80';
        return 'bg-primary';
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2">
                {heatmapDays.map((day, i) => (
                    <div
                        key={i}
                        className={`h-6 w-6 sm:h-8 sm:w-8 rounded-md ${getColor(day.total)} border border-white/10 transition-all hover:scale-110 cursor-help relative group`}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                            <div className="bg-gray-900/95 backdrop-blur-md text-white text-[10px] rounded-lg py-1.5 px-3 whitespace-nowrap shadow-2xl border border-white/10">
                                <p className="font-bold opacity-70 mb-1">{day.displayDate}</p>
                                <p className="text-sm">{formatCurrency(day.total)}</p>
                            </div>
                            <div className="w-2 h-2 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1"></div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-6 pt-4 border-t border-gray-50">
                <span>30 Days Ago</span>
                <div className="flex items-center space-x-1.5">
                    <span className="mr-1">Less</span>
                    <div className="h-2 w-2 rounded-sm bg-gray-100"></div>
                    <div className="h-2 w-2 rounded-sm bg-primary/20"></div>
                    <div className="h-2 w-2 rounded-sm bg-primary/40"></div>
                    <div className="h-2 w-2 rounded-sm bg-primary/60"></div>
                    <div className="h-2 w-2 rounded-sm bg-primary/80"></div>
                    <div className="h-2 w-2 rounded-sm bg-primary"></div>
                    <span className="ml-1">More</span>
                </div>
                <span>Today</span>
            </div>
        </div>
    );
};

export default SpendingHeatmap;
