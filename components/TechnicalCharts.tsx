import React, { useMemo, useState } from 'react';
import { 
    ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
    ReferenceLine, ResponsiveContainer, Area
} from 'recharts';
import { StockData, TechnicalLevels, PriceAlert } from '../types';
import { calculateTechnicalLevels, calculateBollingerBands, calculateMACD } from '../utils/dataUtils';
import { PlusCircle, Loader2 } from 'lucide-react';

interface TechnicalChartProps {
    data: StockData[];
    symbol: string;
    onSetAlert: (price: number) => void;
    activeAlerts: PriceAlert[];
}

type TimeRange = '1M' | '3M' | '6M' | '1Y';

export const PriceActionChart: React.FC<TechnicalChartProps> = ({ data, symbol, onSetAlert, activeAlerts }) => {
    const [timeRange, setTimeRange] = useState<TimeRange>('6M');
    const [alertPrice, setAlertPrice] = useState<string>('');

    const stockData = useMemo(() => {
        if (!data || data.length === 0) return [];
        let filtered = data.filter(d => d.symbol === symbol);
        const total = filtered.length;
        if (timeRange === '1M') filtered = filtered.slice(Math.max(0, total - 30));
        else if (timeRange === '3M') filtered = filtered.slice(Math.max(0, total - 90));
        else if (timeRange === '6M') filtered = filtered.slice(Math.max(0, total - 180));
        return filtered;
    }, [data, symbol, timeRange]);
    
    // GUARD: If data is empty
    if (!stockData || stockData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[650px] bg-slate-800 rounded-xl border border-slate-700">
                <Loader2 className="animate-spin text-slate-500 mb-2" size={32} />
                <span className="text-slate-400">Loading Technical Data for {symbol}...</span>
            </div>
        );
    }

    // Indicators
    const levels: TechnicalLevels = calculateTechnicalLevels(stockData);
    const bb = calculateBollingerBands(stockData.map(d => d.close));
    const macd = calculateMACD(stockData.map(d => d.close));

    const chartData = stockData.map((d, i) => ({
        ...d,
        bbUpper: bb[i].upper,
        bbLower: bb[i].lower,
        bbMiddle: bb[i].middle,
        macd: macd[i].macd,
        signal: macd[i].signal,
        histogram: macd[i].histogram,
        volColor: d.close > d.open ? '#22c55e' : '#ef4444' 
    }));

    const minPrice = Math.min(...stockData.map(d => d.low)) * 0.95;
    const maxPrice = Math.max(...stockData.map(d => d.high)) * 1.05;
    const currentPrice = stockData.length > 0 ? stockData[stockData.length - 1].close : 0;
    const lastMACD = macd[macd.length-1];

    const handleAlertSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(alertPrice);
        if (price > 0) {
            onSetAlert(price);
            setAlertPrice('');
        }
    };

    // Analysis Logic
    const getAnalysisText = () => {
        if (!lastMACD || !bb[bb.length-1] || bb[bb.length-1].upper === null) {
            return {
                trend: "ANALYZING...",
                volatility: "CALCULATING...",
                insight: "Collecting sufficient data points..."
            };
        }
        
        // Safety check for TS
        const upper = bb[bb.length-1].upper!;
        const lower = bb[bb.length-1].lower!;

        const bbWidth = upper - lower;
        const bbSqueeze = bbWidth < (currentPrice * 0.05); // 5% width is tight
        const isBullish = lastMACD.macd > lastMACD.signal;
        
        return {
            trend: isBullish ? "BULLISH" : "BEARISH",
            volatility: bbSqueeze ? "SQUEEZE (Low Vol)" : "EXPANDED (High Vol)",
            insight: isBullish 
                ? "MACD crossed above signal line, indicating positive momentum. Look for price to test upper Bollinger Band."
                : "MACD is below signal line. Downward pressure suggests price may test lower support levels."
        };
    };

    const analysis = getAnalysisText();

    return (
        <div className="flex flex-col xl:flex-row gap-6 h-[800px] xl:h-[650px]">
            {/* LEFT: Charts Container */}
            <div className="flex-1 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg flex flex-col">
                <div className="flex justify-between items-center mb-2 px-2">
                    <h3 className="text-lg font-bold text-slate-100">{symbol} Price Action</h3>
                    <div className="flex gap-2">
                        {(['1M', '3M', '6M', '1Y'] as TimeRange[]).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-2 py-0.5 text-[10px] rounded transition-all ${
                                    timeRange === range 
                                    ? 'bg-blue-600 text-white' 
                                    : 'text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                </div>

                {/* CHART 1: PRICE + BB */}
                <div className="flex-1 min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} syncId="anyId" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis dataKey="date" hide />
                            <YAxis domain={[minPrice, maxPrice]} stroke="#94a3b8" tick={{fontSize: 10}} tickFormatter={(val) => `₹${val.toFixed(0)}`} width={50} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }} />
                            
                            {/* Bollinger Bands Area */}
                            <Area dataKey="bbUpper" stroke="none" fill="#3b82f6" fillOpacity={0.05} />
                            <Area dataKey="bbLower" stroke="none" fill="#1e293b" fillOpacity={1} /> 
                            
                            {/* BB Lines */}
                            <Line type="monotone" dataKey="bbUpper" stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />
                            <Line type="monotone" dataKey="bbLower" stroke="#64748b" strokeWidth={1} strokeDasharray="3 3" dot={false} isAnimationActive={false} />

                            {/* Main Price */}
                            <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill="url(#colorPrice)" dot={false} />
                            
                            {/* Alerts */}
                            {activeAlerts.map((alert) => (
                                <ReferenceLine key={alert.id} y={alert.targetPrice} stroke="#f59e0b" strokeDasharray="5 5" label={{ value: 'ALERT', fill: '#f59e0b', fontSize: 10 }} />
                            ))}
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* CHART 2: MACD + VOLUME */}
                <div className="h-[180px] mt-2 border-t border-slate-700/50 pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} syncId="anyId" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                            <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} minTickGap={50} />
                            <YAxis yAxisId="macd" stroke="#94a3b8" tick={{fontSize: 10}} width={50} />
                            <YAxis yAxisId="vol" orientation="right" hide />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', fontSize: '12px' }} />
                            
                            <Bar yAxisId="vol" dataKey="volume" fill="#334155" opacity={0.3} barSize={2} />
                            
                            <Line yAxisId="macd" type="monotone" dataKey="macd" stroke="#22c55e" strokeWidth={1.5} dot={false} />
                            <Line yAxisId="macd" type="monotone" dataKey="signal" stroke="#ef4444" strokeWidth={1.5} dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* RIGHT: Analysis Panel */}
            <div className="w-full xl:w-80 flex flex-col gap-6">
                
                {/* Summary Card */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Technical Insight</h4>
                    
                    <div className="space-y-4">
                        <div>
                            <span className="text-xs text-slate-500 block">Momentum Trend</span>
                            <span className={`text-lg font-bold ${analysis.trend === 'BULLISH' ? 'text-green-400' : 'text-red-400'}`}>
                                {analysis.trend}
                            </span>
                        </div>
                        <div>
                            <span className="text-xs text-slate-500 block">Volatility Status</span>
                            <span className="text-sm font-medium text-slate-200">{analysis.volatility}</span>
                        </div>
                        <div className="bg-slate-900/50 p-3 rounded border border-slate-700/50 text-xs text-slate-300 leading-relaxed">
                            {analysis.insight}
                        </div>
                    </div>
                </div>

                {/* Key Levels */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg flex-1">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">Key Levels</h4>
                    
                    <div className="space-y-3">
                        {levels.resistance.slice(0, 2).map((res, i) => (
                            <div key={`r-${i}`} className="flex justify-between items-center">
                                <span className="text-xs text-red-400">Resistance {i+1}</span>
                                <span className="text-sm font-mono text-slate-200">₹{res.toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center py-2 border-y border-slate-700/30">
                            <span className="text-xs text-blue-400 font-bold">Current</span>
                            <span className="text-base font-mono text-white font-bold">₹{currentPrice.toFixed(2)}</span>
                        </div>
                        {levels.support.slice(0, 2).map((sup, i) => (
                            <div key={`s-${i}`} className="flex justify-between items-center">
                                <span className="text-xs text-green-400">Support {i+1}</span>
                                <span className="text-sm font-mono text-slate-200">₹{sup.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-700">
                         <h5 className="text-xs font-bold text-slate-500 mb-2">Set Price Alert</h5>
                         <form onSubmit={handleAlertSubmit} className="flex gap-2">
                             <input 
                                type="number" 
                                className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                                placeholder="Target Price..."
                                value={alertPrice}
                                onChange={(e) => setAlertPrice(e.target.value)}
                             />
                             <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded p-2">
                                 <PlusCircle size={16} />
                             </button>
                         </form>
                    </div>
                </div>

            </div>
        </div>
    );
};