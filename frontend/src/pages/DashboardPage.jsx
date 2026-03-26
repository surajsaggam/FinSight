import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, RadialBarChart, RadialBar, Legend
} from 'recharts';
import { COLORS } from '../data/dummyData';
import ExpenseCard from '../components/ExpenseCard';
import InsightCard from '../components/InsightCard';
import { TrendingUp, TrendingDown, Activity, Edit2, Receipt, ScanLine, ArrowUpRight, ArrowRightLeft, Loader2, Wallet, ShieldCheck, Zap, BarChart3 } from 'lucide-react';

// ── Animated Counter Component ──
function AnimatedCounter({ value, prefix = '', suffix = '', decimals = 0, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (end === start) { setDisplay(end); return; }
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(start + (end - start) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <>{prefix}{display.toLocaleString(undefined, { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}{suffix}</>;
}

// ── Custom Tooltip ──
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-2xl border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{label}</p>
        <p className="text-base font-extrabold text-gray-900 dark:text-white mt-1">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

// ── Custom Bar Tooltip ──
const BarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-2xl border border-gray-100 dark:border-gray-700">
        <p className="text-xs font-bold text-gray-900 dark:text-white">{payload[0].payload.name}</p>
        <p className="text-sm font-extrabold text-[#C68346] mt-0.5">₹{payload[0].value.toLocaleString()}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{((payload[0].value / payload[0].payload.total) * 100).toFixed(1)}% of total</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  
  // Budget State
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return Number(sessionStorage.getItem('monthlyBudget')) || 15000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    setTransactions(data);
  }, []);

  const [mlData, setMlData] = useState(null);

  useEffect(() => {
    const fetchML = async () => {
      if (transactions.length === 0) return;
      try {
        const res = await fetch('http://localhost:5000/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactions })
        });
        const data = await res.json();
        if (data.status === 'success') {
          setMlData(data);
        }
      } catch (err) {
        console.error("ML Analyze Error:", err);
      }
    };
    fetchML();
  }, [transactions]);

  const handleSaveBudget = () => {
    const newBudget = Number(tempBudget);
    if (!isNaN(newBudget) && newBudget > 0) {
      setMonthlyBudget(newBudget);
      sessionStorage.setItem('monthlyBudget', newBudget.toString());
    }
    setIsEditingBudget(false);
  };

  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    sessionStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const categoryEmojis = {
    Food: '🍔', Travel: '🚗', Shopping: '🛍️', Entertainment: '🎬',
    Groceries: '🥦', Utilities: '⚡', Health: '💊', Education: '📚', Other: '📦'
  };

  const handleEditTransaction = (id, updatedData) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === id) {
        return {
          ...t,
          merchant: updatedData.merchant,
          amount: updatedData.amount,
          category: updatedData.category,
          icon: categoryEmojis[updatedData.category] || '📦'
        };
      }
      return t;
    });
    setTransactions(updatedTransactions);
    sessionStorage.setItem('transactions', JSON.stringify(updatedTransactions));
  };

  const [isConverting, setIsConverting] = useState(false);

  const handleConvertToINR = async () => {
    setIsConverting(true);
    try {
      let updatedTransactions = [...transactions];
      let didConvertAny = false;

      for (let i = 0; i < updatedTransactions.length; i++) {
        let t = updatedTransactions[i];
        const rawCurr = t.currency?.toUpperCase().replace(/[^A-Z]/g, '') || 'INR';
        
        if (rawCurr !== 'INR' && rawCurr.length === 3) {
          didConvertAny = true;
          try {
            const res = await fetch(`https://api.exchangerate-api.com/v4/latest/${rawCurr}`);
            const apiData = await res.json();
            const rate = apiData.rates['INR'];
            if (rate) {
               updatedTransactions[i] = {
                 ...t,
                 amount: Number((t.amount * rate).toFixed(2)),
                 currency: 'INR'
               };
            }
          } catch (e) {
            console.error(`Failed to convert ${rawCurr}`, e);
          }
        }
      }

      if (didConvertAny) {
        setTransactions(updatedTransactions);
        sessionStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConverting(false);
    }
  };

  // Compute stats dynamically
  const totalSpent = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const avgTransaction = transactions.length > 0 ? totalSpent / transactions.length : 0;
  
  const budgetData = {
    total: monthlyBudget,
    spent: totalSpent,
    remaining: Math.max(0, monthlyBudget - totalSpent),
    percentage: Math.min(100, ((totalSpent / monthlyBudget) * 100))
  };

  // Category Data for Charts
  const catMap = {};
  transactions.forEach(t => {
    const cat = t.category || 'Uncategorized';
    if (!catMap[cat]) catMap[cat] = { value: 0, icon: t.icon || '📦' };
    catMap[cat].value += (t.amount || 0);
  });
  const categoryData = Object.entries(catMap)
    .map(([name, data], i) => ({
      name,
      value: data.value,
      icon: data.icon,
      color: COLORS[i % COLORS.length],
      total: totalSpent
    }))
    .sort((a,b) => b.value - a.value);

  // Monthly Data for Area Chart
  const dateMap = {};
  transactions.forEach(t => {
    const dateStr = t.date || 'Unknown';
    if (!dateMap[dateStr]) dateMap[dateStr] = 0;
    dateMap[dateStr] += (t.amount || 0);
  });
  
  const monthlyData = Object.entries(dateMap)
    .sort(([d1], [d2]) => d1.localeCompare(d2))
    .map(([date, amount]) => ({
      month: date, 
      amount
    }));

  // Radial data for budget gauge
  const radialData = [
    { name: 'Used', value: budgetData.percentage, fill: budgetData.percentage > 90 ? '#ef4444' : budgetData.percentage > 70 ? '#f59e0b' : '#C68346' },
  ];

  // Dynamic Insights
  let insights = [];
  if (transactions.length > 0) {
    if (budgetData.percentage >= 100) {
      insights.push({ id: 'b1', type: 'danger', title: 'Budget Exceeded', message: `You have exhausted your ₹${monthlyBudget.toLocaleString()} budget limits!`, icon: '🚨' });
    } else if (budgetData.percentage > 75) {
      insights.push({ id: 'b2', type: 'warning', title: 'Budget Warning', message: `You are nearing your budget limit. ${budgetData.percentage.toFixed(1)}% used.`, icon: '⚠️' });
    } else {
      insights.push({ id: 'b3', type: 'success', title: 'On Track', message: 'You are well within your budget for this period.', icon: '✅' });
    }
  }

  if (mlData && mlData.insights) {
    mlData.insights.forEach((intel, idx) => {
      insights.push({
        id: `ml-${idx}`,
        type: intel.type,
        title: intel.title || 'AI Intelligence',
        message: intel.message,
        icon: intel.icon || (intel.type === 'danger' ? '🚨' : intel.type === 'warning' ? '⚠️' : '💡')
      });
    });
  } else if (categoryData.length > 0) {
    const topCat = categoryData[0];
    insights.push({ id: 'b4', type: 'info', title: 'Biggest Spend Category', message: `Your highest spending category is ${topCat.name} at ₹${topCat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`, icon: '💡' });
  }

  const recentTransactions = [...transactions].reverse();

  return (
    <div className="w-full bg-transparent py-8 px-4">
      <div className="max-w-[90rem] mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900 dark:text-white">
              Financial dashboard
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-tight text-sm">
              Live Analysis • Session Based
            </p>
          </div>
          
          {/* Budget Editor UI */}
          <div className="flex flex-col sm:items-end p-4 rounded-xl glass-panel min-w-[180px]">
            <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Monthly Budget Limit</span>
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                 <span className="text-xl font-bold text-gray-400">₹</span>
                 <input 
                   autoFocus 
                   type="number" 
                   value={tempBudget} 
                   onChange={e => setTempBudget(e.target.value)} 
                   onKeyDown={e => e.key === 'Enter' && handleSaveBudget()} 
                   onBlur={handleSaveBudget} 
                   className="bg-transparent border-b-2 border-[#C68346] w-24 focus:outline-none text-xl font-bold text-gray-900 dark:text-white"
                 />
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => { setIsEditingBudget(true); setTempBudget(monthlyBudget.toString()); }}
              >
                <div className="flex items-center gap-1 border-b-2 border-transparent transition-colors group-hover:border-[#C68346]/40 pb-0.5">
                  <span className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-[#C68346] transition-colors pt-0.5">
                    ₹{monthlyBudget.toLocaleString()}
                  </span>
                  <Edit2 className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#C68346] transition-colors ml-1 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          
          /* Empty State */
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 mt-12 animate-fade-in-up delay-100 border border-gray-200 dark:border-white/5 rounded-3xl bg-white/50 dark:bg-white/[0.02] shadow-sm">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#C68346]/20 to-transparent flex items-center justify-center mb-6 relative">
               <Receipt size={40} className="text-[#C68346]/80 absolute" />
               <div className="absolute inset-0 border-2 border-dashed border-[#C68346]/30 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight text-center">
               Your dashboard is clean
            </h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8 text-center text-sm leading-relaxed">
              Start tracking your expenses by scanning your first receipt. Our AI will automatically categorize it and build dynamic financial charts over here.
            </p>
            <button 
              onClick={() => navigate('/upload')} 
              className="btn-primary shadow-lg shadow-[#C68346]/20 group"
            >
               <ScanLine size={18} className="group-hover:scale-110 transition-transform" />
               Scan First Receipt
            </button>
          </div>

        ) : (
          <>
            {/* Control Bar */}
            <div className="flex justify-end mb-6">
               {transactions.some(t => t.currency && t.currency !== '₹' && t.currency.toUpperCase() !== 'INR') && (
                 <button 
                   onClick={handleConvertToINR}
                   disabled={isConverting}
                   className="flex items-center gap-2 py-2 px-4 rounded-xl border-2 border-[#C68346]/20 bg-[#C68346]/5 text-[#C68346] font-semibold text-sm hover:bg-[#C68346]/10 hover:border-[#C68346]/40 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#C68346]/50"
                 >
                   {isConverting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
                   {isConverting ? 'Converting via Live APIs...' : 'Convert Foreign Currency to INR'}
                 </button>
               )}
            </div>

            {/* Summary Cards - Enhanced with animated counters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {/* Total Spent */}
              <div className="glass-panel p-6 animate-fade-in-up delay-100 group hover:shadow-lg hover:shadow-[#C68346]/5 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Total Spent</p>
                  <div className="p-2 rounded-xl bg-[#C68346]/10 group-hover:bg-[#C68346]/20 transition-colors">
                    <Wallet className="w-4 h-4 text-[#C68346]" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  <AnimatedCounter value={totalSpent} prefix="₹" />
                </p>
                <p className="text-xs font-semibold mt-2 text-gray-400">
                  {transactions.length} receipts processed
                </p>
              </div>

              {/* Remaining Budget */}
              <div className="glass-panel p-6 animate-fade-in-up delay-200 group hover:shadow-lg hover:shadow-[#8B5E3C]/5 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Remaining</p>
                  <div className="p-2 rounded-xl bg-[#8B5E3C]/10 group-hover:bg-[#8B5E3C]/20 transition-colors">
                    <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
                  </div>
                </div>
                <p className={`text-3xl font-extrabold tracking-tight ${budgetData.remaining === 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                  <AnimatedCounter value={budgetData.remaining} prefix="₹" />
                </p>
                <p className="text-xs font-semibold mt-2 text-gray-400">
                  {(100 - budgetData.percentage).toFixed(1)}% left
                </p>
              </div>

              {/* Avg. Transaction */}
              <div className="glass-panel p-6 animate-fade-in-up delay-300 group hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Avg. Transaction</p>
                  <div className="p-2 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <Zap className="w-4 h-4 text-purple-500" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  <AnimatedCounter value={avgTransaction} prefix="₹" decimals={0} />
                </p>
                <p className="text-xs font-semibold mt-2 text-gray-400">
                  per receipt
                </p>
              </div>

              {/* Categories Count */}
              <div className="glass-panel p-6 animate-fade-in-up delay-400 group hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Categories</p>
                  <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  <AnimatedCounter value={categoryData.length} />
                </p>
                <p className="text-xs font-semibold mt-2 text-gray-400">
                  spending sectors
                </p>
              </div>
            </div>

            {/* Charts Section — Two Column */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in-up delay-200">
              
              {/* Category Bar Chart (replacing boring pie) */}
              <div className="glass-panel p-8 group hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Spending by category</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">{categoryData.length} sectors</span>
                </div>
                <div className="flex flex-col xl:flex-row items-center gap-8 min-h-[280px]">
                  {/* Donut Chart */}
                  <div className="w-52 h-52 flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={58}
                          outerRadius={82}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          animationBegin={200}
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity cursor-pointer" />
                          ))}
                        </Pie>
                        <Tooltip content={<BarTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Total</span>
                      <span className="text-lg font-extrabold text-gray-900 dark:text-white">₹{totalSpent.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                    </div>
                  </div>

                  {/* Category Legend + Percentage Bars */}
                  <div className="flex-1 w-full space-y-3">
                    {categoryData.map((entry) => (
                      <div key={entry.name} className="group/item cursor-default">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{entry.icon}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover/item:text-gray-900 dark:group-hover/item:text-white transition-colors">{entry.name}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                            ₹{entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        {/* Mini Progress Bar */}
                        <div className="h-1.5 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${((entry.value / totalSpent) * 100).toFixed(1)}%`, backgroundColor: entry.color }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Timeline Trend — Enhanced */}
              <div className="glass-panel p-8 group hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Timeline trend</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">{monthlyData.length} data points</span>
                </div>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C68346" stopOpacity={0.35} />
                          <stop offset="50%" stopColor="#E0A96D" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#C68346" stopOpacity={0.0} />
                        </linearGradient>
                        <filter id="glow">
                          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.08} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b7280', fontWeight: '600' }} tickLine={false} axisLine={false} tickMargin={14} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280', fontWeight: '600' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} width={50} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(198,131,70,0.15)', strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#C68346" 
                        strokeWidth={3} 
                        fill="url(#colorAmount)" 
                        filter="url(#glow)"
                        activeDot={{ r: 7, fill: '#C68346', stroke: '#fff', strokeWidth: 3, filter: 'url(#glow)' }} 
                        dot={{ r: 4, fill: '#C68346', stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* AI ML Forecast Section */}
            {mlData && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up delay-250 mb-6 mt-6">
                <div className="xl:col-span-2 glass-panel p-6 flex flex-col justify-center relative overflow-hidden group border-l-[3px] border-[#C68346] hover:shadow-lg transition-shadow duration-300">
                   {/* Background Glow */}
                   <div className="absolute inset-0 opacity-[0.06] blur-2xl bg-gradient-to-br from-[#C68346] via-transparent to-transparent pointer-events-none" />
                   
                   <div className="relative z-10 w-full">
                      {/* Top Row: Title + Trend Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[11px] font-bold tracking-widest uppercase text-gray-500">Machine Learning Forecast</h3>
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm ${mlData.trend === 'INCREASING' ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400' : mlData.trend === 'DECREASING' ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400' : 'bg-[#C68346]/5 border-[#C68346]/20 text-[#C68346]'}`}>
                            {mlData.trend === 'INCREASING' ? <TrendingUp size={14} strokeWidth={3} /> : mlData.trend === 'DECREASING' ? <TrendingDown size={14} strokeWidth={3} /> : <Activity size={14} strokeWidth={3} />}
                            <span className="text-[11px] font-extrabold tracking-widest">{mlData.trend}</span>
                        </div>
                      </div>

                      {/* Prediction + Chart Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
                        <div className="flex-1">
                          <span className="text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight drop-shadow-sm">
                            ₹<AnimatedCounter value={mlData.prediction} />
                          </span>
                          <span className="block text-xs font-semibold mt-2 text-[#C68346] uppercase tracking-widest flex items-center gap-1.5 opacity-90">
                            <Activity size={14} /> Projected Future Expenditure
                          </span>
                        </div>

                        {/* Inline Sparkline Chart */}
                        {mlData.history && mlData.history.length > 0 && (
                          <div className="w-full sm:w-56 h-20 rounded-xl overflow-hidden border border-[#C68346]/15 bg-[#C68346]/[0.03] p-1">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={[...mlData.history, { date: 'Future', amount: mlData.prediction }]}>
                                 <defs>
                                    <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#C68346" stopOpacity={0.5}/>
                                      <stop offset="95%" stopColor="#C68346" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <Area type="monotone" dataKey="amount" stroke="#C68346" strokeWidth={2} fillOpacity={1} fill="url(#colorForecast)" dot={false} animationDuration={1200} />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>
                   </div>
                </div>
                
                {/* Risk Visual Meter */}
                <div className={`glass-panel p-6 flex flex-col justify-between border-l-[3px] hover:shadow-lg transition-shadow duration-300 ${mlData.risk_level === 'High' ? 'border-red-500' : mlData.risk_level === 'Medium' ? 'border-yellow-500' : 'border-green-500'}`}>
                   <div>
                     <h3 className="text-[11px] font-bold tracking-widest uppercase text-gray-500 mb-3">Spending Risk Profile</h3>
                   </div>
                   
                   <div className="mt-2 mb-4">
                     <span className={`text-2xl lg:text-3xl font-extrabold tracking-tight mb-3 inline-block drop-shadow-sm ${mlData.risk_level === 'High' ? 'text-red-500' : mlData.risk_level === 'Medium' ? 'text-yellow-500' : 'text-green-500'}`}>
                       {mlData.risk_level} Risk
                     </span>
                     {/* Visual Segmented Gauge */}
                     <div className="flex h-2.5 gap-1 rounded-full overflow-hidden mb-1 opacity-90">
                       <div className={`h-full flex-1 rounded-full transition-all duration-700 ${mlData.risk_level === 'Low' || mlData.risk_level === 'Medium' || mlData.risk_level === 'High' ? 'bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                       <div className={`h-full flex-1 rounded-full transition-all duration-700 ${mlData.risk_level === 'Medium' || mlData.risk_level === 'High' ? 'bg-yellow-500/80 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                       <div className={`h-full flex-1 rounded-full transition-all duration-700 ${mlData.risk_level === 'High' ? 'bg-red-500/80 shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                     </div>
                   </div>

                   <p className="text-[11px] font-medium mt-1 text-gray-500 dark:text-gray-400 leading-relaxed">
                     Based on algorithmic mapping of discretionary vs. essential volume constraint.
                   </p>
                </div>
              </div>
            )}

            {/* Budget Health + Insights — Redesigned */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up delay-300">
              
              {/* Budget Health with Radial Gauge */}
              <div className="glass-panel p-8 h-fit group hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 tracking-tight">Budget health</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Radial Gauge */}
                  <div className="w-40 h-40 flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} data={radialData} barSize={12}>
                        <RadialBar 
                          background={{ fill: 'rgba(128,128,128,0.08)' }} 
                          dataKey="value" 
                          cornerRadius={6} 
                          animationDuration={1500}
                          animationEasing="ease-out"
                        />
                      </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className={`text-2xl font-extrabold ${budgetData.percentage > 90 ? 'text-red-500' : budgetData.percentage > 70 ? 'text-yellow-500' : 'text-[#C68346]'}`}>
                        {budgetData.percentage.toFixed(0)}%
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">USED</span>
                    </div>
                  </div>

                  {/* Budget Details */}
                  <div className="flex-1 w-full space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Limit</span>
                      <span className="text-base font-bold text-gray-900 dark:text-white">₹{budgetData.total.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#C68346]/5 border border-[#C68346]/10">
                      <span className="text-[10px] font-bold tracking-widest uppercase text-[#C68346]">Spent</span>
                      <span className="text-base font-bold text-[#C68346]">₹<AnimatedCounter value={budgetData.spent} /></span>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${budgetData.remaining === 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20' : 'border-gray-100 dark:border-white/5'}`}>
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${budgetData.remaining === 0 ? 'text-red-500' : 'text-gray-500'}`}>Remaining</span>
                      <span className={`text-base font-bold ${budgetData.remaining === 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                        ₹<AnimatedCounter value={budgetData.remaining} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-2 tracking-tight mb-6">AI insights</h3>
                {insights.map((insight) => (
                  <InsightCard key={insight.id} {...insight} />
                ))}
              </div>
            </div>

            {/* Category Intelligence Bar Chart — Full Width */}
            {categoryData.length > 1 && (
              <div className="glass-panel p-8 animate-fade-in-up delay-[350ms] group hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight">Category intelligence</h3>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 dark:bg-white/5 px-3 py-1 rounded-full">Comparative View</span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} barSize={32}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#C68346" stopOpacity={1} />
                          <stop offset="100%" stopColor="#8B5E3C" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.06} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280', fontWeight: '600' }} tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis tick={{ fontSize: 10, fill: '#6b7280', fontWeight: '600' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} width={50} />
                      <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(198,131,70,0.06)', radius: 8 }} />
                      <Bar 
                        dataKey="value" 
                        fill="url(#barGradient)" 
                        radius={[6, 6, 0, 0]} 
                        animationDuration={1200}
                        animationEasing="ease-out"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="mb-8 animate-fade-in-up delay-[400ms]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">All recent transactions</h3>
                <span onClick={() => navigate('/upload')} className="text-sm font-semibold text-[#C68346] cursor-pointer flex items-center gap-1 hover:underline">
                  Scan more <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentTransactions.map((t) => (
                  <ExpenseCard 
                    key={t.id} 
                    {...t} 
                    onDelete={() => handleDeleteTransaction(t.id)} 
                    onEdit={(id, updatedData) => handleEditTransaction(id, updatedData)}
                  />
                ))}
              </div>
            </div>
            
          </>
        )}

      </div>
    </div>
  );
}
