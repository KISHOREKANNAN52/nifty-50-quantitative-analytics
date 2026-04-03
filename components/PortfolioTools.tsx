import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PortfolioItem } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

// Mock Portfolio Data
const MOCK_PORTFOLIO: PortfolioItem[] = [
    { symbol: 'RELIANCE', qty: 50, buyPrice: 2400, cmp: 2350, pnl: -2500, sector: 'Energy' },
    { symbol: 'TCS', qty: 20, buyPrice: 3200, cmp: 3600, pnl: 8000, sector: 'IT' },
    { symbol: 'HDFCBANK', qty: 100, buyPrice: 1550, cmp: 1600, pnl: 5000, sector: 'Financial Services' },
    { symbol: 'ITC', qty: 400, buyPrice: 420, cmp: 450, pnl: 12000, sector: 'Consumer Goods' },
    { symbol: 'INFY', qty: 60, buyPrice: 1600, cmp: 1450, pnl: -9000, sector: 'IT' },
    { symbol: 'TATAMOTORS', qty: 150, buyPrice: 650, cmp: 900, pnl: 37500, sector: 'Automobile' },
];

export const PortfolioTools: React.FC = () => {
    // 1. Asset Allocation Data
    const sectorAlloc = MOCK_PORTFOLIO.reduce((acc, item) => {
        acc[item.sector] = (acc[item.sector] || 0) + (item.cmp * item.qty);
        return acc;
    }, {} as Record<string, number>);
    
    const allocData = Object.entries(sectorAlloc).map(([name, value]) => ({ name, value }));

    // 2. Tax Harvesting Opportunities (Negative PnL)
    const lossHarvesting = MOCK_PORTFOLIO.filter(p => p.pnl < 0);
    const totalUnrealizedLoss = lossHarvesting.reduce((acc, p) => acc + p.pnl, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Asset Allocation */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg lg:col-span-1 h-[400px]">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Sector Allocation</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={allocData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {allocData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b' }} itemStyle={{ color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Tax Harvesting */}
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg lg:col-span-2">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-100">Tax Loss Harvesting</h3>
                            <p className="text-sm text-slate-400">Identify stocks with unrealized losses to offset gains.</p>
                        </div>
                        <div className="bg-red-500/10 border border-red-500/50 px-4 py-2 rounded">
                            <span className="text-xs text-red-400 block">Total Harvestable Loss</span>
                            <span className="text-xl font-bold text-red-500">₹{Math.abs(totalUnrealizedLoss).toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-xs text-slate-500 uppercase border-b border-slate-700">
                                    <th className="py-2">Symbol</th>
                                    <th className="py-2">Qty</th>
                                    <th className="py-2">Buy Avg</th>
                                    <th className="py-2">CMP</th>
                                    <th className="py-2">Unrealized P&L</th>
                                    <th className="py-2">Action</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-300">
                                {lossHarvesting.map(stock => (
                                    <tr key={stock.symbol} className="border-b border-slate-800 hover:bg-slate-700/50">
                                        <td className="py-3 font-medium text-white">{stock.symbol}</td>
                                        <td className="py-3">{stock.qty}</td>
                                        <td className="py-3">₹{stock.buyPrice}</td>
                                        <td className="py-3">₹{stock.cmp}</td>
                                        <td className="py-3 text-red-400 font-mono">₹{stock.pnl}</td>
                                        <td className="py-3">
                                            <button className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded">
                                                Harvest Loss
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {lossHarvesting.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-4 text-center text-slate-500">No loss-making positions found. Good job!</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Risk Profile Gauge (Simulated with Bar for now) */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                 <h3 className="text-lg font-bold text-slate-100 mb-4">Portfolio Risk Profile</h3>
                 <div className="h-4 bg-slate-700 rounded-full overflow-hidden relative">
                     <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 w-full opacity-30"></div>
                     {/* Risk Marker */}
                     <div className="absolute top-0 h-full bg-white w-1" style={{ left: '65%' }}></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-400 mt-2">
                     <span>Conservative</span>
                     <span>Moderate</span>
                     <span>Aggressive</span>
                 </div>
                 <p className="mt-4 text-sm text-slate-300">
                     Your portfolio beta is approx <strong>1.12</strong>, indicating slightly higher volatility than the benchmark NIFTY 50. 
                     Consider hedging with NIFTY Puts or diversifying into FMCG/Pharma.
                 </p>
            </div>
        </div>
    );
};
