import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Area, AreaChart } from 'recharts';
import { categoryData, monthlyData, insights, summaryCards, budgetData, transactions, COLORS } from '../data/dummyData';
import ExpenseCard from '../components/ExpenseCard';
import InsightCard from '../components/InsightCard';
import { TrendingUp, TrendingDown, ArrowUpRight, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-3 shadow-xl border border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">₹{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const trendIcons = { up: TrendingUp, down: TrendingDown, neutral: Activity };

  return (
    <div className="w-full bg-transparent py-8 px-4">
      <div className="max-w-[90rem] mx-auto space-y-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tighter text-gray-900 dark:text-white">
            Financial dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium tracking-tight text-sm">March 2026 overview • Live</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          {summaryCards.map((card, i) => {
            const TrendIcon = trendIcons[card.trend];
            return (
              <div key={card.title} className={`glass-panel p-6 animate-fade-in-up delay-${(i+1)*100}`}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">{card.title}</p>
                  <div className={`p-1.5 rounded-lg ${card.color} flex items-center justify-center`}>
                    <TrendIcon className="w-4 h-4 text-[#C68346]" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
                <p className="text-xs font-semibold mt-2 text-gray-500 dark:text-gray-400">
                  {card.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 animate-fade-in-up delay-200">
          {/* Pie Chart */}
          <div className="glass-panel p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 tracking-tight">Spending by category</h3>
            <div className="flex flex-col xl:flex-row items-center justify-between gap-8 h-full">
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
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{entry.icon}</span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300 flex-1">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">₹{entry.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line / Area Chart */}
          <div className="glass-panel p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 tracking-tight">Monthly trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C68346" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C68346" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#888888" strokeOpacity={0.1} vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280', fontWeight: 'bold' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(198,131,70,0.2)', strokeWidth: 1 }} />
                  <Area type="monotone" dataKey="amount" stroke="#C68346" strokeWidth={3} fill="url(#colorAmount)" activeDot={{ r: 6, fill: '#C68346', stroke: '#fff' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Budget Health + Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up delay-300">
          {/* Budget Health */}
          <div className="glass-panel p-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 tracking-tight">Budget health</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold tracking-widest uppercase text-gray-500">₹{budgetData.spent.toLocaleString()} of ₹{budgetData.total.toLocaleString()}</span>
                <span className="text-sm font-bold tracking-wider text-[#C68346]">
                  {budgetData.percentage}% USED
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 dark:bg-white/[0.05] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#C68346] transition-all duration-1000 ease-out"
                  style={{ width: `${budgetData.percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="text-center p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Budget</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">₹{budgetData.total.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#C68346]/5 border border-[#C68346]/10">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#C68346]">Spent</p>
                  <p className="text-lg font-bold text-[#C68346] mt-1">₹{budgetData.spent.toLocaleString()}</p>
                </div>
                <div className="text-center p-4 rounded-xl border border-gray-100 dark:border-white/[0.05]">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-gray-500">Remaining</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">₹{budgetData.remaining.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white px-2 tracking-tight">AI insights</h3>
            {insights.map((insight) => (
              <InsightCard key={insight.id} {...insight} />
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="mb-8 animate-fade-in-up delay-[500ms]">
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight">Recent transactions</h3>
            <span className="text-xs font-semibold text-[#C68346] cursor-pointer flex items-center gap-1 hover:underline">
              View all <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {transactions.slice(0, 6).map((t) => (
              <ExpenseCard key={t.id} {...t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
