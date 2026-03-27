import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    BarElement,
    Filler
} from 'chart.js';
import { Doughnut, Line, Bar } from 'react-chartjs-2';
import { formatCurrency } from '../utils/currencyFormatter';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    Filler
);

export const ExpenseDoughnutChart = ({ categoryData }) => {
    if (!categoryData || Object.keys(categoryData).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <span className="text-2xl mb-2">📊</span>
                <p className="text-sm font-medium">No financial data available yet</p>
                <p className="text-xs">Add some expenses to see the breakdown</p>
            </div>
        );
    }

    const data = {
        labels: Object.keys(categoryData),
        datasets: [
            {
                data: Object.values(categoryData),
                backgroundColor: [
                    '#EF4444', // Red
                    '#3B82F6', // Blue
                    '#F59E0B', // Yellow
                    '#10B981', // Green
                    '#8B5CF6', // Purple
                    '#EC4899', // Pink
                    '#6366F1', // Indigo
                    '#64748B', // Gray
                ],
                borderWidth: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: "'Inter', sans-serif"
                    }
                }
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        let label = context.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed !== null) {
                            label += formatCurrency(context.parsed);
                        }
                        return label;
                    }
                }
            }
        },
        cutout: '75%'
    };

    return (
        <div className="h-64 w-full">
            <Doughnut data={data} options={options} />
        </div>
    );
};

export const TrendLineChart = ({ monthlyData }) => {
    if (!monthlyData || monthlyData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-72 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <span className="text-2xl mb-2">📈</span>
                <p className="text-sm font-medium">No financial data available yet</p>
                <p className="text-xs">Graphs will appear once you have multi-month history</p>
            </div>
        );
    }

    const data = {
        labels: monthlyData.map(d => d.month),
        datasets: [
            {
                label: 'Income',
                data: monthlyData.map(d => d.income),
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#10B981',
                borderWidth: 2,
            },
            {
                label: 'Expense',
                data: monthlyData.map(d => d.expense),
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#EF4444',
                borderWidth: 2,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                align: 'end',
                labels: {
                    usePointStyle: true,
                    boxWidth: 8,
                    font: {
                        family: "'Inter', sans-serif",
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#111827',
                bodyColor: '#4B5563',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += formatCurrency(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: true,
                    color: '#f3f4f6',
                    drawTicks: false
                },
                border: { display: false },
                ticks: {
                    font: { size: 10 },
                    callback: (value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`
                }
            },
            x: {
                grid: {
                    display: false
                },
                border: { display: false },
                ticks: {
                    font: { size: 10 },
                    maxRotation: 45,
                    minRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 15
                }
            }
        },
        interaction: {
            mode: 'index',
            intersect: false,
        },
    };

    return (
        <div className="h-72 w-full">
            <Line data={data} options={options} />
        </div>
    );
};

export const MoodCategoryBarChart = ({ moodData }) => {
    if (!moodData || Object.keys(moodData).length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
                <span className="text-2xl mb-2">🧠</span>
                <p className="text-sm font-medium">No mood insights yet</p>
            </div>
        );
    }

    const data = {
        labels: ['Happy', 'Neutral', 'Stressed'],
        datasets: [
            {
                label: 'Total Expenses',
                data: [moodData.Happy || 0, moodData.Neutral || 0, moodData.Stressed || 0],
                backgroundColor: [
                    '#10B981', // Happy - Green
                    '#6366F1', // Neutral - Indigo
                    '#EF4444', // Stressed - Red
                ],
                borderRadius: 8,
                barThickness: 40
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `Total: ${formatCurrency(context.parsed.y)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' },
                ticks: {
                    callback: (value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`
                }
            },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="h-64 w-full">
            <Bar data={data} options={options} />
        </div>
    );
};
