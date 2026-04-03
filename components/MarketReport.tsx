import React, { useState, useMemo } from 'react';
import { MarketReportItem } from '../types';
import { Download, Search, Filter, ArrowUp, ArrowDown } from 'lucide-react';

interface MarketReportProps {
    report: MarketReportItem[];
}

type SortField = keyof MarketReportItem;

export const MarketReport: React.FC<MarketReportProps> = ({ report }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('marketCap');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [filterSector, setFilterSector] = useState<string>('All');

    const sectors = ['All', ...Array.from(new Set(report.map(i => i.sector)))];

    const processedData = useMemo(() => {
        let data = [...report];

        // Filter
        if (filterSector !== 'All') {
            data = data.filter(d => d.sector === filterSector);
        }
        if (searchTerm) {
            data = data.filter(d => d.symbol.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        // Sort
        data.sort((a, b) => {
            const valA = a[sortField];
            const valB = b[sortField];
            
            if (typeof valA === 'string' && typeof valB === 'string') {
                return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
            }
            if (typeof valA === 'number' && typeof valB === 'number') {
                return sortDir === 'asc' ? valA - valB : valB - valA;
            }
            return 0;
        });

        return data;
    }, [report, filterSector, searchTerm, sortField, sortDir]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDir('desc');
        }
    };

    const downloadCSV = () => {
        const headers = ["Symbol", "Sector", "Price", "Change %", "Volume", "RSI", "Volatility", "P/E", "Signal"];
        const rows = processedData.map(d => [
            d.symbol,
            d.sector,
            d.price.toFixed(2),
            d.changePercent.toFixed(2),
            d.volume,
            d.rsi.toFixed(2),
            d.volatility.toFixed(2),
            d.peRatio.toFixed(2),
            d.signal
        ]);

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "NIFTY50_Analysis_Report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const SignalBadge = ({ signal }: { signal: string }) => {
        const colors: Record<string, string> = {
            'STRONG BUY': 'bg-green-500 text-white',
            'BUY': 'bg-green-500/20 text-green-400 border border-green-500/30',
            'NEUTRAL': 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
            'SELL': 'bg-red-500/20 text-red-400 border border-red-500/30',
            'STRONG SELL': 'bg-red-600 text-white',
        };
        return (
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${colors[signal] || colors['NEUTRAL']}`}>
                {signal}
            </span>
        );
    };

    return (
        <div className="space-y-4">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-100">NIFTY 50 Analysis Report</h3>
                        <p className="text-sm text-slate-400">Comprehensive technical and fundamental screening journal.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                         <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="text" 
                                placeholder="Filter Symbol..." 
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 text-slate-300"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                         <div className="relative">
                            <select 
                                className="appearance-none bg-slate-900 border border-slate-600 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none text-slate-300"
                                value={filterSector}
                                onChange={(e) => setFilterSector(e.target.value)}
                            >
                                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            <Filter className="absolute right-3 top-2.5 text-slate-500 pointer-events-none" size={14} />
                        </div>
                        <button 
                            onClick={downloadCSV}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors"
                        >
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="text-xs text-slate-400 uppercase border-b border-slate-700 bg-slate-900/50">
                                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('symbol')}>Symbol</th>
                                <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('sector')}>Sector</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('price')}>Price</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('changePercent')}>24h %</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('rsi')}>RSI (14)</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('volatility')}>Vol %</th>
                                <th className="p-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('peRatio')}>P/E</th>
                                <th className="p-4 text-center cursor-pointer hover:text-white" onClick={() => handleSort('signal')}>Signal</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {processedData.map((item) => (
                                <tr key={item.symbol} className="border-b border-slate-800 hover:bg-slate-700/30 transition-colors">
                                    <td className="p-4 font-bold text-white">{item.symbol}</td>
                                    <td className="p-4 text-slate-400">{item.sector}</td>
                                    <td className="p-4 text-right font-mono text-slate-200">₹{item.price.toFixed(2)}</td>
                                    <td className={`p-4 text-right font-mono ${item.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {item.changePercent > 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                                    </td>
                                    <td className="p-4 text-right font-mono">
                                        <span className={item.rsi > 70 ? 'text-red-400' : item.rsi < 30 ? 'text-green-400' : 'text-slate-400'}>
                                            {item.rsi.toFixed(1)}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-mono text-slate-400">{item.volatility.toFixed(1)}%</td>
                                    <td className="p-4 text-right font-mono text-slate-400">{item.peRatio.toFixed(1)}x</td>
                                    <td className="p-4 text-center">
                                        <SignalBadge signal={item.signal} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-xs text-slate-500 text-center">
                    Showing {processedData.length} companies. Data simulated for demonstration.
                </div>
            </div>
        </div>
    );
};
