import React, { useState, useMemo } from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { StockData, ForecastResult } from '../types';
import { generateForecast, NIFTY_COMPANIES } from '../utils/dataUtils';
import { CheckSquare, Square, TrendingUp } from 'lucide-react';

interface ComparativeAnalysisProps {
    data: StockData[];
}

export const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({ data }) => {
    // Default selection
    const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['RELIANCE', 'TCS', 'HDFCBANK']);

    const toggleSymbol = (sym: string) => {
        if (selectedSymbols.includes(sym)) {
            setSelectedSymbols(selectedSymbols.filter(s => s !== sym));
        } else {
            if (selectedSymbols.length < 5) {
                setSelectedSymbols([...selectedSymbols, sym]);
            }
        }
    };

    const comparisons: ForecastResult[] = useMemo(() => {
        return selectedSymbols.map(sym => generateForecast(data, sym)).filter(Boolean) as ForecastResult[];
    }, [data, selectedSymbols]);

    const chartData = comparisons.map(c => ({
        symbol: c.symbol,
        growth: c.growthPercent,
        current: c.currentPrice,
        predicted: c.predictedPrice
    }));

    // Find best
    const bestPick = [...comparisons].sort((a,b) => b.growthPercent - a.growthPercent)[0];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                
                {/* Selector Sidebar */}
                <div className="lg:col-span-1 bg-slate-800 p-4 rounded-xl border border-slate-700 h-[600px] overflow-hidden flex flex-col">
                    <h3 className="font-bold text-slate-100 mb-2">Select Companies</h3>
                    <p className="text-xs text-slate-500 mb-4">Choose up to 5 for comparison</p>
                    <div className="flex-1 overflow-y-auto space-y-1 pr-2">
                        {NIFTY_COMPANIES.map(c => (
                            <button 
                                key={c.symbol}
                                onClick={() => toggleSymbol(c.symbol)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded text-xs transition-colors ${selectedSymbols.includes(c.symbol) ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' : 'text-slate-400 hover:bg-slate-700/50'}`}
                            >
                                {selectedSymbols.includes(c.symbol) ? <CheckSquare size={14} /> : <Square size={14} />}
                                <span className="truncate">{c.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Comparison Area */}
                <div className="lg:col-span-3 space-y-6">
                    
                    {/* Insight Banner */}
                    {bestPick && (
                        <div className="bg-gradient-to-r from-green-900/40 to-slate-800 border border-green-500/30 p-6 rounded-xl flex items-center justify-between">
                            <div>
                                <h4 className="text-green-400 font-bold flex items-center gap-2 mb-1">
                                    <TrendingUp size={20} /> Best Short-Term Opportunity
                                </h4>
                                <p className="text-slate-300 text-sm">
                                    Based on the 7-day forecast model, <strong className="text-white">{bestPick.symbol}</strong> shows the highest potential upside.
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white">+{bestPick.growthPercent.toFixed(2)}%</div>
                                <div className="text-xs text-slate-400">Proj. Return</div>
                            </div>
                        </div>
                    )}

                    {/* Comparison Chart */}
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-[300px]">
                        <h3 className="font-bold text-slate-100 mb-4">Predicted 7-Day Growth (%)</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                                <XAxis type="number" stroke="#94a3b8" tickFormatter={(v) => `${v}%`} />
                                <YAxis dataKey="symbol" type="category" stroke="#94a3b8" width={80} tick={{ fontSize: 11 }} />
                                <Tooltip 
                                    cursor={{fill: '#334155', opacity: 0.2}}
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                                />
                                <Bar dataKey="growth" radius={[0, 4, 4, 0]} barSize={30}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.growth > 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Data Table */}
                    <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 text-xs text-slate-400 uppercase">
                                <tr>
                                    <th className="p-4">Symbol</th>
                                    <th className="p-4 text-right">Current Price</th>
                                    <th className="p-4 text-right">Target (7D)</th>
                                    <th className="p-4 text-right">Potential</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm divide-y divide-slate-700">
                                {comparisons.map(c => (
                                    <tr key={c.symbol} className="hover:bg-slate-700/20">
                                        <td className="p-4 font-bold text-white">{c.symbol}</td>
                                        <td className="p-4 text-right font-mono text-slate-300">₹{c.currentPrice.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono text-purple-300">₹{c.predictedPrice.toFixed(2)}</td>
                                        <td className={`p-4 text-right font-bold ${c.growthPercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {c.growthPercent > 0 ? '+' : ''}{c.growthPercent.toFixed(2)}%
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded ${
                                                c.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                                                c.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                                                'bg-yellow-500/20 text-yellow-400'
                                            }`}>
                                                {c.recommendation}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    );
};