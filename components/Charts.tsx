import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, ComposedChart, Bar, Sector
} from 'recharts';
import { StockData } from '../types';
import { calculateSMA } from '../utils/dataUtils';
import { Layers, Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
const RADIAN = Math.PI / 180;

interface ChartsProps {
  data: StockData[];
  title?: string;
  selectedSymbol?: string;
}

export const TrendChart: React.FC<ChartsProps> = ({ data, selectedSymbol }) => {
  const displayData = useMemo(() => {
    if (!data || data.length === 0) return [];

    if (selectedSymbol) {
        // Detailed Single Stock View
        const stockData = data.filter(d => d.symbol === selectedSymbol);
        const closes = stockData.map(d => d.close);
        const sma50 = calculateSMA(closes, 50);
        
        return stockData.map((d, i) => ({
            date: d.date,
            price: d.close,
            sma50: sma50[i],
            volume: d.volume
        }));
    } else {
        // Comparative View
        const symbols = Array.from(new Set(data.map(d => d.symbol))).slice(0, 3);
        const chartDataMap: Record<string, any> = {};
        
        data.filter(d => symbols.includes(d.symbol)).forEach(d => {
            if (!chartDataMap[d.date]) chartDataMap[d.date] = { date: d.date };
            chartDataMap[d.date][d.symbol] = d.close;
        });
        return Object.values(chartDataMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }
  }, [data, selectedSymbol]);

  // LOADING STATE
  if (!data || data.length === 0 || displayData.length === 0) {
      return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-96 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">Loading Market Trends...</span>
        </div>
      );
  }

  if (selectedSymbol) {
      return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-96">
            <h3 className="text-lg font-semibold text-slate-100 mb-4">{selectedSymbol} - Price & 50 SMA</h3>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={displayData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} minTickGap={30} />
                    <YAxis yAxisId="left" stroke="#94a3b8" tick={{fontSize: 10}} domain={['auto', 'auto']} />
                    <YAxis yAxisId="right" orientation="right" stroke="#475569" tick={{fontSize: 10}} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} 
                        itemStyle={{ color: '#e2e8f0' }}
                    />
                    <Legend />
                    <Bar yAxisId="right" dataKey="volume" fill="#334155" opacity={0.3} name="Volume" />
                    <Line yAxisId="left" type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} name="Close Price" />
                    <Line yAxisId="left" type="monotone" dataKey="sma50" stroke="#f59e0b" strokeWidth={1.5} dot={false} name="50-Day SMA" />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
      );
  }

  const symbols = Object.keys(displayData[0] || {}).filter(k => k !== 'date');
  
  return (
    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg h-96">
      <h3 className="text-lg font-semibold text-slate-100 mb-4">Market Leaders Comparison</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={displayData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 10}} minTickGap={30}/>
          <YAxis stroke="#94a3b8" tick={{fontSize: 10}} domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#f1f5f9' }} />
          <Legend />
          {symbols.map((symbol, index) => (
            <Line 
              key={symbol} 
              type="monotone" 
              dataKey={symbol} 
              stroke={COLORS[index % COLORS.length]} 
              dot={false} 
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- ENHANCED PIE CHART (DONUT WITH DETAILS) ---

const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#e2e8f0" className="text-lg font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy} dy={15} textAnchor="middle" fill="#94a3b8" className="text-sm">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 8}
        outerRadius={outerRadius + 12}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#fff" className="text-xs font-bold" >{`${value} Companies`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={14} textAnchor={textAnchor} fill="#999" className="text-[10px]">
        {`Sector Wt.`}
      </text>
    </g>
  );
};

export const SectorPieChart: React.FC<ChartsProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // GUARD: If data is not yet loaded, show loading state
  if (!data || data.length === 0) {
    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg h-96 flex flex-col items-center justify-center text-slate-500">
             <Loader2 className="animate-spin mb-2" size={24} />
             <span className="text-sm">Analyzing Sectors...</span>
        </div>
    );
  }

  const sectorCounts: Record<string, number> = {};
  const uniqueEntries = new Set<string>();
  const sectorCompanies: Record<string, string[]> = {};

  data.forEach(d => {
    const key = `${d.symbol}-${d.sector}`;
    if (!uniqueEntries.has(key)) {
      uniqueEntries.add(key);
      sectorCounts[d.sector] = (sectorCounts[d.sector] || 0) + 1;
      if (!sectorCompanies[d.sector]) sectorCompanies[d.sector] = [];
      sectorCompanies[d.sector].push(d.symbol);
    }
  });

  const chartData = Object.keys(sectorCounts).map(name => ({
    name,
    value: sectorCounts[name]
  })).sort((a,b) => b.value - a.value);

  // Guard for empty chart data
  if (chartData.length === 0) return null;

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const activeSector = chartData[activeIndex] || chartData[0];
  const companiesInActiveSector = sectorCompanies[activeSector.name] || [];

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg h-96 flex overflow-hidden">
      {/* Chart Section */}
      <div className="flex-1 p-2 relative">
         <h3 className="absolute top-4 left-4 text-lg font-semibold text-slate-100 flex items-center gap-2">
            <Layers size={18} className="text-blue-400" /> Sector Composition
         </h3>
         <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                activeIndex={activeIndex}
                activeShape={renderActiveShape}
                data={chartData}
                cx="50%"
                cy="55%"
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                onMouseEnter={onPieEnter}
                paddingAngle={3}
            >
                {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.5)" strokeWidth={1} />
                ))}
            </Pie>
            </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Details Side Panel */}
      <div className="w-48 bg-slate-900/50 border-l border-slate-700 p-4 flex flex-col overflow-hidden">
         <div className="mb-3">
             <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">SELECTED SECTOR</div>
             <div className="text-lg font-bold text-white truncate" style={{ color: COLORS[activeIndex % COLORS.length] }}>
                 {activeSector.name}
             </div>
             <div className="text-sm text-slate-400">
                 {activeSector.value} Companies
             </div>
         </div>
         
         <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
             <div className="text-[10px] text-slate-500 uppercase mb-2">Constituents</div>
             <ul className="space-y-1">
                 {companiesInActiveSector.map(sym => (
                     <li key={sym} className="text-xs text-slate-300 hover:text-white truncate py-1 border-b border-slate-800/50">
                         {sym}
                     </li>
                 ))}
             </ul>
         </div>
      </div>
    </div>
  );
};
