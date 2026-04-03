import React, { useMemo } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { StockData } from '../types';
import { calculateRollingVolatility, calculateDrawdownSeries } from '../utils/dataUtils';

interface AdvancedEDAProps {
    data: StockData[];
    symbol: string;
}

export const AdvancedEDA: React.FC<AdvancedEDAProps> = ({ data, symbol }) => {
    const stockData = data.filter(d => d.symbol === symbol);
    
    // Memoize heavy calculations
    const rollingVolData = useMemo(() => calculateRollingVolatility(stockData, 21), [stockData]);
    const drawdownData = useMemo(() => calculateDrawdownSeries(stockData), [stockData]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Rolling Volatility */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-[400px]">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Rolling 21-Day Volatility (Annualized)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={rollingVolData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} minTickGap={40} />
                            <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v.toFixed(0)}%`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                            <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Drawdown Analysis */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-[400px]">
                    <h3 className="text-lg font-bold text-slate-100 mb-4">Max Drawdown Curve</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={drawdownData}>
                            <defs>
                                <linearGradient id="colorDd" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} minTickGap={40} />
                            <YAxis stroke="#94a3b8" tickFormatter={(v) => `${v.toFixed(0)}%`} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                            <ReferenceLine y={0} stroke="#cbd5e1" />
                            <Area type="stepAfter" dataKey="value" stroke="#ef4444" fill="url(#colorDd)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Simplified PCA Projection Scatter (Static Mock for Demo as PCA needs heavy linear algebra lib) */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                <h3 className="text-lg font-bold text-slate-100 mb-2">PCA Component Analysis (2D Projection)</h3>
                <p className="text-sm text-slate-400 mb-4">Clustering stocks based on return variance similarities.</p>
                <div className="h-64 flex items-center justify-center border border-dashed border-slate-600 rounded bg-slate-900/50">
                    <span className="text-slate-500">Principal Component Scatter Plot Placeholder (Requires mathjs/pca-js)</span>
                </div>
            </div>
        </div>
    );
};
