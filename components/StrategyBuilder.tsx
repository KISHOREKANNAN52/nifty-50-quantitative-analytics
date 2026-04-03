import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { OptionLeg, PayoffPoint } from '../types';
import { calculateOptionPayoff } from '../utils/dataUtils';
import { Plus, Trash2, TrendingUp, AlertCircle } from 'lucide-react';

interface StrategyBuilderProps {
    symbol: string;
    currentPrice: number;
}

export const StrategyBuilder: React.FC<StrategyBuilderProps> = ({ symbol, currentPrice }) => {
    const [legs, setLegs] = useState<OptionLeg[]>([
        { id: '1', type: 'Call', position: 'Long', strike: Math.round(currentPrice), premium: 50, iv: 20, delta: 0.5, theta: -3, gamma: 0.02, vega: 10 }
    ]);

    const [payoffData, setPayoffData] = useState<PayoffPoint[]>([]);

    useEffect(() => {
        setPayoffData(calculateOptionPayoff(legs, currentPrice));
    }, [legs, currentPrice]);

    const addLeg = () => {
        const newLeg: OptionLeg = {
            id: Math.random().toString(36).substr(2, 9),
            type: 'Call',
            position: 'Long',
            strike: Math.round(currentPrice),
            premium: 50,
            iv: 20, delta: 0.5, theta: -2, gamma: 0.01, vega: 5
        };
        setLegs([...legs, newLeg]);
    };

    const removeLeg = (id: string) => {
        setLegs(legs.filter(l => l.id !== id));
    };

    const updateLeg = (id: string, field: keyof OptionLeg, value: any) => {
        setLegs(legs.map(l => l.id === id ? { ...l, [field]: value } : l));
    };

    // Aggregate Greeks
    const totalGreeks = legs.reduce((acc, leg) => ({
        delta: acc.delta + (leg.position === 'Long' ? leg.delta : -leg.delta),
        theta: acc.theta + (leg.position === 'Long' ? leg.theta : -leg.theta),
        gamma: acc.gamma + (leg.position === 'Long' ? leg.gamma : -leg.gamma),
        vega: acc.vega + (leg.position === 'Long' ? leg.vega : -leg.vega),
    }), { delta: 0, theta: 0, gamma: 0, vega: 0 });

    const maxProfit = Math.max(...payoffData.map(p => p.pnl));
    const maxLoss = Math.min(...payoffData.map(p => p.pnl));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                {/* Chart */}
                <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-[500px]">
                    <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
                        <TrendingUp className="text-blue-400" /> Payoff Diagram
                    </h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={payoffData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPnL" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="price" stroke="#94a3b8" tickFormatter={(v) => v.toFixed(0)} />
                            <YAxis stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} labelFormatter={(v) => `Price: ${Number(v).toFixed(2)}`} />
                            <ReferenceLine y={0} stroke="#cbd5e1" strokeWidth={2} />
                            <ReferenceLine x={currentPrice} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'CMP', fill: '#f59e0b', fontSize: 10 }} />
                            <Area type="monotone" dataKey="pnl" stroke="#6366f1" fill="url(#colorPnL)" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4">
                    {Object.entries(totalGreeks).map(([key, val]) => {
                        const numVal = val as number;
                        return (
                            <div key={key} className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-center">
                                <div className="text-slate-400 uppercase text-xs font-bold">{key}</div>
                                <div className={`text-xl font-mono mt-1 ${numVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {numVal.toFixed(2)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Strategy Controls */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-100">Strategy Legs</h3>
                    <button onClick={addLeg} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-xs flex items-center gap-1">
                        <Plus size={14} /> Add Leg
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3">
                    {legs.map((leg) => (
                        <div key={leg.id} className="bg-slate-900 p-3 rounded border border-slate-700 text-sm">
                            <div className="flex justify-between mb-2">
                                <select 
                                    className="bg-slate-800 border-none rounded text-xs p-1"
                                    value={leg.position}
                                    onChange={(e) => updateLeg(leg.id, 'position', e.target.value)}
                                >
                                    <option value="Long">Long</option>
                                    <option value="Short">Short</option>
                                </select>
                                <select 
                                    className="bg-slate-800 border-none rounded text-xs p-1"
                                    value={leg.type}
                                    onChange={(e) => updateLeg(leg.id, 'type', e.target.value)}
                                >
                                    <option value="Call">Call</option>
                                    <option value="Put">Put</option>
                                </select>
                                <button onClick={() => removeLeg(leg.id)} className="text-red-500 hover:text-red-400">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-slate-500">Strike</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-800 rounded px-2 py-1 text-xs"
                                        value={leg.strike}
                                        onChange={(e) => updateLeg(leg.id, 'strike', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500">Premium</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-800 rounded px-2 py-1 text-xs"
                                        value={leg.premium}
                                        onChange={(e) => updateLeg(leg.id, 'premium', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-400">Max Profit:</span>
                        <span className="text-green-400 font-mono">{maxProfit > 50000 ? 'Unlimited' : maxProfit.toFixed(0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Max Loss:</span>
                        <span className="text-red-400 font-mono">{maxLoss < -50000 ? 'Unlimited' : maxLoss.toFixed(0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};