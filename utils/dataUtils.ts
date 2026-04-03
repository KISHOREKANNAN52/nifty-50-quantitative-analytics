import { StockData, CompanyProfile, FundamentalData, TechnicalLevels, GraphData, CorrelationNode, CorrelationLink, RiskReturnMetric, OptionLeg, PayoffPoint, MarketReportItem, ForecastResult, PredictionData } from "../types";

// Full NIFTY 50 List
export const NIFTY_COMPANIES: CompanyProfile[] = [
  { symbol: 'RELIANCE', name: 'Reliance Industries', sector: 'Energy' },
  { symbol: 'TCS', name: 'Tata Consultancy Services', sector: 'IT' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank', sector: 'Financial Services' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank', sector: 'Financial Services' },
  { symbol: 'INFY', name: 'Infosys', sector: 'IT' },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever', sector: 'Consumer Goods' },
  { symbol: 'ITC', name: 'ITC Ltd', sector: 'Consumer Goods' },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services' },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel', sector: 'Telecom' },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', sector: 'Financial Services' },
  { symbol: 'LICI', name: 'LIC India', sector: 'Financial Services' },
  { symbol: 'LT', name: 'Larsen & Toubro', sector: 'Construction' },
  { symbol: 'HCLTECH', name: 'HCL Technologies', sector: 'IT' },
  { symbol: 'AXISBANK', name: 'Axis Bank', sector: 'Financial Services' },
  { symbol: 'ASIANPAINT', name: 'Asian Paints', sector: 'Consumer Goods' },
  { symbol: 'MARUTI', name: 'Maruti Suzuki', sector: 'Automobile' },
  { symbol: 'SUNPHARMA', name: 'Sun Pharma', sector: 'Pharma' },
  { symbol: 'TITAN', name: 'Titan Company', sector: 'Consumer Goods' },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance', sector: 'Financial Services' },
  { symbol: 'ULTRACEMCO', name: 'UltraTech Cement', sector: 'Cement' },
  { symbol: 'ONGC', name: 'ONGC', sector: 'Energy' },
  { symbol: 'NTPC', name: 'NTPC', sector: 'Energy' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors', sector: 'Automobile' },
  { symbol: 'POWERGRID', name: 'Power Grid Corp', sector: 'Energy' },
  { symbol: 'WIPRO', name: 'Wipro', sector: 'IT' },
  { symbol: 'M&M', name: 'Mahindra & Mahindra', sector: 'Automobile' },
  { symbol: 'ADANIENT', name: 'Adani Enterprises', sector: 'Metals & Mining' },
  { symbol: 'JSWSTEEL', name: 'JSW Steel', sector: 'Metals & Mining' },
  { symbol: 'TATASTEEL', name: 'Tata Steel', sector: 'Metals & Mining' },
  { symbol: 'COALINDIA', name: 'Coal India', sector: 'Metals & Mining' },
  { symbol: 'ADANIPORTS', name: 'Adani Ports', sector: 'Services' },
  { symbol: 'BAJAJFINSV', name: 'Bajaj Finserv', sector: 'Financial Services' },
  { symbol: 'GRASIM', name: 'Grasim Industries', sector: 'Cement' },
  { symbol: 'CIPLA', name: 'Cipla', sector: 'Pharma' },
  { symbol: 'TECHM', name: 'Tech Mahindra', sector: 'IT' },
  { symbol: 'HINDALCO', name: 'Hindalco', sector: 'Metals & Mining' },
  { symbol: 'DRREDDY', name: 'Dr Reddys Labs', sector: 'Pharma' },
  { symbol: 'EICHERMOT', name: 'Eicher Motors', sector: 'Automobile' },
  { symbol: 'INDUSINDBK', name: 'IndusInd Bank', sector: 'Financial Services' },
  { symbol: 'NESTLEIND', name: 'Nestle India', sector: 'Consumer Goods' },
  { symbol: 'BPCL', name: 'BPCL', sector: 'Energy' },
  { symbol: 'DIVISLAB', name: 'Divis Labs', sector: 'Pharma' },
  { symbol: 'APOLLOHOSP', name: 'Apollo Hospitals', sector: 'Healthcare' },
  { symbol: 'SBILIFE', name: 'SBI Life', sector: 'Financial Services' },
  { symbol: 'BRITANNIA', name: 'Britannia', sector: 'Consumer Goods' },
  { symbol: 'TATACONSUM', name: 'Tata Consumer', sector: 'Consumer Goods' },
  { symbol: 'BAJAJ-AUTO', name: 'Bajaj Auto', sector: 'Automobile' },
  { symbol: 'HEROMOTOCO', name: 'Hero MotoCorp', sector: 'Automobile' },
  { symbol: 'UPL', name: 'UPL', sector: 'Chemicals' }
];

const randn_bm = () => {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

export const generateNiftyData = (): StockData[] => {
  const data: StockData[] = [];
  const days = 300; 
  const now = new Date();
  
  // Basic Price Map
  const bases: Record<string, number> = {};
  NIFTY_COMPANIES.forEach(c => bases[c.symbol] = Math.random() * 3000 + 100);

  NIFTY_COMPANIES.forEach(company => {
    let price = bases[company.symbol];
    const sectorBias = company.sector === 'IT' ? 0.0002 : company.sector === 'Financial Services' ? -0.0001 : 0.0001;

    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const volatility = 0.015; 
      const change = price * (sectorBias + (randn_bm() * volatility));
      
      const close = price + change;
      const open = price + (randn_bm() * volatility * 0.5);
      const high = Math.max(open, close) * (1 + Math.abs(randn_bm() * 0.01));
      const low = Math.min(open, close) * (1 - Math.abs(randn_bm() * 0.01));
      const volume = Math.floor(Math.abs(randn_bm() * 1000000) + 500000);

      data.push({
        symbol: company.symbol,
        date: date.toISOString().split('T')[0],
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(close.toFixed(2)),
        volume,
        sector: company.sector
      });

      price = close;
    }
  });

  return data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// --- ADVANCED EDA CALCULATIONS ---

export const calculateRollingVolatility = (data: StockData[], window: number = 21): {date: string, value: number}[] => {
    if (data.length < window) return [];
    
    // Calculate returns first
    const returns = [];
    for(let i=1; i<data.length; i++) {
        returns.push((data[i].close - data[i-1].close) / data[i-1].close);
    }

    const rollingVol = [];
    for(let i = window; i < returns.length; i++) {
        const slice = returns.slice(i-window, i);
        const mean = slice.reduce((a,b) => a+b, 0) / window;
        const variance = slice.reduce((a,b) => a + Math.pow(b - mean, 2), 0) / window;
        // Annualized Volatility
        const vol = Math.sqrt(variance) * Math.sqrt(252) * 100;
        rollingVol.push({
            date: data[i+1].date, // Align with the end of window
            value: vol
        });
    }
    return rollingVol;
};

export const calculateDrawdownSeries = (data: StockData[]): {date: string, value: number}[] => {
    let peak = -Infinity;
    return data.map(d => {
        if (d.close > peak) peak = d.close;
        const dd = ((d.close - peak) / peak) * 100;
        return { date: d.date, value: dd };
    });
};

export const calculateAdvancedMetrics = (data: StockData[]): RiskReturnMetric[] => {
  const grouped: Record<string, number[]> = {};
  const sectors: Record<string, string> = {};

  data.forEach(d => {
    if (!grouped[d.symbol]) {
        grouped[d.symbol] = [];
        sectors[d.symbol] = d.sector;
    }
    grouped[d.symbol].push(d.close);
  });

  return Object.keys(grouped).map(symbol => {
    const prices = grouped[symbol];
    const returns = [];
    for(let i=1; i<prices.length; i++) {
        returns.push((prices[i] - prices[i-1])/prices[i-1]);
    }

    const avgDailyRet = returns.reduce((a, b) => a + b, 0) / returns.length;
    const annualReturn = avgDailyRet * 252 * 100;
    
    // Std Dev
    const variance = returns.reduce((sum, val) => sum + Math.pow(val - avgDailyRet, 2), 0) / returns.length;
    const dailyVol = Math.sqrt(variance);
    const annualVol = dailyVol * Math.sqrt(252) * 100;

    return {
      symbol,
      avgReturn: annualReturn,
      risk: annualVol,
      sharpeRatio: annualVol === 0 ? 0 : (annualReturn - 5) / annualVol, 
      sector: sectors[symbol]
    };
  });
};

export const getCorrelationNetwork = (data: StockData[]): GraphData => {
    // Simplified logic for brevity, reused from previous
    const symbols = Array.from(new Set(data.map(d => d.symbol))).slice(0, 30); // Limit nodes for performance
    const pivot: Record<string, Record<string, number>> = {};
    const sectors = new Map();
    
    data.filter(d => symbols.includes(d.symbol)).forEach(d => {
        if(!pivot[d.date]) pivot[d.date] = {};
        pivot[d.date][d.symbol] = d.close;
        sectors.set(d.symbol, d.sector);
    });

    const dates = Object.keys(pivot).sort();
    const returns: Record<string, number[]> = {};
    symbols.forEach(s => returns[s] = []);
    
    for(let i=1; i<dates.length; i++) {
        const prev = pivot[dates[i-1]];
        const curr = pivot[dates[i]];
        symbols.forEach(sym => {
            if(prev[sym] && curr[sym]) returns[sym].push((curr[sym] - prev[sym]) / prev[sym]);
            else returns[sym].push(0);
        });
    }

    const nodes: CorrelationNode[] = symbols.map(s => ({ id: s, group: sectors.get(s) || 'Other', val: 1 }));
    const links: CorrelationLink[] = [];
    
    // Degree centrality map for enhanced topology
    const degrees: Record<string, number> = {};
    symbols.forEach(s => degrees[s] = 0);

    for(let i=0; i<symbols.length; i++) {
        for(let j=i+1; j<symbols.length; j++) {
            const symA = symbols[i];
            const symB = symbols[j];
            const retA = returns[symA];
            const retB = returns[symB];
            let match = 0;
            for(let k=0; k<retA.length; k++) {
                if ((retA[k] > 0 && retB[k] > 0) || (retA[k] < 0 && retB[k] < 0)) match++;
            }
            const corr = (match / retA.length) * 2 - 1; 

            if (corr > 0.65) {
                links.push({ source: symA, target: symB, value: corr });
                degrees[symA] = (degrees[symA] || 0) + 1;
                degrees[symB] = (degrees[symB] || 0) + 1;
            }
        }
    }
    
    // Update node values based on degree centrality (for sizing)
    nodes.forEach(n => {
        n.val = Math.max(1, degrees[n.id]);
    });

    return { nodes, links };
};

// --- OPTIONS MATH ---

// Generate Payoff Chart Data
export const calculateOptionPayoff = (legs: OptionLeg[], currentPrice: number): PayoffPoint[] => {
    const range = currentPrice * 0.2; // +/- 20%
    const minPrice = Math.floor(currentPrice - range);
    const maxPrice = Math.ceil(currentPrice + range);
    const points: PayoffPoint[] = [];

    for(let p = minPrice; p <= maxPrice; p += (range/20)) {
        let totalPnl = 0;
        legs.forEach(leg => {
            let valueAtExpiry = 0;
            if (leg.type === 'Call') {
                valueAtExpiry = Math.max(0, p - leg.strike);
            } else {
                valueAtExpiry = Math.max(0, leg.strike - p);
            }

            if (leg.position === 'Long') {
                totalPnl += (valueAtExpiry - leg.premium);
            } else {
                totalPnl += (leg.premium - valueAtExpiry);
            }
        });
        points.push({ price: p, pnl: totalPnl });
    }
    return points;
};

// Technical & Fundamental
export const calculateTechnicalLevels = (data: StockData[]): TechnicalLevels => {
    const prices = data.map(d => d.close);
    const dates = data.map(d => d.date);
    const peaks: { date: string, price: number }[] = [];
    const troughs: { date: string, price: number }[] = [];
    
    for(let i = 5; i < prices.length - 5; i++) {
        const slice = prices.slice(i-5, i+6);
        const current = prices[i];
        if (slice.every(p => p <= current)) peaks.push({ date: dates[i], price: current });
        if (slice.every(p => p >= current)) troughs.push({ date: dates[i], price: current });
    }

    const resistance = peaks.map(p => p.price).sort((a,b) => b-a).slice(0, 3);
    const support = troughs.map(t => t.price).sort((a,b) => a-b).slice(0, 3);
    return { support, resistance, peaks, troughs };
};

export const calculateFundamentals = (symbol: string, currentPrice: number): FundamentalData => {
    const sharesOutstanding = Math.floor(Math.random() * 400) + 50; 
    const marketCap = (currentPrice * sharesOutstanding); 
    const targetPB = (Math.random() * 6) + 1.5; 
    const bookValuePerShare = currentPrice / targetPB;
    return {
        symbol,
        price: currentPrice,
        sharesOutstanding,
        marketCap,
        totalAssets: bookValuePerShare * sharesOutstanding * 2,
        totalLiabilities: bookValuePerShare * sharesOutstanding,
        bookValuePerShare,
        pbRatio: currentPrice / bookValuePerShare,
        eps: currentPrice / ((Math.random() * 40) + 10),
        peRatio: (Math.random() * 40) + 10,
        roe: Math.random() * 25
    };
};

export const calculateSMA = (prices: number[], period: number): (number | null)[] => {
  return prices.map((_, idx, arr) => {
    if (idx < period - 1) return null;
    return arr.slice(idx - period + 1, idx + 1).reduce((acc, val) => acc + val, 0) / period;
  });
};

export const calculateBollingerBands = (prices: number[], period = 20, multiplier = 2) => {
    const sma = calculateSMA(prices, period);
    return prices.map((price, i) => {
        if (i < period - 1) return { upper: null, lower: null, middle: null };
        const slice = prices.slice(i - period + 1, i + 1);
        const mean = sma[i] || 0;
        const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
        const stdDev = Math.sqrt(variance);
        return {
            middle: mean,
            upper: mean + (multiplier * stdDev),
            lower: mean - (multiplier * stdDev)
        };
    });
};

export const calculateMACD = (prices: number[], fast = 12, slow = 26, signal = 9) => {
    const getEMA = (data: number[], p: number) => {
        const k = 2 / (p + 1);
        let emaArray = [data[0]];
        for (let i = 1; i < data.length; i++) {
            emaArray.push(data[i] * k + emaArray[i - 1] * (1 - k));
        }
        return emaArray;
    };

    const fastEMA = getEMA(prices, fast);
    const slowEMA = getEMA(prices, slow);
    const macdLine = fastEMA.map((val, i) => val - slowEMA[i]);
    const signalLine = getEMA(macdLine, signal);
    const histogram = macdLine.map((val, i) => val - signalLine[i]);

    return prices.map((_, i) => ({
        macd: macdLine[i],
        signal: signalLine[i],
        histogram: histogram[i]
    }));
};

// --- REPORT UTILS ---

export const calculateRSI = (prices: number[], period: number = 14): number => {
    if (prices.length < period + 1) return 50;
    
    let gains = 0;
    let losses = 0;
    
    // First average
    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i-1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Smooth
    for (let i = period + 1; i < prices.length; i++) {
        const change = prices[i] - prices[i-1];
        const gain = change > 0 ? change : 0;
        const loss = change < 0 ? Math.abs(change) : 0;
        
        avgGain = (avgGain * (period - 1) + gain) / period;
        avgLoss = (avgLoss * (period - 1) + loss) / period;
    }
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
};

export const generateMarketReport = (data: StockData[]): MarketReportItem[] => {
    // Group by symbol first
    const grouped: Record<string, StockData[]> = {};
    data.forEach(d => {
        if (!grouped[d.symbol]) grouped[d.symbol] = [];
        grouped[d.symbol].push(d);
    });

    return Object.keys(grouped).map(symbol => {
        const stockData = grouped[symbol]; // Sorted by date already from generateNiftyData
        const latest = stockData[stockData.length - 1];
        const prev = stockData[stockData.length - 2] || latest;
        
        const prices = stockData.map(d => d.close);
        const rsi = calculateRSI(prices);
        
        // SMA 50
        const sma50Series = calculateSMA(prices, 50);
        const sma50 = sma50Series[sma50Series.length - 1] || 0;

        // Volatility
        const volSeries = calculateRollingVolatility(stockData, 20);
        const volatility = volSeries.length > 0 ? volSeries[volSeries.length - 1].value : 0;

        // Simulated Fundamental for report
        const peRatio = 15 + (Math.random() * 25);
        const marketCap = latest.close * (100 + Math.random() * 500); // Mock MC

        // Signal Logic
        let signal: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL' = 'NEUTRAL';
        if (rsi < 30 && latest.close > sma50) signal = 'STRONG BUY';
        else if (rsi < 40) signal = 'BUY';
        else if (rsi > 70 && latest.close < sma50) signal = 'STRONG SELL';
        else if (rsi > 60) signal = 'SELL';

        return {
            symbol,
            sector: latest.sector,
            price: latest.close,
            changePercent: ((latest.close - prev.close) / prev.close) * 100,
            volume: latest.volume,
            rsi,
            sma50,
            volatility,
            peRatio,
            marketCap,
            signal
        };
    });
};

// --- FORECASTING: DEEP LEARNING SIMULATION ---

// Simulate CNN 1D Convolution for feature extraction + trend smoothing
// Concepts: Sliding Window, Weighted Kernels (Filters), Pooling
const simulateCNNPrediction = (prices: number[], futureSteps: number): number[] => {
    const predictions: number[] = [];
    let currentSequence = prices.slice(prices.length - 10); // Last 10 days context window
    
    // Simple 1D Convolution Filter (Edge/Trend Detection)
    // In a real model, these weights are learned.
    const kernel = [0.1, 0.2, 0.4, 0.2, 0.1]; 

    for(let i=0; i<futureSteps; i++) {
        // Convolve
        let convSum = 0;
        // Apply kernel to the end of the sequence
        for(let k=0; k<kernel.length; k++) {
            convSum += currentSequence[currentSequence.length - 1 - k] * kernel[k];
        }
        
        // Non-linearity & Bias (ReLu simulated)
        let nextVal = convSum > 0 ? convSum : 0;
        
        // Add a small "learned" drift factor based on recent momentum
        const momentum = (currentSequence[currentSequence.length-1] - currentSequence[currentSequence.length-5]) / 5;
        nextVal += momentum * 0.8; 

        predictions.push(nextVal);
        currentSequence.push(nextVal); // Auto-regressive step for next prediction
    }
    return predictions;
};

// Simulate RNN (LSTM/GRU) for sequence memory
// Concepts: Hidden State, Forget Gate simulation, Tanh activation
const simulateRNNPrediction = (prices: number[], futureSteps: number): number[] => {
    const predictions: number[] = [];
    
    // Initialize hidden state
    let h_t = 0; 
    let c_t = 0; // Cell state (LSTM concept)

    // "Train" states on history (Forward Pass)
    const historyWindow = prices.slice(prices.length - 30);
    let lastPrice = historyWindow[0];

    // Simplified LSTM cell simulation
    historyWindow.forEach(price => {
        const input = price - lastPrice; // Delta
        // Forget gate (decay)
        c_t = c_t * 0.5 + input; 
        // Output gate
        h_t = Math.tanh(c_t);
        lastPrice = price;
    });

    // Predict Future
    let currentPrice = prices[prices.length - 1];
    
    for(let i=0; i<futureSteps; i++) {
        // Recursive prediction using state
        const input = h_t * (1 + (Math.random() * 0.05)); // Feedback loop
        c_t = c_t * 0.8 + input; // Decay state
        h_t = Math.tanh(c_t);

        // Project back to price space
        // Add some noise and trend amplification
        const change = h_t * (currentPrice * 0.02); 
        currentPrice += change;
        
        predictions.push(currentPrice);
    }
    
    return predictions;
};

export const generateForecast = (data: StockData[], symbol: string): ForecastResult | null => {
    const stockData = data.filter(d => d.symbol === symbol);
    if (stockData.length < 50) return null;

    const prices = stockData.map(d => d.close);
    const currentPrice = prices[prices.length - 1];
    
    // Generate 7 days future
    const modelData: PredictionData[] = [];
    
    // Add historical context (last 30 days)
    stockData.slice(stockData.length - 30).forEach((d) => {
        modelData.push({
            date: d.date,
            actual: d.close,
            isForecast: false
        });
    });

    const lastDate = new Date(stockData[stockData.length - 1].date);
    
    // Run Models
    const cnnPreds = simulateCNNPrediction(prices, 7);
    const rnnPreds = simulateRNNPrediction(prices, 7);

    for(let i = 0; i < 7; i++) {
        const nextDate = new Date(lastDate);
        nextDate.setDate(lastDate.getDate() + (i + 1));
        const dateStr = nextDate.toISOString().split('T')[0];

        modelData.push({
            date: dateStr,
            cnnPrediction: cnnPreds[i],
            rnnPrediction: rnnPreds[i],
            isForecast: true
        });
    }

    // Ensemble result (Average of CNN and RNN)
    const finalPredictedPrice = (cnnPreds[6] + rnnPreds[6]) / 2;
    const growthPercent = ((finalPredictedPrice - currentPrice) / currentPrice) * 100;

    let recommendation: 'BUY' | 'HOLD' | 'SELL' = 'HOLD';
    if (growthPercent > 1.5) recommendation = 'BUY';
    else if (growthPercent < -1.5) recommendation = 'SELL';

    return {
        symbol,
        currentPrice,
        predictedPrice: finalPredictedPrice,
        growthPercent,
        confidence: 0.85, // Higher confidence with DL models
        recommendation,
        modelData
    };
};