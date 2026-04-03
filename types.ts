export interface StockData {
  symbol: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sector: string;
}

export interface CompanyProfile {
  symbol: string;
  name: string;
  sector: string;
}

export interface FundamentalData {
  symbol: string;
  totalAssets: number;     
  totalLiabilities: number;
  sharesOutstanding: number; 
  price: number;
  bookValuePerShare: number;
  pbRatio: number;
  marketCap: number;
  eps: number;
  peRatio: number;
  roe: number;
}

export interface TechnicalLevels {
    support: number[];
    resistance: number[];
    peaks: { date: string, price: number }[];
    troughs: { date: string, price: number }[];
}

export interface CorrelationNode {
    id: string; 
    group: string; 
    val: number;
    // D3 simulation properties
    x?: number;
    y?: number;
    fx?: number | null;
    fy?: number | null;
}

export interface CorrelationLink {
    source: string | CorrelationNode; 
    target: string | CorrelationNode; 
    value: number;
}

export interface GraphData {
    nodes: CorrelationNode[];
    links: CorrelationLink[];
}

export interface RiskReturnMetric {
      symbol: string;
      avgReturn: number;
      risk: number;
      sharpeRatio: number; 
      sector: string;
}

export interface OptionLeg {
    id: string;
    type: string;
    position: string;
    strike: number;
    premium: number;
    iv: number;
    delta: number;
    theta: number;
    gamma: number;
    vega: number;
}

export interface PayoffPoint {
    price: number;
    pnl: number;
}

export interface MarketReportItem {
            symbol: string;
            sector: string;
            price: number;
            changePercent: number;
            volume: number;
            rsi: number;
            sma50: number;
            volatility: number;
            peRatio: number;
            marketCap: number;
            signal: string;
}

export interface PredictionData {
            date: string;
            actual?: number;
            isForecast: boolean;
            cnnPrediction?: number;
            rnnPrediction?: number;
}

export interface ForecastResult {
        symbol: string;
        currentPrice: number;
        predictedPrice: number;
        growthPercent: number;
        confidence: number; 
        recommendation: 'BUY' | 'HOLD' | 'SELL';
        modelData: PredictionData[];
}

export enum ViewMode {
    MARKET_OVERVIEW = 'MARKET_OVERVIEW',
    MARKET_REPORT = 'MARKET_REPORT',
    CORRELATION_NETWORK = 'CORRELATION_NETWORK',
    FORECASTING = 'FORECASTING',
    COMPARISON = 'COMPARISON',
    STRATEGY_BUILDER = 'STRATEGY_BUILDER',
    ADVANCED_EDA = 'ADVANCED_EDA',
    PORTFOLIO_TOOLS = 'PORTFOLIO_TOOLS',
    TECHNICAL_ANALYSIS = 'TECHNICAL_ANALYSIS',
    SECTOR_ANALYSIS = 'SECTOR_ANALYSIS',
    FUNDAMENTAL_REPORT = 'FUNDAMENTAL_REPORT'
}

export interface PriceAlert {
    id: string;
    symbol: string;
    targetPrice: number;
    condition: 'GE' | 'LE';
    triggered: boolean;
    createdAt: string;
}

export interface PortfolioItem {
    symbol: string;
    qty: number;
    buyPrice: number;
    cmp: number;
    pnl: number;
    sector: string;
}