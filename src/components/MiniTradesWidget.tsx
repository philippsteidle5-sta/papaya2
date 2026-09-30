import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  Zap,
  BarChart2,
  Maximize2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  CheckCircle2,
  X,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";
import { DraggableResizableWidget } from "./DraggableResizableWidget";

interface MiniAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  vol24h: string;
}

interface MiniPosition {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage: number;
  pnl: number;
  pnlPercent: number;
}

interface MiniTradesWidgetProps {
  isEditMode?: boolean;
  onClose?: () => void;
  onOpenFullTerminal?: () => void;
}

const INITIAL_ASSETS: MiniAsset[] = [
  { symbol: "BTC/USD", name: "Bitcoin", price: 96420.5, change24h: 3.42, high24h: 97800, low24h: 94200, vol24h: "$1.2B" },
  { symbol: "SOL/USD", name: "Solana", price: 214.8, change24h: 8.15, high24h: 220, low24h: 198, vol24h: "$480M" },
  { symbol: "ETH/USD", name: "Ethereum", price: 3310.2, change24h: -1.05, high24h: 3420, low24h: 3280, vol24h: "$850M" },
  { symbol: "NVDA/USD", name: "NVIDIA", price: 128.4, change24h: 4.88, high24h: 131, low24h: 124, vol24h: "$2.1B" },
  { symbol: "GOLD/USD", name: "XAU Spot", price: 2650.1, change24h: 1.25, high24h: 2665, low24h: 2630, vol24h: "$620M" },
];

export const MiniTradesWidget: React.FC<MiniTradesWidgetProps> = ({
  isEditMode = false,
  onClose,
  onOpenFullTerminal,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC/USD");
  const [assets, setAssets] = useState<MiniAsset[]>(INITIAL_ASSETS);
  const [activeTab, setActiveTab] = useState<"chart" | "order" | "positions" | "orderbook">("chart");
  const [timeframe, setTimeframe] = useState<"1m" | "5m" | "15m" | "1h" | "1d">("5m");
  
  // Quick Order Pad States
  const [orderType, setOrderType] = useState<"LONG" | "SHORT">("LONG");
  const [orderAmount, setOrderAmount] = useState<number>(250);
  const [leverage, setLeverage] = useState<number>(10);
  const [openPositions, setOpenPositions] = useState<MiniPosition[]>([
    {
      id: "pos-1",
      symbol: "BTC/USD",
      type: "LONG",
      entryPrice: 95800.0,
      currentPrice: 96420.5,
      amount: 1000,
      leverage: 20,
      pnl: 129.43,
      pnlPercent: 12.94,
    },
    {
      id: "pos-2",
      symbol: "SOL/USD",
      type: "LONG",
      entryPrice: 205.0,
      currentPrice: 214.8,
      amount: 500,
      leverage: 10,
      pnl: 239.02,
      pnlPercent: 47.8,
    },
  ]);
  const [notification, setNotification] = useState<string | null>(null);

  // Live Chart Candlesticks simulation data
  const [chartData, setChartData] = useState<number[]>([
    95200, 95400, 95100, 95600, 95800, 95700, 96000, 95900, 96200, 96100, 96400, 96350, 96420
  ]);

  const activeAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  // High Frequency Live Price Feed Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          const deltaPct = (Math.random() - 0.48) * 0.004;
          const newPrice = Number((asset.price * (1 + deltaPct)).toFixed(asset.price < 500 ? 2 : 1));
          return {
            ...asset,
            price: newPrice,
            change24h: Number((asset.change24h + deltaPct * 20).toFixed(2)),
          };
        })
      );

      // Append price to active chart data
      setChartData((prev) => {
        const last = prev[prev.length - 1];
        const next = Number((last + (Math.random() - 0.48) * 40).toFixed(1));
        return [...prev.slice(1), next];
      });

      // Update positions PnL
      setOpenPositions((prevPos) =>
        prevPos.map((pos) => {
          const matched = assets.find((a) => a.symbol === pos.symbol);
          if (!matched) return pos;
          const priceDiff = matched.price - pos.entryPrice;
          const mult = pos.type === "LONG" ? 1 : -1;
          const rawPnl = ((priceDiff / pos.entryPrice) * pos.amount * pos.leverage * mult);
          const pnlPct = (rawPnl / pos.amount) * 100;
          return {
            ...pos,
            currentPrice: matched.price,
            pnl: Number(rawPnl.toFixed(2)),
            pnlPercent: Number(pnlPct.toFixed(2)),
          };
        })
      );
    }, 1800);

    return () => clearInterval(interval);
  }, [assets]);

  // Handle Quick Order Execution
  const handleExecuteTrade = () => {
    const newPos: MiniPosition = {
      id: `pos-${Date.now()}`,
      symbol: activeAsset.symbol,
      type: orderType,
      entryPrice: activeAsset.price,
      currentPrice: activeAsset.price,
      amount: orderAmount,
      leverage: leverage,
      pnl: 0,
      pnlPercent: 0,
    };

    setOpenPositions((prev) => [newPos, ...prev]);
    setNotification(`⚡ ${orderType} ORDER EXEC: ${activeAsset.symbol} ($${orderAmount} @ ${leverage}x)`);
    setActiveTab("positions");

    setTimeout(() => setNotification(null), 3000);
  };

  const handleClosePosition = (id: string) => {
    setOpenPositions((prev) => prev.filter((p) => p.id !== id));
    setNotification("✅ POSITION GLATTGESTELLT");
    setTimeout(() => setNotification(null), 2500);
  };

  // Header controls for widget
  const headerControls = (
    <div className="flex items-center gap-1.5">
      {onOpenFullTerminal && (
        <button
          onClick={onOpenFullTerminal}
          className="px-2 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 hover:text-white border border-cyan-500/40 font-mono text-[9px] font-bold uppercase transition cursor-pointer flex items-center gap-1"
          title="Vollständiges S.Y.N.T.A.X. Quant Terminal öffnen"
        >
          <Maximize2 className="w-2.5 h-2.5 text-cyan-400" />
          <span>VOLL-TERMINAL</span>
        </button>
      )}
      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
    </div>
  );

  return (
    <DraggableResizableWidget
      id="miniTrades"
      title={`MINI QUANT TERMINAL :: ${selectedSymbol}`}
      initialX={50}
      initialY={340}
      initialWidth={390}
      initialHeight={420}
      minWidth={320}
      minHeight={320}
      isEditMode={isEditMode}
      onClose={onClose}
      headerControls={headerControls}
    >
      <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-sans text-xs overflow-hidden">
        
        {/* Asset Selection Rail */}
        <div className="px-2.5 py-1.5 bg-slate-900/90 border-b border-slate-800 flex items-center gap-1 overflow-x-auto no-scrollbar flex-shrink-0">
          {assets.map((ast) => {
            const isSelected = ast.symbol === selectedSymbol;
            const isPositive = ast.change24h >= 0;
            return (
              <button
                key={ast.symbol}
                onClick={() => setSelectedSymbol(ast.symbol)}
                className={`px-2 py-1 rounded-lg border font-mono text-[10px] font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                    : "bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{ast.symbol.split("/")[0]}</span>
                <span className={isPositive ? "text-emerald-400" : "text-red-400"}>
                  {isPositive ? "+" : ""}{ast.change24h}%
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Asset Live Stats Bar */}
        <div className="px-3 py-2 bg-slate-950 border-b border-cyan-500/20 flex items-center justify-between font-mono flex-shrink-0">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>{activeAsset.name}</span>
            </div>
            <div className="text-base font-bold text-cyan-300 flex items-center gap-1">
              ${activeAsset.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-xs font-bold flex items-center justify-end gap-1 ${
                activeAsset.change24h >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {activeAsset.change24h >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{activeAsset.change24h >= 0 ? `+${activeAsset.change24h}%` : `${activeAsset.change24h}%`}</span>
            </div>
            <div className="text-[9px] text-slate-400">VOL: {activeAsset.vol24h}</div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-2 py-1 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between font-mono text-[10px] flex-shrink-0">
          <div className="flex items-center gap-1">
            {[
              { id: "chart", label: "📈 CHART" },
              { id: "order", label: "⚡ TRADE" },
              { id: "positions", label: `💼 POS (${openPositions.length})` },
              { id: "orderbook", label: "📊 DEPTH" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-2 py-1 rounded-md font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(0,240,255,0.4)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "chart" && (
            <div className="flex items-center gap-0.5 text-[9px]">
              {(["1m", "5m", "1h", "1d"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    timeframe === tf ? "bg-cyan-500/30 text-cyan-300 font-bold" : "text-slate-500"
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="px-3 py-1 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 font-mono text-[10px] font-bold flex items-center justify-between animate-fade-in flex-shrink-0">
            <span>{notification}</span>
            <X className="w-3 h-3 cursor-pointer" onClick={() => setNotification(null)} />
          </div>
        )}

        {/* Main Tab Content */}
        <div className="flex-1 p-2.5 overflow-y-auto custom-scrollbar flex flex-col justify-between">
          
          {/* TAB 1: LIVE SVG CANDLESTICK / LINE CHART */}
          {activeTab === "chart" && (
            <div className="flex flex-col h-full space-y-2">
              {/* SVG Live Line / Candlestick Wave */}
              <div className="relative flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-2 overflow-hidden flex flex-col justify-between">
                
                {/* Background Grid Lines */}
                <div className="absolute inset-0 grid grid-rows-4 grid-cols-4 pointer-events-none opacity-20">
                  <div className="border-b border-cyan-500/30 w-full col-span-4" />
                  <div className="border-b border-cyan-500/30 w-full col-span-4" />
                  <div className="border-b border-cyan-500/30 w-full col-span-4" />
                </div>

                {/* SVG Graph Canvas */}
                <svg className="w-full h-full min-h-[140px] overflow-visible">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00F0FF" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Draw Smooth Polyline */}
                  {(() => {
                    const minP = Math.min(...chartData);
                    const maxP = Math.max(...chartData);
                    const range = maxP - minP || 1;
                    const widthStep = 100 / (chartData.length - 1);

                    const pointsStr = chartData
                      .map((val, idx) => {
                        const x = idx * widthStep;
                        const y = 90 - ((val - minP) / range) * 75;
                        return `${x}%,${y}%`;
                      })
                      .join(" ");

                    const lastVal = chartData[chartData.length - 1];
                    const lastX = 100;
                    const lastY = 90 - ((lastVal - minP) / range) * 75;

                    return (
                      <>
                        <polygon
                          points={`0%,100% ${pointsStr} 100%,100%`}
                          fill="url(#chartGrad)"
                        />
                        <polyline
                          fill="none"
                          stroke="#00F0FF"
                          strokeWidth="2.5"
                          points={pointsStr}
                        />
                        <circle
                          cx={`${lastX}%`}
                          cy={`${lastY}%`}
                          r="4"
                          fill="#00F0FF"
                          className="animate-ping"
                        />
                        <circle
                          cx={`${lastX}%`}
                          cy={`${lastY}%`}
                          r="3"
                          fill="#ffffff"
                        />
                      </>
                    );
                  })()}
                </svg>

                {/* Live Floating Price Indicator */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] font-mono text-slate-400">
                  <span>HIGH: ${activeAsset.high24h}</span>
                  <span className="text-cyan-300 font-bold">LIVE STREAM</span>
                  <span>LOW: ${activeAsset.low24h}</span>
                </div>
              </div>

              {/* Action Bar inside Chart */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setOrderType("LONG");
                    setActiveTab("order");
                  }}
                  className="py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 rounded-xl text-emerald-300 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>BUY / LONG</span>
                </button>
                <button
                  onClick={() => {
                    setOrderType("SHORT");
                    setActiveTab("order");
                  }}
                  className="py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-xl text-red-300 font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>SELL / SHORT</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QUICK ORDER EXECUTION PAD */}
          {activeTab === "order" && (
            <div className="space-y-3 font-mono">
              {/* Side Switcher (LONG vs SHORT) */}
              <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setOrderType("LONG")}
                  className={`py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    orderType === "LONG"
                      ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🟢 BUY (LONG)
                </button>
                <button
                  onClick={() => setOrderType("SHORT")}
                  className={`py-1.5 rounded-lg font-bold text-xs transition cursor-pointer ${
                    orderType === "SHORT"
                      ? "bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🔴 SELL (SHORT)
                </button>
              </div>

              {/* Order Amount Selector */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>ORDER EINSATZ:</span>
                  <span className="text-cyan-300 font-bold">${orderAmount} USD</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[50, 250, 1000, 2500].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setOrderAmount(amt)}
                      className={`py-1 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                        orderAmount === amt
                          ? "bg-cyan-500/30 border-cyan-400 text-cyan-200"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Leverage Slider */}
              <div className="space-y-1 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>HEBEL / LEVERAGE:</span>
                  <span className="text-cyan-300 font-bold">{leverage}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={leverage}
                  onChange={(e) => setLeverage(Number(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[8px] text-slate-500">
                  <span>1x Spot</span>
                  <span>10x</span>
                  <span>25x</span>
                  <span>50x Max</span>
                </div>
              </div>

              {/* Execute Trade Button */}
              <button
                onClick={handleExecuteTrade}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-lg flex items-center justify-center gap-1.5 ${
                  orderType === "LONG"
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "bg-red-500 hover:bg-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>INSTANT {orderType} ORDERS ($${orderAmount} @ {leverage}x)</span>
              </button>
            </div>
          )}

          {/* TAB 3: OPEN POSITIONS */}
          {activeTab === "positions" && (
            <div className="space-y-2 font-mono text-[11px]">
              {openPositions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Activity className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                  <span>Keine aktiven Positionen geöffnet</span>
                </div>
              ) : (
                openPositions.map((pos) => {
                  const isProfit = pos.pnl >= 0;
                  return (
                    <div
                      key={pos.id}
                      className="p-2 bg-slate-900/80 border border-slate-800 rounded-xl space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] ${
                              pos.type === "LONG"
                                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                                : "bg-red-500/20 text-red-300 border border-red-500/40"
                            }`}
                          >
                            {pos.type} {pos.leverage}x
                          </span>
                          <span className="text-slate-200">{pos.symbol}</span>
                        </div>

                        <div className={isProfit ? "text-emerald-400" : "text-red-400"}>
                          {isProfit ? "+" : ""}${pos.pnl} ({pos.pnlPercent}%)
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[9.5px] text-slate-400 pt-0.5 border-t border-slate-800/60">
                        <span>ENTRY: ${pos.entryPrice}</span>
                        <span>NOW: ${pos.currentPrice}</span>
                        <button
                          onClick={() => handleClosePosition(pos.id)}
                          className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/40 text-[9px] font-bold cursor-pointer transition"
                        >
                          CLOSE
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 4: ORDER BOOK DEPTH */}
          {activeTab === "orderbook" && (
            <div className="space-y-2 font-mono text-[10px]">
              <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-800">
                <span>PREIS (USD)</span>
                <span>MENGE</span>
                <span>TOTAL</span>
              </div>

              {/* Asks (Sells - Red) */}
              <div className="space-y-1">
                {[1.002, 1.001, 1.0005].map((mult, idx) => {
                  const askPrice = (activeAsset.price * mult).toFixed(1);
                  const qty = (Math.random() * 2 + 0.1).toFixed(2);
                  return (
                    <div key={idx} className="flex justify-between text-red-400 bg-red-500/5 px-1 py-0.5 rounded">
                      <span>${askPrice}</span>
                      <span>{qty}</span>
                      <span>${(Number(askPrice) * Number(qty)).toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Spread Indicator */}
              <div className="py-1 text-center font-bold text-cyan-300 bg-slate-900 border-y border-slate-800">
                MARKET: ${activeAsset.price}
              </div>

              {/* Bids (Buys - Green) */}
              <div className="space-y-1">
                {[0.9995, 0.999, 0.998].map((mult, idx) => {
                  const bidPrice = (activeAsset.price * mult).toFixed(1);
                  const qty = (Math.random() * 2.5 + 0.2).toFixed(2);
                  return (
                    <div key={idx} className="flex justify-between text-emerald-400 bg-emerald-500/5 px-1 py-0.5 rounded">
                      <span>${bidPrice}</span>
                      <span>{qty}</span>
                      <span>${(Number(bidPrice) * Number(qty)).toFixed(0)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

        {/* Footer Full Terminal Link Bar */}
        {onOpenFullTerminal && (
          <div className="px-3 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between flex-shrink-0">
            <span className="font-mono text-[9px] text-slate-500 uppercase">HFT QUANT STREAM</span>
            <button
              onClick={onOpenFullTerminal}
              className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition hover:underline"
            >
              <span>FULL QUANT TERMINAL ↗</span>
            </button>
          </div>
        )}

      </div>
    </DraggableResizableWidget>
  );
};
