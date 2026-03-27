import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { COLORS } from '../data/dummyData';
import ExpenseCard from '../components/ExpenseCard';
import InsightCard from '../components/InsightCard';
import { TrendingUp, TrendingDown, Activity, Edit2, Receipt, ScanLine, ArrowUpRight, ArrowRightLeft, Loader2 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0a0b12] rounded-xl px-4 py-3 shadow-xl border border-white/[0.08]">
        <p className="text-xs text-[#9CA3AF]">{label}</p>
        <p className="text-sm font-bold text-white mt-1">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    return Number(sessionStorage.getItem('monthlyBudget')) || 15000;
  });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    setTransactions(data);
  }, []);

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

  const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Activity };

  const totalSpent = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  
  const budgetData = {
    total: monthlyBudget,
    spent: totalSpent,
    remaining: Math.max(0, monthlyBudget - totalSpent),
    percentage: Math.min(100, ((totalSpent / monthlyBudget) * 100))
  };

  const summaryCards = [
    { title: 'Total Spent', value: `₹${totalSpent.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, change: `${transactions.length} receipts processed`, trend: 'neutral', color: 'bg-[#10B981]/10' },
    { title: 'Remaining Budget', value: `₹${budgetData.remaining.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, change: `${(100 - budgetData.percentage).toFixed(1)}% left`, trend: 'down', color: 'bg-[#3B82F6]/10' },
  ];

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
      color: COLORS[i % COLORS.length]
    }))
    .sort((a,b) => b.value - a.value);

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

  let insights = [];
  if (transactions.length > 0) {
    if (budgetData.percentage >= 100) {
      insights.push({ id: 1, type: 'danger', title: 'Budget Exceeded', message: `You have exhausted your ₹${monthlyBudget} budget limits!`, icon: '🚨' });
    } else if (budgetData.percentage > 75) {
      insights.push({ id: 1, type: 'warning', title: 'Budget Warning', message: `You are nearing your budget limit. ${budgetData.percentage.toFixed(1)}% used.`, icon: '⚠️' });
    } else {
      insights.push({ id: 1, type: 'success', title: 'On Track', message: 'You are well within your budget for this period.', icon: '✅' });
    }
  }
  if (categoryData.length > 0) {
    const topCat = categoryData[0];
    insights.push({ id: 2, type: 'info', title: 'Biggest Spend Category', message: `Your highest spending category is ${topCat.name} at ₹${topCat.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}.`, icon: '💡' });
  }

  const recentTransactions = [...transactions].reverse();

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-[90rem] mx-auto space-y-8">
        
        {/* Header */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="font-space text-4xl md:text-5xl font-bold tracking-tight text-white">
              Financial Dashboard
            </h1>
            <p className="text-[#9CA3AF] mt-2 font-medium tracking-tight text-sm">
              Live Analysis • Session Based
            </p>
          </div>
          
          {/* Budget Editor UI */}
          <div className="flex flex-col sm:items-end p-4 rounded-xl liquid-glass min-w-[180px]">
            <span className="text-[10px] uppercase tracking-widest text-[#4B5563] mb-1 font-bold">Monthly Budget Limit</span>
            {isEditingBudget ? (
              <div className="flex items-center gap-2">
                 <span className="text-xl font-bold text-[#9CA3AF]">₹</span>
                 <input 
                   autoFocus 
                   type="number" 
                   value={tempBudget} 
                   onChange={e => setTempBudget(e.target.value)} 
                   onKeyDown={e => e.key === 'Enter' && handleSaveBudget()} 
                   onBlur={handleSaveBudget} 
                   className="bg-transparent border-b-2 border-[#10B981] w-24 focus:outline-none text-xl font-bold text-white"
                 />
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => { setIsEditingBudget(true); setTempBudget(monthlyBudget.toString()); }}
              >
                <div className="flex items-center gap-1 border-b-2 border-transparent transition-colors group-hover:border-[#10B981]/40 pb-0.5">
                  <span className="text-xl font-bold text-white group-hover:text-[#10B981] transition-colors pt-0.5">
                    ₹{monthlyBudget.toLocaleString()}
                  </span>
                  <Edit2 className="w-3.5 h-3.5 text-[#4B5563] group-hover:text-[#10B981] transition-colors ml-1 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          
          /* Empty State */
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 mt-12 animate-fade-in-up delay-100 liquid-glass-premium">
            <div className="w-24 h-24 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-6 relative">
               <Receipt size={40} className="text-[#10B981]/80 absolute" />
               <div className="absolute inset-0 border-2 border-dashed border-[#10B981]/30 rounded-full animate-[spin_10s_linear_infinite]" />
            </div>
            <h2 className="font-space text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight text-center">
               Your dashboard is clean
            </h2>
            <p className="text-[#9CA3AF] max-w-md mb-8 text-center text-sm leading-relaxed">
              Start tracking your expenses by scanning your first receipt. Our AI will automatically categorize it and build dynamic financial charts over here.
            </p>
            <button 
              onClick={() => navigate('/upload')} 
              className="px-6 py-3 rounded-full bg-[#10B981] text-white font-semibold flex items-center gap-2 hover:bg-[#059669] transition-all animate-pulse-glow group"
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
                   className="flex items-center gap-2 py-2 px-4 rounded-xl border border-[#10B981]/20 bg-[#10B981]/5 text-[#10B981] font-semibold text-sm hover:bg-[#10B981]/10 hover:border-[#10B981]/40 transition-all focus:outline-none focus:ring-2 focus:ring-[#10B981]/50"
                 >
                   {isConverting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
                   {isConverting ? 'Converting via Live APIs...' : 'Convert Foreign Currency to INR'}
                 </button>
               )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {summaryCards.map((card, i) => {
                const TrendIcon = trendIcons[card.trend];
                return (
                  <div key={card.title} className={`liquid-glass-premium p-6 animate-fade-in-up delay-${(i+1)*100}`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-semibold text-[#9CA3AF]">{card.title}</p>
                      <div className={`p-1.5 rounded-lg ${card.color} flex items-center justify-center`}>
                        <TrendIcon className="w-4 h-4 text-[#10B981]" />
                      </div>
                    </div>
                    <p className="font-space text-3xl font-bold text-white">{card.value}</p>
                    <p className="text-xs font-semibold mt-2 text-[#4B5563]">
                      {card.change}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in-up delay-200">
              
              {/* Pie Chart */}
              <div className="liquid-glass-premium p-8">
                <h3 className="font-space text-lg font-semibold text-white mb-6 tracking-tight">Spending by category</h3>
                <div className="flex flex-col xl:flex-row items-center justify-between gap-8 h-full min-h-[300px]">
                  <div className="w-56 h-56 flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 w-full flex flex-col justify-center space-y-4">
                    {categoryData.map((entry) => (
                      <div key={entry.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-xs font-semibold text-[#4B5563]">{entry.icon}</span>
                          <span className="text-sm font-medium text-[#9CA3AF] flex-1">{entry.name}</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                          ₹{entry.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Line / Area Chart */}
              <div className="liquid-glass-premium p-8">
                <h3 className="font-space text-lg font-semibold text-white mb-6 tracking-tight">Timeline trend</h3>
                <div className="h-64 mt-[32px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.1} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickMargin={12} />
                      <YAxis tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(16,185,129,0.2)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#10B981', stroke: '#04050A' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Budget Health + Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up delay-300">
              
              {/* Budget Health */}
              <div className="liquid-glass-premium p-8">
                <h3 className="font-space text-lg font-semibold text-white mb-6 tracking-tight">Budget health</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold tracking-widest uppercase text-[#9CA3AF]">
                      ₹{budgetData.spent.toLocaleString()} of ₹{budgetData.total.toLocaleString()}
                    </span>
                    <span className="text-sm font-bold tracking-wider text-[#10B981]">
                      {budgetData.percentage.toFixed(1)}% USED
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${budgetData.percentage > 100 ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
                      style={{ width: `${Math.min(100, budgetData.percentage)}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#4B5563]">Limit</p>
                      <p className="text-lg font-bold text-white mt-1 min-h-[28px]">₹{budgetData.total.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-[#10B981]/5 border border-[#10B981]/10">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#10B981]">Spent</p>
                      <p className="text-lg font-bold text-[#10B981] mt-1 min-h-[28px]">₹{budgetData.spent.toLocaleString()}</p>
                    </div>
                    <div className={`text-center p-4 rounded-xl border ${budgetData.remaining === 0 ? 'bg-[#EF4444]/5 border-[#EF4444]/15' : 'border-white/[0.06]'}`}>
                      <p className={`text-[10px] font-bold tracking-widest uppercase ${budgetData.remaining === 0 ? 'text-[#EF4444]' : 'text-[#4B5563]'}`}>Remaining</p>
                      <p className={`text-lg font-bold mt-1 min-h-[28px] ${budgetData.remaining === 0 ? 'text-[#EF4444]' : 'text-white'}`}>
                        {budgetData.remaining === 0 ? '₹0' : `₹${budgetData.remaining.toLocaleString()}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="space-y-4">
                <h3 className="font-space text-lg font-semibold text-white px-2 tracking-tight mb-6">AI insights</h3>
                {insights.map((insight) => (
                  <InsightCard key={insight.id} {...insight} />
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="mb-8 animate-fade-in-up delay-[400ms]">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-space text-base font-semibold text-white tracking-tight">All recent transactions</h3>
                <span onClick={() => navigate('/upload')} className="text-sm font-semibold text-[#10B981] cursor-pointer flex items-center gap-1 hover:underline">
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
