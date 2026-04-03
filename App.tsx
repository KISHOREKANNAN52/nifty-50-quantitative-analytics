import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StockData, ViewMode, FundamentalData, GraphData, RiskReturnMetric, PriceAlert, MarketReportItem } from './types';
import { 
    generateNiftyData, 
    calculateFundamentals, 
    getCorrelationNetwork, 
    calculateAdvancedMetrics,
    generateMarketReport,
    NIFTY_COMPANIES 
} from './utils/dataUtils';
import { SectorPieChart, TrendChart } from './components/Charts';
import { PriceActionChart } from './components/TechnicalCharts';
import { FundamentalCard } from './components/FundamentalAnalysis';
import D3RiskScatter from './components/D3RiskScatter';
import { CorrelationNetwork } from './components/AnalysisViews';
import { StrategyBuilder } from './components/StrategyBuilder';
import { AdvancedEDA } from './components/AdvancedEDA';
import { PortfolioTools } from './components/PortfolioTools';
import { MarketReport } from './components/MarketReport';
import { Forecasting } from './components/Forecasting';
import { ComparativeAnalysis } from './components/ComparativeAnalysis';
import { NotificationToast, Notification } from './components/NotificationToast';
import { 
    TrendingUp, 
    PieChart, 
    BookOpen, 
    Menu, 
    RefreshCcw,
    Search,
    BarChart2,
    Activity,
    Network,
    Layers,
    Briefcase,
    Zap,
    ArrowLeft,
    Bell,
    FileText,
    BrainCircuit,
    GitCompare
} from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<StockData[]>([]);
  const [currentView, setCurrentView] = useState<ViewMode>(ViewMode.MARKET_OVERVIEW);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Alert & Notification State
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Real-time Simulation State
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Initial Data
  useEffect(() => {
    const mock = generateNiftyData();
    setData(mock);
  }, []);

  // Live Ticker Simulation: Update the last data point randomly every 1.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
        setData(prevData => {
            const newData = [...prevData];
            // Randomly update 20 stocks
            for(let i=0; i<20; i++) {
                const idx = Math.floor(Math.random() * newData.length);
                if (newData[idx] && i < 100) { // Safety check
                    const volatility = 0.002; // Small tick vol
                    const change = newData[idx].close * ((Math.random() - 0.5) * volatility);
                    newData[idx] = {
                        ...newData[idx],
                        close: newData[idx].close + change,
                        volume: newData[idx].volume + Math.floor(Math.random() * 1000)
                    };
                }
            }
            return newData;
        });
        setLastUpdate(new Date());
    }, 1500); 
    return () => clearInterval(interval);
  }, []);

  // ALERT CHECKING LOGIC
  useEffect(() => {
      // Check active alerts against current data
      const checkAlerts = () => {
          setAlerts(prevAlerts => {
              let hasChanges = false;
              const updatedAlerts = prevAlerts.map(alert => {
                  if (alert.triggered) return alert;

                  // Find latest price for this stock
                  // We scan the data array backwards to find the specific symbol's latest entry
                  // Optimization: In a real app, use a Map<Symbol, Price>
                  const stockEntry = data.filter(d => d.symbol === alert.symbol).pop();
                  
                  if (stockEntry) {
                      const price = stockEntry.close;
                      let isTriggered = false;

                      if (alert.condition === 'GE' && price >= alert.targetPrice) isTriggered = true;
                      if (alert.condition === 'LE' && price <= alert.targetPrice) isTriggered = true;

                      if (isTriggered) {
                          hasChanges = true;
                          // Trigger Notification
                          const newNotif: Notification = {
                              id: Date.now().toString() + Math.random(),
                              message: `${alert.symbol} reached target price: ₹${alert.targetPrice.toFixed(2)}`,
                              timestamp: Date.now()
                          };
                          setNotifications(prev => [newNotif, ...prev]);
                          return { ...alert, triggered: true };
                      }
                  }
                  return alert;
              });
              return hasChanges ? updatedAlerts : prevAlerts;
          });
      };
      
      if (alerts.some(a => !a.triggered)) {
          checkAlerts();
      }

  }, [lastUpdate, data]); // Runs every ticker update

  // Compute Graphs (Memoized)
  const correlationGraph: GraphData = useMemo(() => getCorrelationNetwork(data), [data]);
  const riskMetrics: RiskReturnMetric[] = useMemo(() => calculateAdvancedMetrics(data), [data]);
  const marketReport: MarketReportItem[] = useMemo(() => generateMarketReport(data), [data]);

  // Compute Fundamentals on the fly for selected symbol
  const fundamentalData: FundamentalData | null = useMemo(() => {
    const stock = data.filter(d => d.symbol === selectedSymbol).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    if (!stock) return null;
    return calculateFundamentals(selectedSymbol, stock.close);
  }, [selectedSymbol, data, lastUpdate]);

  // Filtered List
  const filteredCompanies = NIFTY_COMPANIES.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
      const mock = generateNiftyData();
      setData(mock);
  };

  const handleStockClick = (symbol: string) => {
      setSelectedSymbol(symbol);
      setCurrentView(ViewMode.TECHNICAL_ANALYSIS);
      setIsSidebarOpen(false);
  };

  const addAlert = (targetPrice: number) => {
      const currentStock = data.filter(d => d.symbol === selectedSymbol).pop();
      if (!currentStock) return;

      const condition = targetPrice >= currentStock.close ? 'GE' : 'LE';
      const newAlert: PriceAlert = {
          id: Date.now().toString(),
          symbol: selectedSymbol,
          targetPrice,
          condition,
          triggered: false,
          createdAt: new Date().toISOString()
      };
      setAlerts(prev => [...prev, newAlert]);
      
      // Info Toast
      setNotifications(prev => [{
          id: Date.now().toString(),
          message: `Alert set for ${selectedSymbol} at ₹${targetPrice}`,
          timestamp: Date.now()
      }, ...prev]);
  };

  const closeNotification = (id: string) => {
      setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const NavItem = ({ mode, icon: Icon, label }: { mode: ViewMode, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentView(mode); setIsSidebarOpen(false); }}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
        currentView === mode 
          ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium text-sm">{label}</span>
    </button>
  );

  // Current Price for Strategy Builder
  const currentPrice = useMemo(() => {
      const d = data.filter(x => x.symbol === selectedSymbol);
      return d.length > 0 ? d[d.length-1].close : 1000;
  }, [data, selectedSymbol]);

  // Active alerts for current symbol
  const activeSymbolAlerts = useMemo(() => 
    alerts.filter(a => a.symbol === selectedSymbol && !a.triggered), 
  [alerts, selectedSymbol]);

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex overflow-hidden font-inter">
      
      <NotificationToast notifications={notifications} onClose={closeNotification} />

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-[#0f172a] border-r border-slate-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-slate-800">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent flex items-center gap-2">
            <Activity size={24} className="text-blue-400" />
            QUANT TERMINAL
          </h1>
          <div className="mt-4 relative">
             <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
             <input 
                type="text" 
                placeholder="Search NIFTY 50..." 
                className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500 text-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
        </div>

        <nav className="p-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider">Market Overview</div>
          <NavItem mode={ViewMode.MARKET_OVERVIEW} icon={BarChart2} label="Dashboard" />
          <NavItem mode={ViewMode.MARKET_REPORT} icon={FileText} label="Market Report" />
          <NavItem mode={ViewMode.CORRELATION_NETWORK} icon={Network} label="Correlation Map" />
          
          <div className="text-xs font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider mt-4">Predictive Analytics</div>
          <NavItem mode={ViewMode.FORECASTING} icon={BrainCircuit} label="AI Forecasting" />
          <NavItem mode={ViewMode.COMPARISON} icon={GitCompare} label="Compare & Rank" />
          
          <div className="text-xs font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider mt-4">Quantitative Tools</div>
          <NavItem mode={ViewMode.STRATEGY_BUILDER} icon={Layers} label="Strategy Builder" />
          <NavItem mode={ViewMode.ADVANCED_EDA} icon={Zap} label="Advanced EDA" />
          <NavItem mode={ViewMode.PORTFOLIO_TOOLS} icon={Briefcase} label="Portfolio Analytics" />

          <div className="text-xs font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider mt-4">Fundamental</div>
          <NavItem mode={ViewMode.TECHNICAL_ANALYSIS} icon={TrendingUp} label="Technical Analysis" />
          <NavItem mode={ViewMode.SECTOR_ANALYSIS} icon={PieChart} label="Sector Breakdown" />
          <NavItem mode={ViewMode.FUNDAMENTAL_REPORT} icon={BookOpen} label="Balance Sheet" />
        </nav>

        <div className="flex-1 overflow-y-auto px-4 pb-4 border-t border-slate-800 mt-2 pt-4">
             <div className="text-xs font-semibold text-slate-500 mb-2 px-3 uppercase tracking-wider">NIFTY 50 Watchlist</div>
             <div className="space-y-1">
                 {filteredCompanies.map(c => (
                     <button 
                        key={c.symbol}
                        onClick={() => handleStockClick(c.symbol)}
                        className={`w-full text-left px-3 py-2 rounded text-xs flex justify-between group transition-colors ${selectedSymbol === c.symbol ? 'bg-slate-800 text-blue-400 border-l-2 border-blue-400' : 'text-slate-400 hover:bg-slate-800/50'}`}
                     >
                        <span>{c.symbol}</span>
                        <span className={`opacity-0 group-hover:opacity-100 ${selectedSymbol === c.symbol ? 'opacity-100' : ''} text-[10px] bg-slate-700 px-1 rounded truncate max-w-[80px]`}>{c.sector}</span>
                     </button>
                 ))}
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-screen relative">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-[#0b1120]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 rounded-md hover:bg-slate-800">
                    <Menu size={20} />
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        {currentView !== ViewMode.MARKET_OVERVIEW && (
                            <button 
                                onClick={() => setCurrentView(ViewMode.MARKET_OVERVIEW)}
                                className="mr-2 p-1 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all"
                                title="Back to Overview"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        {currentView.replace('_', ' ')}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        Analyzing <span className="text-blue-400 font-bold">{selectedSymbol}</span> 
                        <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                        <span className="text-green-400 flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Live Updates
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full">
                        <Bell size={18} />
                        {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                    </button>
                </div>
                <div className="text-right hidden sm:block">
                    <div className="text-xs text-slate-400">NIFTY 50</div>
                    <div className="text-sm font-bold text-white">24,142.50 <span className="text-green-500 text-xs">+0.45%</span></div>
                </div>
                <button 
                    onClick={handleRefresh} 
                    className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full border border-slate-700 transition-all hover:rotate-180 duration-500"
                    title="Regenerate Market Data"
                >
                    <RefreshCcw size={16} />
                </button>
            </div>
        </header>

        <div className="p-6 max-w-[1600px] mx-auto space-y-6">
            
            {/* VIEW: OVERVIEW */}
            {currentView === ViewMode.MARKET_OVERVIEW && (
                <div className="space-y-6">
                    {/* Top Row: Risk Scatter & Sector Pie */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                         <D3RiskScatter data={riskMetrics} />
                         <div className="flex flex-col gap-6">
                            <div className="flex-1 bg-slate-800 rounded-xl border border-slate-700 p-4">
                                <h3 className="text-lg font-semibold text-slate-100 mb-2">Market Pulse</h3>
                                <TrendChart data={data} />
                            </div>
                            <div className="h-64">
                                <SectorPieChart data={data} />
                            </div>
                         </div>
                    </div>
                     <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-100">Correlation Snapshot</h3>
                            <button onClick={() => setCurrentView(ViewMode.CORRELATION_NETWORK)} className="text-blue-400 text-sm hover:underline">View Full Network &rarr;</button>
                        </div>
                        <div className="h-[400px] relative overflow-hidden rounded-lg border border-slate-700/50">
                             <CorrelationNetwork data={correlationGraph} />
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW: FORECASTING */}
            {currentView === ViewMode.FORECASTING && (
                <Forecasting data={data} symbol={selectedSymbol} />
            )}

            {/* VIEW: COMPARISON */}
            {currentView === ViewMode.COMPARISON && (
                <ComparativeAnalysis data={data} />
            )}

            {/* VIEW: MARKET REPORT */}
            {currentView === ViewMode.MARKET_REPORT && (
                <MarketReport report={marketReport} />
            )}

            {/* VIEW: STRATEGY BUILDER */}
            {currentView === ViewMode.STRATEGY_BUILDER && (
                <StrategyBuilder symbol={selectedSymbol} currentPrice={currentPrice} />
            )}

            {/* VIEW: ADVANCED EDA */}
            {currentView === ViewMode.ADVANCED_EDA && (
                <AdvancedEDA data={data} symbol={selectedSymbol} />
            )}

            {/* VIEW: PORTFOLIO */}
            {currentView === ViewMode.PORTFOLIO_TOOLS && (
                <PortfolioTools />
            )}

            {/* VIEW: CORRELATION NETWORK FULL */}
            {currentView === ViewMode.CORRELATION_NETWORK && (
                 <CorrelationNetwork data={correlationGraph} />
            )}

            {/* VIEW: TECHNICAL */}
            {currentView === ViewMode.TECHNICAL_ANALYSIS && (
                <div className="space-y-6">
                    <PriceActionChart 
                        data={data} 
                        symbol={selectedSymbol} 
                        onSetAlert={addAlert}
                        activeAlerts={activeSymbolAlerts}
                    />
                </div>
            )}

            {/* VIEW: SECTOR PIE */}
            {currentView === ViewMode.SECTOR_ANALYSIS && (
                <div className="space-y-6">
                    <SectorPieChart data={data} />
                    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                        <h4 className="font-bold text-slate-100 mb-2">Sector Rotation Insights</h4>
                        <p className="text-sm text-slate-400">
                            Financial Services and IT typically carry the heaviest weight in NIFTY 50. 
                            A shift in momentum towards "Metals" or "Pharma" often indicates a defensive or cyclical market rotation.
                        </p>
                    </div>
                </div>
            )}

            {/* VIEW: FUNDAMENTAL */}
            {currentView === ViewMode.FUNDAMENTAL_REPORT && fundamentalData && (
                <div className="space-y-6">
                    <FundamentalCard data={fundamentalData} />
                </div>
            )}

        </div>
      </main>
    </div>
  );
};

export default App;