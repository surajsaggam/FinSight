import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import ExpenseCard from '../components/ExpenseCard';
import InsightCard from '../components/InsightCard';
import { TrendingUp, TrendingDown, Activity, Edit2, Receipt, ScanLine, ArrowUpRight, ArrowRightLeft, Loader2, BrainCircuit, Target, Wallet, BarChart2, Shield } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D0E12] rounded-xl px-4 py-3 shadow-xl border border-white/[0.08]">
        <p className="text-xs text-[#9CA3AF] mb-1">{label}</p>
        <p className="text-sm font-bold text-white">{prefix}{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  
  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(sessionStorage.getItem('monthlyBudget')) || 50000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());
  const [isConverting, setIsConverting] = useState(false);

  // Advanced AI States
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [aiData, setAiData] = useState({
    status: 'empty',
    risk_level: 'Low',
    trend: 'STABLE',
    growth: 0,
    prediction: 0,
    insights: [],
    category_intel: [],
    history: []
  });

  useEffect(() => {
    const data = JSON.parse(sessionStorage.getItem('transactions') || '[]');
    setTransactions(data);

    if (data.length > 0) {
      setIsAnalyzing(true);
      fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions: data })
      })
      .then(res => res.json())
      .then(backendData => {
        if (backendData.status === "success" || backendData.status === "empty") {
          setAiData(backendData);
        }
      })
      .catch(err => console.error("AI Analysis failed:", err))
      .finally(() => setIsAnalyzing(false));
    } else {
      setIsAnalyzing(false);
    }
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
    window.location.reload(); 
  };

  const handleEditTransaction = (id, updatedData) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === id) {
        return {
          ...t,
          ...updatedData,
          icon: t.icon 
        };
      }
      return t;
    });
    setTransactions(updatedTransactions);
    sessionStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    window.location.reload(); 
  };

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
             updatedTransactions[i] = {
                 ...t,
                 amount: Number((t.amount * 85).toFixed(2)), 
                 currency: 'INR'
             };
          } catch (e) { console.error(e); }
        }
      }

      if (didConvertAny) {
        setTransactions(updatedTransactions);
        sessionStorage.setItem('transactions', JSON.stringify(updatedTransactions));
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConverting(false);
    }
  };

  // Metrics
  const totalSpent = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const remaining = Math.max(0, monthlyBudget - totalSpent);
  const budgetPercentage = Math.min(100, ((totalSpent / monthlyBudget) * 100));
  const avgTransaction = transactions.length > 0 ? (totalSpent / transactions.length) : 0;
  
  // Category colors logic (using purple, blue, green, orange for the sober look)
  const categoryPalette = ['#A855F7', '#0EA5E9', '#F97316', '#10B981', '#EAB308'];
  
  const categoryData = aiData.category_intel.length > 0 ? aiData.category_intel.map((c, i) => ({
    name: c.category,
    value: c.amount,
    percentage: c.percentage,
    tag: c.tag,
    color: categoryPalette[i % categoryPalette.length]
  })).sort((a,b) => b.value - a.value) : [];

  const uniqueCategories = new Set(transactions.map(t => t.category)).size;

  const monthlyData = aiData.history.length > 0 ? aiData.history : [];
  
  // Sparkline for prediction (Mock data that leads to prediction)
  const sparklineData = monthlyData.slice(-5).map(d => ({ amount: d.amount }));
  if (sparklineData.length > 0) {
      sparklineData.push({ amount: aiData.prediction }); // Add prediction point
  }

  const recentTransactions = [...transactions].reverse();

  return (
    <div className="w-full py-8 px-4 bg-[#04050A] min-h-screen">
      <div className="max-w-[76rem] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 animate-fade-in-up">
          <div>
            <h1 className="font-space text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              Financial dashboard
              {isAnalyzing && <Loader2 className="w-5 h-5 text-[#10B981] animate-spin" />}
            </h1>
            <p className="text-[#9CA3AF] mt-1 font-medium tracking-tight text-xs flex items-center gap-1.5">
              Live Analysis • Session Based
            </p>
          </div>
          
          {/* Top Right Budget Widget */}
          <div className="flex flex-col sm:items-end bg-white/[0.02] border border-white/[0.05] p-3 px-5 rounded-2xl min-w-[160px]">
            <span className="text-[9px] uppercase tracking-widest text-[#6B7280] mb-0.5 font-bold">Monthly Budget Limit</span>
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
                   className="bg-transparent border-b-2 border-white/20 w-24 focus:outline-none focus:border-white text-xl font-bold text-white transition-colors"
                 />
              </div>
            ) : (
              <div 
                className="flex items-center gap-2 cursor-pointer group" 
                onClick={() => { setIsEditingBudget(true); setTempBudget(monthlyBudget.toString()); }}
              >
                <div className="flex items-center gap-1 border-b border-transparent">
                  <span className="text-lg font-bold text-white group-hover:text-gray-300 transition-colors">
                    ₹{monthlyBudget.toLocaleString()}
                  </span>
                  <Edit2 className="w-3 h-3 text-[#4B5563] group-hover:text-white transition-colors ml-1 opacity-0 group-hover:opacity-100" />
                </div>
              </div>
            )}
          </div>
        </div>

        {transactions.length === 0 ? (
          /* Empty State */
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 mt-4 animate-fade-in-up delay-100 liquid-glass-premium">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 relative border border-white/10">
               <Receipt size={32} className="text-[#9CA3AF]/80 absolute" />
            </div>
            <h2 className="font-space text-2xl font-bold text-white mb-2 tracking-tight text-center">
               Your dashboard is empty
            </h2>
            <p className="text-[#6B7280] max-w-sm mb-8 text-center text-sm leading-relaxed">
              Scan receipts to start building dynamic financial models, AI insights, and category tracking.
            </p>
            <button 
              onClick={() => navigate('/upload')} 
              className="px-6 py-3 rounded-full bg-white text-black font-bold flex items-center gap-2 hover:bg-gray-200 transition-colors group text-sm"
            >
               <ScanLine size={16} />
               Scan First Receipt
            </button>
          </div>
        ) : (
          <div className={`transition-opacity duration-500 ${isAnalyzing ? 'opacity-50 pointer-events-none' : 'opacity-100'} space-y-6`}>
            
            {/* Row 1: 4 Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
              {/* Total Spent */}
              <div className="liquid-glass-premium p-6 flex flex-col justify-center min-h-[130px]">
                <div className="flex items-start justify-between mb-2">
                   <p className="text-xs font-semibold text-[#9CA3AF]">Total Spent</p>
                   <div className="w-6 h-6 rounded bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 flex items-center justify-center">
                     <Wallet size={12} />
                   </div>
                </div>
                <p className="font-space text-3xl font-bold text-white tracking-tight mb-1">₹{totalSpent.toLocaleString()}</p>
                <p className="text-[10px] text-[#6B7280] font-medium">{transactions.length} receipts processed</p>
              </div>

              {/* Remaining */}
              <div className="liquid-glass-premium p-6 flex flex-col justify-center min-h-[130px]">
                <div className="flex items-start justify-between mb-2">
                   <p className="text-xs font-semibold text-[#9CA3AF]">Remaining</p>
                   <div className="w-6 h-6 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20 flex items-center justify-center">
                     <Target size={12} />
                   </div>
                </div>
                <p className="font-space text-3xl font-bold text-white tracking-tight mb-1">₹{remaining.toLocaleString()}</p>
                <p className="text-[10px] text-[#6B7280] font-medium">{(100 - budgetPercentage).toFixed(1)}% left</p>
              </div>

              {/* Avg Transaction */}
              <div className="liquid-glass-premium p-6 flex flex-col justify-center min-h-[130px]">
                <div className="flex items-start justify-between mb-2">
                   <p className="text-xs font-semibold text-[#9CA3AF]">Avg. Transaction</p>
                   <div className="w-6 h-6 rounded bg-[#A855F7]/10 text-[#A855F7] border border-[#A855F7]/20 flex items-center justify-center">
                     <Activity size={12} />
                   </div>
                </div>
                <p className="font-space text-3xl font-bold text-white tracking-tight mb-1">₹{avgTransaction.toLocaleString(undefined, {maximumFractionDigits:0})}</p>
                <p className="text-[10px] text-[#6B7280] font-medium">per receipt</p>
              </div>

              {/* Categories */}
              <div className="liquid-glass-premium p-6 flex flex-col justify-center min-h-[130px]">
                <div className="flex items-start justify-between mb-2">
                   <p className="text-xs font-semibold text-[#9CA3AF]">Categories</p>
                   <div className="w-6 h-6 rounded bg-[#0EA5E9]/10 text-[#0EA5E9] border border-[#0EA5E9]/20 flex items-center justify-center">
                     <BarChart2 size={12} />
                   </div>
                </div>
                <p className="font-space text-3xl font-bold text-white tracking-tight mb-1">{uniqueCategories}</p>
                <p className="text-[10px] text-[#6B7280] font-medium">spending sectors</p>
              </div>
            </div>

            {/* Row 2: Charts (Donut + Area) */}
            <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] lg:max-w-none lg:w-full gap-4 lg:gap-6 animate-fade-in-up delay-200">
              
              {/* Spending by Category (Purple Donut) */}
              <div className="liquid-glass-premium p-6 flex flex-col h-[380px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-space text-sm font-bold text-white tracking-tight">Spending by category</h3>
                  <span className="text-[9px] font-bold text-[#6B7280] bg-white/5 px-2 py-1 rounded-md">{categoryData.length} SECTORS</span>
                </div>
                
                <div className="flex-1 flex items-center gap-6 overflow-hidden">
                  <div className="w-40 h-40 relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={2}
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
                        <Tooltip content={<CustomTooltip />} cursor={false}/>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Donut Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1">
                      <span className="text-[9px] text-[#6B7280] font-bold tracking-widest uppercase">Total</span>
                      <span className="text-xl font-bold text-white mt-0.5">₹{totalSpent.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Category List */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {categoryData.slice(0, 5).map((entry) => (
                      <div key={entry.name} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs font-semibold text-[#9CA3AF]">{entry.name}</span>
                          </div>
                          <span className="text-xs font-bold text-white">₹{entry.value.toLocaleString(undefined, {maximumFractionDigits:0})}</span>
                        </div>
                        {/* Progress Bar inside list */}
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ backgroundColor: entry.color, width: `${entry.percentage}%` }} />
                        </div>
                      </div>
                    ))}
                    {categoryData.length === 0 && <p className="text-xs text-[#6B7280]">No data</p>}
                  </div>
                </div>
              </div>

              {/* Timeline Trend (Orange Area) */}
              <div className="liquid-glass-premium p-6 flex flex-col h-[380px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-space text-sm font-bold text-white tracking-tight">Timeline trend</h3>
                  <span className="text-[9px] font-bold text-[#6B7280] bg-white/5 px-2 py-1 rounded-md">LAST 10 POINTS</span>
                </div>
                <div className="flex-1 w-full min-h-0">
                  {monthlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F97316" stopOpacity={0.25} />
                            <stop offset="100%" stopColor="#F97316" stopOpacity={0.01} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} tickMargin={12} minTickGap={20} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                        <Area type="monotone" dataKey="amount" stroke="#F97316" strokeWidth={2} fill="url(#colorOrange)" activeDot={{ r: 5, fill: '#F97316', stroke: '#0D0E12', strokeWidth: 2 }} />
                      </AreaChart>
                   </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center border border-dashed border-white/5 rounded-xl">
                      <p className="text-[#6B7280] text-xs">Processing data...</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Row 3: ML Forecast & Risk Profile */}
            <div className="grid grid-cols-1 md:grid-cols-[55%_45%] lg:max-w-none lg:w-full gap-4 lg:gap-6 animate-fade-in-up delay-300">
              
              {/* Machine Learning Forecast */}
              <div className="liquid-glass-premium p-6 flex flex-col md:flex-row md:items-center justify-between min-h-[160px]">
                 <div className="space-y-3">
                   <p className="text-[9px] font-bold tracking-widest text-[#6B7280] uppercase">Machine Learning Forecast</p>
                   <p className="font-space text-4xl font-bold text-white tracking-tight">₹{aiData.prediction.toLocaleString()}</p>
                   <p className="text-[10px] text-[#A855F7] font-bold tracking-wider uppercase">Projected future expenditure</p>
                 </div>
                 
                 <div className="mt-4 md:mt-0 flex flex-col items-end w-40">
                   <div className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase mb-4 flex items-center gap-1.5
                     ${aiData.trend === 'DECREASING' ? 'bg-[#10B981]/15 text-[#10B981]' : 
                       aiData.trend === 'INCREASING' ? 'bg-[#F97316]/15 text-[#F97316]' : 
                       'bg-[#0EA5E9]/15 text-[#0EA5E9]'}`}>
                     {aiData.trend === 'DECREASING' ? <TrendingDown size={10} /> : 
                      aiData.trend === 'INCREASING' ? <TrendingUp size={10} /> : <Activity size={10} />}
                     {aiData.trend}
                   </div>
                   
                   {/* Tiny Sparkline */}
                   <div className="h-10 w-full opacity-70">
                     {sparklineData.length > 2 && (
                       <ResponsiveContainer width="100%" height="100%">
                         <LineChart data={sparklineData}>
                           <Line type="monotone" dataKey="amount" stroke={aiData.trend === 'DECREASING' ? '#10B981' : '#F97316'} strokeWidth={2} dot={false} />
                         </LineChart>
                       </ResponsiveContainer>
                     )}
                   </div>
                 </div>
              </div>

              {/* Spending Risk Profile */}
              <div className="liquid-glass-premium p-6 flex flex-col justify-center min-h-[160px]">
                 <p className="text-[9px] font-bold tracking-widest text-[#6B7280] uppercase mb-4">Spending Risk Profile</p>
                 <div className="flex items-center gap-3 mb-4">
                   <Shield className={`w-6 h-6 ${aiData.risk_level === 'High' ? 'text-[#EF4444]' : aiData.risk_level === 'Medium' ? 'text-[#F59E0B]' : 'text-[#10B981]'}`} />
                   <p className={`font-space text-2xl font-bold ${aiData.risk_level === 'High' ? 'text-[#EF4444]' : aiData.risk_level === 'Medium' ? 'text-[#F59E0B]' : 'text-[#10B981]'}`}>
                     {aiData.risk_level} Risk
                   </p>
                 </div>
                 
                 {/* Segmented Bar */}
                 <div className="flex h-1.5 w-full gap-1 mb-3">
                    <div className={`h-full flex-1 rounded-l-full ${aiData.risk_level === 'Low' ? 'bg-[#10B981]' : 'bg-[#10B981]/20'}`} />
                    <div className={`h-full flex-[0.8] ${aiData.risk_level === 'Medium' ? 'bg-[#F59E0B]' : 'bg-[#F59E0B]/20'}`} />
                    <div className={`h-full flex-1 rounded-r-full ${aiData.risk_level === 'High' ? 'bg-[#EF4444]' : 'bg-[#EF4444]/20'}`} />
                 </div>
                 <p className="text-[9px] text-[#6B7280] font-medium leading-tight max-w-[90%]">Based on algorithmic mapping of discretionary vs. essential volume constraint.</p>
              </div>

            </div>

            {/* Row 4: Budget Health & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] lg:max-w-none lg:w-full gap-4 lg:gap-6 animate-fade-in-up delay-[400ms]">
              
              {/* Budget health */}
              <div className="liquid-glass-premium p-6 flex flex-col justify-between">
                <h3 className="font-space text-sm font-bold text-white tracking-tight mb-6">Budget health</h3>
                
                <div className="flex items-center gap-8 flex-1">
                   {/* Radial Chart (Approximate with PieChart) */}
                   <div className="w-24 h-24 flex-shrink-0 relative">
                     <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[{value: budgetPercentage}, {value: 100 - budgetPercentage}]}
                            cx="50%" cy="50%"
                            innerRadius={35} outerRadius={45}
                            startAngle={90} endAngle={-270}
                            dataKey="value" stroke="none"
                          >
                            <Cell fill="#D97706" /> {/* Active orange */}
                            <Cell fill="rgba(255,255,255,0.05)" /> {/* Track */}
                          </Pie>
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-sm font-bold text-white">{budgetPercentage.toFixed(0)}%</span>
                       <span className="text-[8px] tracking-widest text-[#6B7280] mt-0.5 uppercase font-bold">Used</span>
                     </div>
                   </div>

                   {/* Stats text stack */}
                   <div className="flex-1 space-y-3">
                      <div className="flex justify-between items-center bg-white/5 py-2 px-3 rounded-lg border border-white/5">
                        <span className="text-[9px] tracking-widest font-bold uppercase text-[#6B7280]">Limit</span>
                        <span className="text-xs font-bold text-white">₹{monthlyBudget.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 py-2 px-3 rounded-lg border border-white/5">
                        <span className="text-[9px] tracking-widest font-bold uppercase text-[#D97706]">Spent</span>
                        <span className="text-xs font-bold text-[#D97706]">₹{totalSpent.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/5 py-2 px-3 rounded-lg border border-white/5">
                        <span className="text-[9px] tracking-widest font-bold uppercase text-[#9CA3AF]">Remaining</span>
                        <span className="text-xs font-bold text-white">₹{remaining.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
              </div>

              {/* AI Insights array */}
              <div className="liquid-glass-premium p-6 flex flex-col">
                <h3 className="font-space text-sm font-bold text-white tracking-tight mb-4">AI insights</h3>
                <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar max-h-[200px]">
                  {aiData.insights.length > 0 ? (
                    aiData.insights.map((insight, idx) => (
                      <div key={idx} className="flex gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.04]">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 text-sm`}>
                            {insight.icon || '💡'}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-white mb-0.5">{insight.title}</p>
                            <p className="text-[10px] text-[#9CA3AF] leading-relaxed pr-2">{insight.message}</p>
                         </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-50">
                      <BrainCircuit size={24} className="text-[#6B7280] mb-2" />
                      <p className="text-xs text-[#6B7280]">More transaction history needed...</p>
                    </div>
                  )}
                </div>
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
            <div className="mt-8 pb-12 animate-fade-in-up delay-[500ms]">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-4">
                  <h3 className="font-space text-sm font-bold text-white tracking-tight">Recent transactions</h3>
                  <button onClick={handleConvertToINR} disabled={isConverting} className="text-[10px] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-1 rounded-md text-[#10B981] hover:bg-[#10B981]/20 transition-colors uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-sm">
                    {isConverting ? <Loader2 size={10} className="animate-spin" /> : <ArrowRightLeft size={10} />}
                    Convert to INR
                  </button>
                </div>
                <span onClick={() => navigate('/upload')} className="text-[10px] uppercase tracking-widest font-bold text-[#9CA3AF] cursor-pointer hover:text-white transition-colors">
                  View All
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
            
          </div>
        )}

      </div>
    </div>
  );
}
