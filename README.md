# QuantForge

QuantForge is an advanced quantitative trading research platform and backtesting engine. It allows researchers and algorithmic traders to analyze financial data, develop trading strategies, and backtest them against historical market data.

## Features

- **Backtesting Engine**: Simulate trading strategies against historical price data to evaluate their performance.
- **Data Visualization**: Interactive candlestick charts with brushing and zooming capabilities to explore market trends.
- **Strategy Analytics**: Comprehensive metrics including Total Return, Sharpe Ratio, Max Drawdown, Win Rate, and more.
- **Real-time Data**: Integration with Yahoo Finance to pull historical stock data.
- **Responsive UI**: A sleek, modern dashboard built with React and Tailwind CSS.

## Demo

<div align="center">
  <img src="https://raw.githubusercontent.com/ChopinNo3Op9/QuantForge-AI/main/demo.gif" 
       alt="QuantForge Demo" 
       width="85%">
</div>

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Architecture

- **Frontend**: React, Tailwind CSS, Recharts, ApexCharts
- **Backend**: Express server with Vite middleware for serving the React application
- **Data Sources**: `yahoo-finance2` for fetching market data

## License

MIT License
