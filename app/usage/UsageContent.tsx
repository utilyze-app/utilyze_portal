'use client';

import { useState, useEffect, useRef } from 'react';
import { getDashboardData } from '@/app/actions/finance';
import { auditUtilityUsage } from '@/app/actions/ai';
import Chart from 'chart.js/auto';

type UsageType = 'GAS' | 'WATER';

interface UsageLog {
    accountId: string;
    accountType: string;
    date: Date;
    value: number;
    unit: string;
}

export default function UsageContent() {
    const [usageData, setUsageData] = useState<UsageLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentType, setCurrentType] = useState<UsageType>('GAS');
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiVisible, setAiVisible] = useState(false);
    const chartRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        loadUsageData();
    }, []);

    useEffect(() => {
        if (usageData.length > 0) {
            renderChart();
        }
        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [currentType, usageData]);

    const loadUsageData = async () => {
        setLoading(true);
        const result = await getDashboardData();
        if (result.success && result.data) {
            setUsageData(result.data.recentUsage);
        }
        setLoading(false);
    };

    const renderChart = () => {
        if (!chartRef.current) return;

        // Filter data by current type
        const filteredData = usageData.filter((log) => log.accountType === currentType);

        if (filteredData.length === 0) return;

        // Sort by date ascending
        filteredData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Prepare chart data
        const labels = filteredData.map((log) => {
            const date = new Date(log.date);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        const values = filteredData.map((log) => log.value);
        const unit = filteredData[0]?.unit || '';

        // Destroy existing chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        // Create new chart
        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        const color = currentType === 'GAS' ? '#f97316' : '#3b82f6';
        const bgColor = currentType === 'GAS' ? 'rgba(249, 115, 22, 0.8)' : 'rgba(59, 130, 246, 0.8)';

        chartInstanceRef.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: `${currentType === 'GAS' ? 'Gas' : 'Water'} Usage`,
                        data: values,
                        backgroundColor: bgColor,
                        borderColor: color,
                        borderWidth: 1,
                        borderRadius: 4,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${context.parsed.y} ${unit}`;
                            },
                        },
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#f1f5f9',
                        },
                        title: {
                            display: true,
                            text: unit,
                        },
                    },
                    x: {
                        grid: {
                            display: false,
                        },
                    },
                },
            },
        });
    };

    const handleAnalyzeTrends = async () => {
        setAiVisible(true);
        setAiLoading(true);

        const filteredData = usageData.filter((log) => log.accountType === currentType);

        if (filteredData.length === 0) {
            setAiAnalysis('No usage data available for analysis.');
            setAiLoading(false);
            return;
        }

        const result = await auditUtilityUsage(filteredData);

        if (result.success && result.analysis) {
            setAiAnalysis(result.analysis);
        } else {
            setAiAnalysis('Unable to generate analysis at this time. Please try again later.');
        }

        setAiLoading(false);
    };

    const handleCreatePlan = async () => {
        setAiVisible(true);
        setAiLoading(true);

        await new Promise((resolve) => setTimeout(resolve, 1500));

        const plans = {
            GAS: 'Based on your gas usage patterns, here\'s your action plan: 1) Set thermostat to 68°F during winter months to save up to 10% on heating costs. 2) Schedule annual furnace maintenance to improve efficiency by 5-15%. 3) Install a programmable thermostat to reduce usage during sleep and work hours. Expected savings: $15-25/month.',
            WATER: 'Based on your water usage patterns, here\'s your action plan: 1) Fix any leaking faucets - a single drip can waste 3,000 gallons/year. 2) Install low-flow showerheads to reduce usage by 25-60%. 3) Run dishwasher and washing machine only with full loads. 4) Water lawn early morning or evening to reduce evaporation. Expected savings: $10-20/month.',
        };

        setAiAnalysis(plans[currentType]);
        setAiLoading(false);
    };

    const toggleType = (type: UsageType) => {
        setCurrentType(type);
        setAiVisible(false);
    };

    const tips = {
        GAS: [
            { icon: 'fa-thermometer-half', title: 'Smart Heating', text: 'Lower thermostat by 2°F to save 5% on bills' },
            { icon: 'fa-tools', title: 'Regular Maintenance', text: 'Annual furnace tune-ups boost efficiency' },
            { icon: 'fa-clock', title: 'Programmable Settings', text: 'Reduce heat when away or sleeping' },
        ],
        WATER: [
            { icon: 'fa-shower', title: 'Shorter Showers', text: 'Cut 2 minutes to save 10 gallons per day' },
            { icon: 'fa-tint-slash', title: 'Fix Leaks', text: 'One drip wastes 3,000 gallons/year' },
            { icon: 'fa-leaf', title: 'Smart Watering', text: 'Water lawn early morning for best efficiency' },
        ],
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900 mb-4"></div>
                    <p className="text-slate-500">Loading usage data...</p>
                </div>
            </div>
        );
    }

    const filteredData = usageData.filter((log) => log.accountType === currentType);

    return (
        <div className="fade-in space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Usage Analytics</h1>

                {/* Type Toggle */}
                <div className="flex bg-slate-200 rounded-lg p-1">
                    <button
                        onClick={() => toggleType('GAS')}
                        className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center ${currentType === 'GAS'
                            ? 'bg-white text-orange-600 shadow-sm'
                            : 'text-slate-500 hover:text-orange-600'
                            }`}
                    >
                        <i className="fas fa-fire mr-2"></i> Gas (MJ)
                    </button>
                    <button
                        onClick={() => toggleType('WATER')}
                        className={`px-4 py-2 rounded text-sm font-medium transition-all flex items-center ${currentType === 'WATER'
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-slate-500 hover:text-blue-600'
                            }`}
                    >
                        <i className="fas fa-tint mr-2"></i> Water (kL)
                    </button>
                </div>
            </div>

            {/* Chart Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800">
                            {currentType === 'GAS' ? 'Gas Usage (MJ)' : 'Water Usage (kL)'}
                        </h2>
                        <p className="text-sm text-slate-500">Recent consumption history</p>
                    </div>
                    {/* AI Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreatePlan}
                            className="bg-amber-400 text-slate-900 px-3 py-1.5 rounded text-sm hover:bg-amber-500 transition-colors flex items-center font-medium"
                        >
                            <span className="mr-2">✨</span> Create Action Plan
                        </button>
                        <button
                            onClick={handleAnalyzeTrends}
                            className="bg-slate-900 text-white px-3 py-1.5 rounded text-sm hover:bg-black transition-colors flex items-center"
                        >
                            <span className="mr-2">✨</span> Analyze Trends
                        </button>
                    </div>
                </div>

                {/* AI Analysis Box */}
                {aiVisible && (
                    <div className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 relative">
                        <button
                            onClick={() => setAiVisible(false)}
                            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600"
                        >
                            ✕
                        </button>
                        {aiLoading ? (
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        ) : (
                            <div>
                                <strong>
                                    <i className="fas fa-robot mr-1"></i> Analysis:
                                </strong>{' '}
                                {aiAnalysis}
                            </div>
                        )}
                    </div>
                )}

                {/* Chart */}
                {filteredData.length > 0 ? (
                    <div className="chart-container">
                        <canvas ref={chartRef}></canvas>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500">
                        <i className="fas fa-chart-bar text-4xl mb-3 text-slate-300"></i>
                        <p>No usage data available for {currentType === 'GAS' ? 'gas' : 'water'}.</p>
                    </div>
                )}
            </div>

            {/* Tips Grid */}
            <h3 className="font-bold text-slate-800">Utilyze Efficiency Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tips[currentType].map((tip, index) => (
                    <div
                        key={index}
                        className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col items-center text-center"
                    >
                        <div
                            className={`w-12 h-12 ${currentType === 'GAS'
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-blue-100 text-blue-600'
                                } rounded-full flex items-center justify-center mb-3`}
                        >
                            <i className={`fas ${tip.icon} text-xl`}></i>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{tip.title}</h4>
                        <p className="text-xs text-slate-500">{tip.text}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
