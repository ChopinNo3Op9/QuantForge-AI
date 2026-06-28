import { useState } from 'react';
import { Settings, Play, Database, DollarSign, SlidersHorizontal, Cpu } from 'lucide-react';
import { cn } from '../lib/utils';

export function Sidebar({ onRunBacktest }: { onRunBacktest: (config: any) => void }) {
  const [ticker, setTicker] = useState('SPY');
  const [strategyName, setStrategyName] = useState('Trend Following');
  const [dateRange, setDateRange] = useState('Last 5 Years');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [fastSma, setFastSma] = useState(50);
  const [slowSma, setSlowSma] = useState(200);

  const handleRun = () => {
    onRunBacktest({
      ticker,
      strategyName,
      dateRange,
      initialCapital,
      fastSma,
      slowSma
    });
  };

  return (
    <div className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col h-full overflow-y-auto z-10 sticky top-0 hide-scrollbar">
      <div className="p-4 border-b border-[#30363d] flex items-center space-x-2">
        <Cpu className="w-6 h-6 text-[#00FFAA]" />
        <div>
          <h1 className="text-lg font-bold text-white tracking-tight leading-tight">QuantForge</h1>
          <p className="text-[10px] text-[#8b949e] uppercase tracking-wider font-semibold">Research Platform</p>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-6">
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider flex items-center">
            <Database className="w-3.5 h-3.5 mr-1.5" />
            Data & Strategy
          </h3>
          
          <div className="space-y-1.5">
            <label className="text-xs text-[#c9d1d9] font-medium">Strategy Selection</label>
            <select 
              value={strategyName}
              onChange={(e) => setStrategyName(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#58a6ff] transition-all appearance-none"
            >
              <option>Trend Following</option>
              <option>Mean Reversion</option>
              <option>Statistical Arbitrage</option>
              <option>Momentum Breakout</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#c9d1d9] font-medium">Primary Ticker</label>
            <input 
              type="text" 
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#c9d1d9] font-medium">Date Range</label>
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#58a6ff] transition-all appearance-none"
            >
              <option>Last 10 Years</option>
              <option>Last 5 Years</option>
              <option>Year to Date</option>
              <option>Custom Range...</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider flex items-center">
            <Settings className="w-3.5 h-3.5 mr-1.5" />
            Execution Params
          </h3>
          <div className="space-y-1.5">
            <label className="text-xs text-[#c9d1d9] font-medium">Initial Capital ($)</label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#8b949e]" />
              <input 
                type="number" 
                value={initialCapital}
                onChange={(e) => setInitialCapital(Number(e.target.value))}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#58a6ff] transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-[#c9d1d9] font-medium">Transaction Costs (%)</label>
            <input 
              type="number" 
              defaultValue={0.1}
              step={0.01}
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#58a6ff] transition-all"
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5" />
            Strategy Params
          </h3>
          
          <div className="bg-[#0d1117] border border-[#30363d] rounded-md p-3 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs text-[#c9d1d9]">Fast SMA</label>
                <span className="text-xs text-[#58a6ff] font-mono">{fastSma}</span>
              </div>
              <input 
                type="range" min="10" max="100" 
                value={fastSma}
                onChange={(e) => setFastSma(Number(e.target.value))}
                className="w-full accent-[#58a6ff]" 
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label className="text-xs text-[#c9d1d9]">Slow SMA</label>
                <span className="text-xs text-[#58a6ff] font-mono">{slowSma}</span>
              </div>
              <input 
                type="range" min="50" max="300" 
                value={slowSma}
                onChange={(e) => setSlowSma(Number(e.target.value))}
                className="w-full accent-[#58a6ff]" 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#30363d]">
        <button 
          onClick={handleRun}
          className="w-full bg-[#238636] hover:bg-[#2ea043] text-white rounded-md py-2 px-4 text-sm font-semibold shadow-sm flex items-center justify-center transition-colors"
        >
          <Play className="w-4 h-4 mr-2" fill="currentColor" />
          Run Backtest
        </button>
      </div>
    </div>
  );
}
