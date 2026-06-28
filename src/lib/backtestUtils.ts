import { addMonths, format } from 'date-fns';

export interface BacktestConfig {
  ticker: string;
  dateRange: string;
  initialCapital: number;
  fastSma: number;
  slowSma: number;
  strategyName: string;
}

export interface BacktestResult {
  performanceData: any[];
  heatmapData: any[];
  tradeDistribution: any[];
  metrics: {
    totalReturn: string;
    benchmarkReturn: string;
    sharpeRatio: string;
    maxDrawdown: string;
    calmarRatio: string;
    winRate: string;
    profitFactor: string;
    sortinoRatio: string;
    volatility: string;
    totalTrades: string;
    expectancy: string;
  };
}

export function simulateBacktest(config: BacktestConfig): BacktestResult {
  // Randomness seeded by config parameters so it looks deterministic for the same params
  let seed = config.fastSma + config.slowSma + config.initialCapital + config.ticker.charCodeAt(0);
  const random = () => {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  const monthsCount = config.dateRange === 'Last 10 Years' ? 120 : config.dateRange === 'Last 5 Years' ? 60 : 12;
  
  const performanceData = [];
  let strategyEquity = config.initialCapital;
  let benchmarkEquity = config.initialCapital;
  let peakStrategyEquity = strategyEquity;
  
  // Drift and vol based on strategy
  let baseDrift = config.strategyName === 'Mean Reversion' ? 0.005 : 0.008;
  let baseVol = config.strategyName === 'Mean Reversion' ? 0.02 : 0.03;
  
  // Adjust based on SMA
  if (config.fastSma < 30) baseVol += 0.01;
  if (config.slowSma > 200) baseDrift -= 0.001;

  let currentDrawdown = 0;
  let maxDrawdown = 0;
  
  const startYear = 2024 - (monthsCount / 12);
  let currentDate = new Date(`${startYear}-01-01`);

  for (let i = 0; i < monthsCount; i++) {
    const stratReturn = baseDrift + (random() - 0.5) * baseVol;
    const benchReturn = 0.006 + (random() - 0.5) * 0.025;
    
    strategyEquity *= (1 + stratReturn);
    benchmarkEquity *= (1 + benchReturn);
    
    if (strategyEquity > peakStrategyEquity) {
      peakStrategyEquity = strategyEquity;
    }
    
    currentDrawdown = ((strategyEquity - peakStrategyEquity) / peakStrategyEquity) * 100;
    if (currentDrawdown < maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    performanceData.push({
      date: format(currentDate, 'yyyy-MM'),
      strategy: Math.round(strategyEquity),
      benchmark: Math.round(benchmarkEquity),
      drawdown: Number(currentDrawdown.toFixed(2))
    });

    currentDate = addMonths(currentDate, 1);
  }

  const totReturn = ((strategyEquity - config.initialCapital) / config.initialCapital) * 100;
  const bmkReturn = ((benchmarkEquity - config.initialCapital) / config.initialCapital) * 100;

  // Mock Trade Distribution
  const trades = Math.floor(random() * 200) + 50;
  const winRateVal = 40 + random() * 20;

  return {
    performanceData,
    heatmapData: [
      { month: 'Jan', '2021': (random()*5-2).toFixed(1), '2022': (random()*5-2).toFixed(1), '2023': (random()*5-2).toFixed(1) },
      { month: 'Feb', '2021': (random()*5-2).toFixed(1), '2022': (random()*5-2).toFixed(1), '2023': (random()*5-2).toFixed(1) },
      { month: 'Mar', '2021': (random()*5-2).toFixed(1), '2022': (random()*5-2).toFixed(1), '2023': (random()*5-2).toFixed(1) },
      { month: 'Apr', '2021': (random()*5-2).toFixed(1), '2022': (random()*5-2).toFixed(1), '2023': (random()*5-2).toFixed(1) },
      { month: 'May', '2021': (random()*5-2).toFixed(1), '2022': (random()*5-2).toFixed(1), '2023': (random()*5-2).toFixed(1) },
      { month: 'Jun', '2021': (random()*5-2).toFixed(1), '2022': (random()*5-2).toFixed(1), '2023': (random()*5-2).toFixed(1) },
    ],
    tradeDistribution: [
      { range: '<-5%', count: Math.floor(random()*10) },
      { range: '-5% to -2%', count: Math.floor(random()*30) },
      { range: '-2% to 0%', count: Math.floor(random()*50) },
      { range: '0% to 2%', count: Math.floor(random()*60) },
      { range: '2% to 5%', count: Math.floor(random()*40) },
      { range: '>5%', count: Math.floor(random()*15) },
    ],
    metrics: {
      totalReturn: `${totReturn >= 0 ? '+' : ''}${totReturn.toFixed(1)}%`,
      benchmarkReturn: `${bmkReturn >= 0 ? '+' : ''}${bmkReturn.toFixed(1)}%`,
      sharpeRatio: (0.8 + random() * 1.5).toFixed(2),
      maxDrawdown: `${maxDrawdown.toFixed(1)}%`,
      calmarRatio: (0.5 + random() * 2).toFixed(2),
      winRate: `${winRateVal.toFixed(1)}%`,
      profitFactor: (1.1 + random() * 1.0).toFixed(2),
      sortinoRatio: (1.0 + random() * 2.0).toFixed(2),
      volatility: `${(10 + random() * 15).toFixed(1)}%`,
      totalTrades: trades.toString(),
      expectancy: `$${(20 + random() * 200).toFixed(2)}`
    }
  };
}
