import { TrendingUp, Activity, BarChart3, PieChart, Info, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Line, ComposedChart, BarChart as RechartsBarChart, Bar, Cell } from 'recharts';
import Chart from 'react-apexcharts';
import { BacktestResult } from '../lib/backtestUtils';

export function Dashboard({ data }: { data: BacktestResult }) {
  if (!data) return null;
  const { metrics, performanceData, heatmapData, tradeDistribution } = data;

  const hasCandles = performanceData.length > 0 && performanceData[0].open !== undefined;
  
  const candlestickSeries = hasCandles ? [{
    data: performanceData.map(d => ({
      x: d.rawDate ? new Date(d.rawDate).getTime() : new Date(d.date).getTime(),
      y: [d.open, d.high, d.low, d.close]
    }))
  }] : [];

  const candlestickOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'candlestick',
      foreColor: '#8b949e',
      toolbar: { show: false },
      animations: { enabled: false },
      background: 'transparent'
    },
    tooltip: {
      theme: 'dark',
    },
    xaxis: {
      type: 'datetime',
      axisBorder: { color: '#30363d' },
      axisTicks: { color: '#30363d' },
    },
    yaxis: {
      tooltip: { enabled: true },
      labels: { formatter: (val) => val.toFixed(2) }
    },
    grid: {
      borderColor: '#30363d',
      strokeDashArray: 3
    },
    plotOptions: {
      candlestick: {
        colors: {
          upward: '#00FFAA',
          downward: '#f85149'
        }
      }
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      
      {/* Simulation Warning */}
      {!hasCandles && (
        <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/30 rounded-lg p-3 flex items-center text-[#58a6ff] text-sm">
          <Info className="w-4 h-4 mr-2 flex-shrink-0" />
          <p><strong>Simulation Mode:</strong> The backtest results are currently simulated. Failed to fetch real market data.</p>
        </div>
      )}

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Total Return" value={metrics.totalReturn} subtext={`vs Benchmark: ${metrics.benchmarkReturn}`} icon={TrendingUp} color="text-[#00FFAA]" />
        <MetricCard title="Sharpe Ratio" value={metrics.sharpeRatio} subtext="Annualized (Rf = 2%)" icon={Activity} color="text-[#58a6ff]" />
        <MetricCard title="Max Drawdown" value={metrics.maxDrawdown} subtext={`Calmar Ratio: ${metrics.calmarRatio}`} icon={BarChart3} color="text-[#f85149]" />
        <MetricCard title="Win Rate" value={metrics.winRate} subtext={`Profit Factor: ${metrics.profitFactor}`} icon={PieChart} color="text-[#a371f7]" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <MetricCard title="Sortino Ratio" value={metrics.sortinoRatio} subtext="Downside deviation" color="text-[#c9d1d9]" compact />
        <MetricCard title="Volatility" value={metrics.volatility} subtext="Annualized std dev" color="text-[#c9d1d9]" compact />
        <MetricCard title="Total Trades" value={metrics.totalTrades} subtext="Avg duration: 12 days" color="text-[#c9d1d9]" compact />
        <MetricCard title="Expectancy" value={metrics.expectancy} subtext="Per trade average" color="text-[#c9d1d9]" compact />
      </div>

      {/* Main Charts */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center">
            Equity Curve & Drawdown
            <Info className="w-4 h-4 ml-2 text-[#8b949e] cursor-help" />
          </h3>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] hover:bg-[#30363d] transition-colors">Log Scale</button>
            <button className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-xs text-[#c9d1d9] hover:bg-[#30363d] transition-colors flex items-center">
              <Download className="w-3 h-3 mr-1" /> Export
            </button>
          </div>
        </div>
        
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStrategy" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FFAA" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#00FFAA" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f85149" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f85149" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
              <XAxis dataKey="date" stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} tickLine={false} axisLine={false} minTickGap={50} />
              <YAxis yAxisId="left" stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 12}} tickLine={false} axisLine={false} domain={['dataMin - 1000', 'auto']} />
              <YAxis yAxisId="right" orientation="right" stroke="#f85149" tick={{fill: '#f85149', fontSize: 12}} tickLine={false} axisLine={false} />
              
              <RechartsTooltip 
                contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#c9d1d9' }}
              />
              
              <Area yAxisId="left" type="monotone" dataKey="strategy" name="Strategy" stroke="#00FFAA" strokeWidth={2} fillOpacity={1} fill="url(#colorStrategy)" />
              <Line yAxisId="left" type="monotone" dataKey="benchmark" name="Benchmark" stroke="#8b949e" strokeWidth={2} dot={false} strokeDasharray="5 5" />
              <Area yAxisId="right" type="step" dataKey="drawdown" name="Drawdown (%)" stroke="#f85149" strokeWidth={1} fill="url(#colorDrawdown)" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Price Candlesticks */}
      {hasCandles && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center">
              Asset Price History (Real Data)
            </h3>
          </div>
          <div className="h-[400px]">
             <Chart options={candlestickOptions} series={candlestickSeries} type="candlestick" height="100%" />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trade Distribution */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-bold text-white mb-4">Trade Distribution</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={tradeDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
                <XAxis dataKey="range" stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 11}} tickLine={false} axisLine={false} />
                <YAxis stroke="#8b949e" tick={{fill: '#8b949e', fontSize: 11}} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#c9d1d9', borderRadius: '0.5rem' }}
                  cursor={{fill: '#21262d'}}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {tradeDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.range.includes('-') ? '#f85149' : '#00FFAA'} opacity={0.8} />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mock Heatmap */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Monthly Returns (%)</h3>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-[#8b949e] uppercase bg-[#0d1117]">
                <tr>
                  <th className="px-4 py-2 rounded-tl-md">Month</th>
                  <th className="px-4 py-2">2021</th>
                  <th className="px-4 py-2">2022</th>
                  <th className="px-4 py-2 rounded-tr-md">2023</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row: any) => (
                  <tr key={row.month} className="border-b border-[#21262d]">
                    <td className="px-4 py-2 font-medium text-white">{row.month}</td>
                    {[row['2021'], row['2022'], row['2023']].map((val, i) => (
                      <td key={i} className={`px-4 py-2 font-mono ${val > 0 ? 'text-[#00FFAA]' : val < 0 ? 'text-[#f85149]' : 'text-[#8b949e]'}`}>
                        {val > 0 ? '+' : ''}{val}%
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtext, icon: Icon, color, compact }: any) {
  if (compact) {
    return (
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 shadow-sm flex flex-col">
        <h3 className="text-xs font-medium text-[#8b949e] mb-1">{title}</h3>
        <div className={`text-lg font-bold font-mono ${color || 'text-white'}`}>{value}</div>
        <p className="text-[10px] text-[#8b949e] mt-1">{subtext}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-current opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: color ? 'currentColor' : '#30363d' }}>
        <div className={`w-full h-full ${color}`} />
      </div>
      <div className="flex items-center justify-between pb-2">
        <h3 className="text-sm font-medium text-[#8b949e] uppercase tracking-wider">{title}</h3>
        {Icon && <Icon className={`w-5 h-5 ${color}`} />}
      </div>
      <div className="text-3xl font-bold text-white font-mono mt-1">{value}</div>
      <p className="text-xs text-[#8b949e] mt-2 font-medium bg-[#0d1117] inline-block px-2 py-1 rounded">{subtext}</p>
    </div>
  );
}
