import React, { useMemo } from 'react';
import { 
    ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine 
} from 'recharts';
import { StockData, ForecastResult } from '../types';
import { generateForecast } from '../utils/dataUtils';
import { TrendingUp, AlertTriangle, ArrowRight, BrainCircuit, Cpu, Network } from 'lucide-react';

interface ForecastingProps {
    data: StockData[];
    symbol: string;
}

export const Forecasting: React.FC<ForecastingProps> = ({ data, symbol }) => {
    const forecast: ForecastResult | null = useMemo(() => generateForecast(data, symbol), [data, symbol]);

    if (!forecast) return <div>Not enough data for prediction</div>;

    const RecommendationCard = ({ type }: { type: 'BUY' | 'SELL' | 'HOLD' }) => {
        const styles = {
            BUY: 'bg-green-500/20 border-green-500 text-green-400',
            SELL: 'bg-red-500/20 border-red-500 text-red-400',
            HOLD: 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
        };

        return (
            <div className={`p-4 rounded-xl border ${styles[type]} flex flex-col items-center justify-center h-full`}>
                <span className="text-xs uppercase font-bold tracking-wider mb-2">AI Recommendation</span>
                <span className="text-3xl font-black">{type}</span>
                <span className="text-xs mt-2 opacity-80">Ensemble Model Output</span>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="col-span-1 lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                            <BrainCircuit className="text-purple-400" />
                            Deep Learning Price Forecast: {symbol}
                        </h3>
                        <p className="text-sm text-slate-400 mt-2">
                            Utilizing advanced neural architectures for time-series forecasting. 
                            The <strong>CNN</strong> (Convolutional Neural Network) detects local price patterns, while the <strong>RNN-LSTM</strong> (Recurrent Neural Network) captures long-term temporal dependencies.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                            <div className="text-slate-500 text-xs uppercase">Current Price</div>
                            <div className="text-xl font-mono text-white mt-1">₹{forecast.currentPrice.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                            <div className="text-slate-500 text-xs uppercase">Target (7D)</div>
                            <div className="text-xl font-mono text-purple-400 mt-1">₹{forecast.predictedPrice.toFixed(2)}</div>
                        </div>
                        <div className="bg-slate-900 p-3 rounded-lg border border-slate-700">
                            <div className="text-slate-500 text-xs uppercase">Model Growth</div>
                            <div className={`text-xl font-bold mt-1 ${forecast.growthPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {forecast.growthPercent > 0 ? '+' : ''}{forecast.growthPercent.toFixed(2)}%
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendation */}
                <div className="col-span-1 h-full">
                    <RecommendationCard type={forecast.recommendation} />
                </div>
            </div>

            {/* Chart */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={forecast.modelData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <defs>
                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                        <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} minTickGap={30} />
                        <YAxis domain={['auto', 'auto']} stroke="#94a3b8" tickFormatter={(v) => `₹${v.toFixed(0)}`} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        
                        <Area 
                            type="monotone" 
                            dataKey="actual" 
                            name="Historical Data" 
                            stroke="#3b82f6" 
                            fill="url(#colorActual)" 
                            strokeWidth={2} 
                        />
                        
                        {/* CNN Line */}
                        <Line 
                            type="monotone" 
                            dataKey="cnnPrediction" 
                            name="CNN (Pattern Conv)" 
                            stroke="#10b981" 
                            strokeWidth={3} 
                            strokeDasharray="3 3"
                            dot={{ r: 3, strokeWidth: 1, fill: '#10b981' }}
                            connectNulls
                        />

                        {/* RNN Line */}
                        <Line 
                            type="monotone" 
                            dataKey="rnnPrediction" 
                            name="RNN-LSTM (Sequential)" 
                            stroke="#ec4899" 
                            strokeWidth={3} 
                            strokeDasharray="5 5"
                            dot={{ r: 3, strokeWidth: 1, fill: '#ec4899' }}
                            connectNulls
                        />

                        <ReferenceLine x={forecast.modelData.find(d => d.isForecast)?.date} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: 'PREDICTION START', position: 'insideTopLeft', fill: '#94a3b8', fontSize: 10 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-slate-100 mb-2 flex items-center gap-2">
                        <Network size={16} className="text-emerald-400" />
                        CNN Architecture (1D Conv)
                    </h4>
                    <p className="text-sm text-slate-400">
                        The Convolutional Neural Network uses sliding filters over the price time-series to extract local features like sudden spikes, head-and-shoulders patterns, or cup-and-handle formations that indicate trend reversals.
                    </p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h4 className="font-bold text-slate-100 mb-2 flex items-center gap-2">
                        <Cpu size={16} className="text-pink-400" />
                        RNN Architecture (LSTM)
                    </h4>
                    <p className="text-sm text-slate-400">
                        The Recurrent Neural Network utilizes Long Short-Term Memory cells to retain information about long-term trends and volatility cycles, filtering out noise to project the underlying momentum.
                    </p>
                </div>
            </div>
        </div>
    );
};