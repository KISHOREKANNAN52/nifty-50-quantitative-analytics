import React from 'react';
import { FundamentalData } from '../types';

export const FundamentalCard: React.FC<{ data: FundamentalData }> = ({ data }) => {
    return (
        <div className="bg-slate-800 rounded-xl border border-slate-700 shadow-lg p-6">
            <h3 className="text-xl font-bold text-slate-100 mb-6 border-b border-slate-700 pb-2">
                Fundamental Analysis: {data.symbol}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase font-semibold">Current Price</div>
                    <div className="text-2xl font-bold text-white mt-1">₹{data.price.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">Latest Close</div>
                </div>

                {/* Metric 2 */}
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase font-semibold">Book Value / Share</div>
                    <div className="text-2xl font-bold text-blue-400 mt-1">₹{data.bookValuePerShare.toFixed(2)}</div>
                    <div className="text-xs text-slate-500 mt-1">
                        (Assets - Liab) / Shares
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase font-semibold">P/B Ratio</div>
                    <div className="text-2xl font-bold text-yellow-400 mt-1">{data.pbRatio.toFixed(2)}x</div>
                    <div className="text-xs text-slate-500 mt-1">Price / BVPS</div>
                </div>

                {/* Metric 4 */}
                <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="text-slate-400 text-xs uppercase font-semibold">Market Cap</div>
                    <div className="text-2xl font-bold text-green-400 mt-1">₹{(data.marketCap / 1000).toFixed(1)}T</div>
                    <div className="text-xs text-slate-500 mt-1">Total Valuation</div>
                </div>
            </div>

            <div className="mt-8 bg-slate-900 rounded-lg p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-slate-200 mb-4">Detailed Financial Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 text-sm">
                    <div>
                        <span className="text-slate-500 block">Total Assets</span>
                        <span className="text-slate-200 font-medium">₹{data.totalAssets.toFixed(0)} Cr</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Total Liabilities</span>
                        <span className="text-slate-200 font-medium">₹{data.totalLiabilities.toFixed(0)} Cr</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Shares Outstanding</span>
                        <span className="text-slate-200 font-medium">{data.sharesOutstanding} Cr</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">Return on Equity (ROE)</span>
                        <span className="text-slate-200 font-medium">{data.roe.toFixed(2)}%</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">EPS (TTM)</span>
                        <span className="text-slate-200 font-medium">₹{data.eps.toFixed(2)}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block">P/E Ratio</span>
                        <span className="text-slate-200 font-medium">{data.peRatio.toFixed(2)}x</span>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-400 mb-2">Fundamental Interpretation</h4>
                <p className="text-sm text-slate-300 leading-relaxed bg-slate-700/30 p-4 rounded border-l-4 border-blue-500">
                    {data.pbRatio < 1.5 ? (
                        "The stock is potentially undervalued relative to its book value (P/B < 1.5). This could indicate a value investing opportunity or that the market expects lower future growth."
                    ) : data.pbRatio > 5 ? (
                        "The stock trades at a significant premium to its book value (P/B > 5). Investors are likely pricing in high future growth or strong brand equity/intangible assets not captured in BV."
                    ) : (
                        "The stock is trading at a moderate valuation relative to its assets. Standard range for stable Nifty 50 companies."
                    )}
                    {" "}
                    With an ROE of <strong>{data.roe.toFixed(1)}%</strong>, the company is generating {data.roe > 15 ? "strong" : "moderate"} returns on shareholder equity.
                </p>
            </div>
        </div>
    );
};
