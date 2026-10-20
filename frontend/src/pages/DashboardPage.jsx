import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, BarChart, Bar
} from 'recharts';
import ExpenseCard from '../components/ExpenseCard';
import {
  TrendingUp, TrendingDown, Activity, Edit2, Receipt, ScanLine,
  ArrowRightLeft, Loader2, BrainCircuit, Target, Wallet, BarChart2,
  Shield, Plus, Download, Trash2, Sparkles, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { analyzeTransactions } from '../utils/api';
import { trackEvent } from '../utils/analytics';
import { useToast } from '../context/ToastContext';
import { transactions as demoTransactions, categories, CATEGORY_EMOJIS } from '../data/dummyData';

const CustomTooltip = ({ active, payload, label, prefix = '₹' }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0D0E12] rounded-xl px-4 py-3 shadow-xl border border-white/[0.08]">
        {label && <p className="text-xs text-[#9CA3AF] mb-1">{label}</p>}
        <p className="text-sm font-bold text-white">{prefix}{Number(payload[0].value || 0).toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('transactions') || '[]');
    } catch {
      return [];
    }
  });

  const [monthlyBudget, setMonthlyBudget] = useState(() => Number(sessionStorage.getItem('monthlyBudget')) || 50000);
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(monthlyBudget.toString());
  const [budgetError, setBudgetError] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  // Manual Expense Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    merchant: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
  });
  const [manualError, setManualError] = useState('');

  // Clear Data & Expense Confirmation Modals
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  // Advanced AI States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
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

  const runAnalysis = useCallback(async (txList) => {
    if (!txList || txList.length === 0) {
      setAiData({
        status: 'empty',
        risk_level: 'Low',
        trend: 'STABLE',
        growth: 0,
        prediction: 0,
        insights: [],
        category_intel: [],
        history: []
      });
      setAnalysisError(null);
      setIsAnalyzing(false);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const backendData = await analyzeTransactions(txList);
      if (backendData.status === 'success' || backendData.status === 'empty') {
        setAiData(backendData);
      }
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setAnalysisError(err.message || 'Could not reach the ML analysis service. Showing local summary.');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    runAnalysis(transactions);
  }, [transactions, runAnalysis]);

  useEffect(() => {
    const onSessionUpdated = () => {
      try {
        const updated = JSON.parse(sessionStorage.getItem('transactions') || '[]');
        setTransactions(updated);
      } catch {
        setTransactions([]);
      }
    };
    window.addEventListener('finsight-session-updated', onSessionUpdated);
    return () => window.removeEventListener('finsight-session-updated', onSessionUpdated);
  }, []);

  const syncTransactions = (updatedList) => {
    setTransactions(updatedList);
    setLastUpdated(new Date());
    sessionStorage.setItem('transactions', JSON.stringify(updatedList));
  };

  const handleSaveBudget = () => {
    const newBudget = Number(tempBudget);
    if (isNaN(newBudget) || newBudget <= 0 || newBudget > 100000000) {
      setBudgetError('Enter a valid budget (> 0)');
      return;
    }
    setBudgetError('');
    setMonthlyBudget(newBudget);
    sessionStorage.setItem('monthlyBudget', newBudget.toString());
    setIsEditingBudget(false);
    addToast(`Monthly budget set to ₹${newBudget.toLocaleString()}`, 'success');
    trackEvent('budget_updated', { budget: newBudget });
  };

  const handleDeleteTransaction = (id) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    syncTransactions(updatedTransactions);
    addToast('Expense removed from session', 'info');
    trackEvent('transaction_deleted');
  };

  const handleEditTransaction = (id, updatedData) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === id) {
        const cat = updatedData.category || t.category;
        return {
          ...t,
          ...updatedData,
          icon: CATEGORY_EMOJIS[cat] || t.icon || '📦'
        };
      }
      return t;
    });
    syncTransactions(updatedTransactions);
    addToast('Expense updated', 'success');
    trackEvent('transaction_edited');
  };

  const handleAddManualExpense = (e) => {
    e.preventDefault();
    const trimmedMerchant = manualForm.merchant.trim();
    const numericAmount = Number(manualForm.amount);

    if (!trimmedMerchant) {
      setManualError('Merchant name is required.');
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setManualError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!manualForm.date) {
      setManualError('Please select a valid date.');
      return;
    }

    const newTx = {
      id: Date.now(),
      merchant: trimmedMerchant,
      amount: Number(numericAmount.toFixed(2)),
      category: manualForm.category,
      date: manualForm.date,
      currency: 'INR',
      icon: CATEGORY_EMOJIS[manualForm.category] || '📦',
      items: []
    };

    syncTransactions([...transactions, newTx]);
    trackEvent('manual_expense_added', { category: manualForm.category });
    addToast(`Added expense from ${trimmedMerchant}`, 'success');
    setManualForm({
      merchant: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().slice(0, 10),
    });
    setManualError('');
    setShowAddModal(false);
  };

  const handleLoadDemoData = () => {
    syncTransactions(demoTransactions);
    addToast('Loaded sample transactions', 'info');
    trackEvent('demo_data_loaded', { count: demoTransactions.length });
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Date', 'Merchant', 'Category', 'Amount', 'Currency'];
    const escapeCsv = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const rows = transactions.map(t => [
      t.id,
      t.date,
      t.merchant,
      t.category,
      t.amount,
      t.currency || 'INR'
    ].map(escapeCsv).join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finsight-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('CSV export downloaded successfully', 'success');
    trackEvent('transactions_exported_csv', { count: transactions.length });
  };

  const handleClearAllData = () => {
    sessionStorage.removeItem('transactions');
    sessionStorage.removeItem('monthlyBudget');
    setTransactions([]);
    setLastUpdated(new Date());
    setShowClearConfirm(false);
    addToast('All session data cleared', 'info');
    trackEvent('session_data_cleared');
  };

  const handleConvertToINR = () => {
    setIsConverting(true);
    try {
      const ratesToINR = {
        USD: 85, EUR: 92, GBP: 108, AED: 23.1, SGD: 63, CAD: 61, AUD: 55, JPY: 0.56
      };
      let didConvertAny = false;
      const updatedTransactions = transactions.map((t) => {
        const rawCurr = t.currency?.toUpperCase().replace(/[^A-Z]/g, '') || 'INR';
        if (rawCurr !== 'INR' && rawCurr.length === 3) {
          didConvertAny = true;
          const rate = ratesToINR[rawCurr] || 85;
          return {
            ...t,
            amount: Number((Number(t.amount) * rate).toFixed(2)),
            currency: 'INR',
          };
        }
        return t;
      });

      if (didConvertAny) {
        syncTransactions(updatedTransactions);
        trackEvent('currency_converted_to_inr');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsConverting(false);
    }
  };

  // Metrics
  const totalSpent = transactions.reduce((acc, t) => acc + (Number(t.amount) || 0), 0);
  const remaining = Math.max(0, monthlyBudget - totalSpent);
  const budgetPercentage = Math.min(100, (totalSpent / monthlyBudget) * 100);
  const avgTransaction = transactions.length > 0 ? totalSpent / transactions.length : 0;

  // Category colors logic
  const categoryPalette = ['#A855F7', '#0EA5E9', '#F97316', '#10B981', '#EAB308', '#EC4899'];

  // Fallback client-side category aggregation if AI backend hasn't returned yet
  const fallbackCategoryIntel = (() => {
    if (transactions.length === 0) return [];
    const totals = {};
    transactions.forEach(t => {
      const cat = t.category || 'Other';
      totals[cat] = (totals[cat] || 0) + (Number(t.amount) || 0);
    });
    return Object.entries(totals).map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpent > 0 ? Number(((amount / totalSpent) * 100).toFixed(1)) : 0,
      tag: 'Balanced'
    }));
  })();

  const rawCategorySource = aiData.category_intel?.length > 0 ? aiData.category_intel : fallbackCategoryIntel;

  const categoryData = rawCategorySource
    .map((c, i) => ({
      name: c.category,
      value: c.amount,
      percentage: c.percentage,
      tag: c.tag,
      color: categoryPalette[i % categoryPalette.length]
    }))
    .sort((a, b) => b.value - a.value);

  const uniqueCategories = new Set(transactions.map(t => t.category)).size;

  const monthlyData = aiData.history?.length > 0
    ? aiData.history
    : transactions.slice(-10).map(t => ({ date: t.date, amount: Number(t.amount) || 0 }));

  const sparklineData = monthlyData.slice(-5).map(d => ({ amount: d.amount }));
  if (sparklineData.length > 0 && aiData.prediction > 0) {
    sparklineData.push({ amount: aiData.prediction });
  }

  const recentTransactions = [...transactions].reverse();

  return (
    <div className="w-full py-8 px-4 bg-[#04050A] min-h-screen">
      <div className="max-w-[76rem] mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4 animate-fade-in-up">
          <div>
            <h1 className="font-space text-3xl md:text-4xl font-bold tracking-tight text-white flex items-center gap-3">
              Financial dashboard
              {isAnalyzing && <Loader2 className="w-5 h-5 text-[#10B981] animate-spin" />}
            </h1>
            <p className="text-[#9CA3AF] mt-1 font-medium tracking-tight text-xs flex flex-wrap items-center gap-1.5">
              <span>Live Analysis • Session Based ({transactions.length} {transactions.length === 1 ? 'receipt' : 'receipts'})</span>
              <span>•</span>
              <span className="text-emerald-400">
                Last updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.10] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus size={14} className="text-[#10B981]" />
                Add Expense
              </button>
              <button
                onClick={() => navigate('/upload')}
                className="px-3.5 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ScanLine size={14} />
                Scan Receipt
              </button>
              {transactions.length > 0 && (
                <>
                  <button
                    onClick={handleExportCSV}
                    title="Export transactions as CSV"
                    className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] text-[#9CA3AF] hover:text-white transition-colors cursor-pointer"
                  >
                    <Download size={15} />
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    title="Clear all session data"
                    className="p-2 rounded-xl bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </div>

            {/* Top Right Budget Widget */}
            <div className="flex flex-col sm:items-end bg-white/[0.02] border border-white/[0.05] p-3 px-5 rounded-2xl min-w-[160px]">
              <span className="text-[9px] uppercase tracking-widest text-[#6B7280] mb-0.5 font-bold">Monthly Budget Limit</span>
              {isEditingBudget ? (
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold text-[#9CA3AF]">₹</span>
                    <input
                      autoFocus
                      type="number"
                      min="1"
                      value={tempBudget}
                      onChange={e => setTempBudget(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveBudget()}
                      onBlur={handleSaveBudget}
                      className="bg-transparent border-b-2 border-[#10B981] w-24 focus:outline-none text-xl font-bold text-white transition-colors"
                    />
                  </div>
                  {budgetError && <span className="text-[10px] text-[#EF4444] mt-1">{budgetError}</span>}
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
                    <Edit2 className="w-3 h-3 text-[#4B5563] group-hover:text-white transition-colors ml-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Banner if AI Analysis Failed */}
        {analysisError && transactions.length > 0 && (
          <div className="px-4 py-3 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B] text-xs flex flex-wrap items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{analysisError}</span>
            </div>
            <button
              onClick={() => runAnalysis(transactions)}
              className="px-3 py-1 rounded-lg bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} />
              Retry Analysis
            </button>
          </div>
        )}

        {transactions.length === 0 ? (
          /* Onboarding & Empty State */
          <div className="w-full flex flex-col items-center justify-center p-8 sm:p-12 mt-4 animate-fade-in-up delay-100 liquid-glass-premium">
            <div className="w-20 h-20 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-6 relative border border-[#10B981]/25">
              <Receipt size={32} className="text-[#10B981]" />
            </div>
            <h2 className="font-space text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight text-center">
              Welcome to Your FinSight Dashboard
            </h2>
            <p className="text-[#9CA3AF] max-w-md mb-8 text-center text-sm leading-relaxed">
              Your session is currently empty. Scan a receipt image, add an expense manually, or load sample transactions to see AI insights and ML forecasts in action.
            </p>

            {/* Primary Onboarding CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
              <button
                onClick={() => navigate('/upload')}
                className="px-6 py-3 rounded-full bg-[#10B981] text-white font-bold flex items-center gap-2 hover:bg-[#059669] transition-colors text-sm cursor-pointer shadow-lg shadow-[#10B981]/20"
              >
                <ScanLine size={16} />
                Scan First Receipt
              </button>
              <button
                onClick={handleLoadDemoData}
                className="px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.14] text-white font-semibold flex items-center gap-2 hover:bg-white/[0.12] transition-colors text-sm cursor-pointer"
              >
                <Sparkles size={16} className="text-[#10B981]" />
                Try with Sample Data
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-3 rounded-full bg-white/[0.03] border border-white/[0.08] text-[#9CA3AF] hover:text-white font-semibold flex items-center gap-2 hover:bg-white/[0.07] transition-colors text-sm cursor-pointer"
              >
                <Plus size={16} />
                Add Manually
              </button>
            </div>

            {/* 3-Step Quick Onboarding Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl pt-8 border-t border-white/[0.06]">
              {[
                { step: '1', title: 'Upload or Add', desc: 'Snap a photo of any receipt or enter an expense manually.' },
                { step: '2', title: 'AI & ML Modeling', desc: 'Scikit-learn forecasts your next spend and detects risk levels.' },
                { step: '3', title: 'Ask & Export', desc: 'Chat with FinSight AI about your habits or export to CSV anytime.' },
              ].map((item) => (
                <div key={item.step} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#10B981]/15 text-[#10B981] text-xs font-bold mb-2">
                    {item.step}
                  </span>
                  <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                  <p className="text-xs text-[#6B7280] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Loading Skeletons when analyzing for the first time */}
            {isAnalyzing && aiData.status === 'empty' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="liquid-glass-premium p-6 min-h-[130px] flex flex-col justify-between">
                    <div className="h-3 w-24 bg-white/10 rounded" />
                    <div className="h-8 w-32 bg-white/15 rounded my-2" />
                    <div className="h-2.5 w-20 bg-white/5 rounded" />
                  </div>
                ))}
              </div>
            )}

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
                <p className="font-space text-3xl font-bold text-white tracking-tight mb-1">
                  ₹{avgTransaction.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
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
              <div className="liquid-glass-premium p-6 flex flex-col min-h-[380px]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-space text-sm font-bold text-white tracking-tight">Spending by category</h3>
                  <span className="text-[9px] font-bold text-[#6B7280] bg-white/5 px-2 py-1 rounded-md">{categoryData.length} SECTORS</span>
                </div>

                <div className="flex-1 flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
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
                        <Tooltip content={<CustomTooltip />} cursor={false} />
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Donut Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-1">
                      <span className="text-[9px] text-[#6B7280] font-bold tracking-widest uppercase">Total</span>
                      <span className="text-lg font-bold text-white mt-0.5">₹{totalSpent.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Category List */}
                  <div className="flex-1 w-full overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {categoryData.slice(0, 5).map((entry) => (
                      <div key={entry.name} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-xs font-semibold text-[#9CA3AF]">{entry.name}</span>
                          </div>
                          <span className="text-xs font-bold text-white">
                            ₹{entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
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
                  <p className="font-space text-4xl font-bold text-white tracking-tight">
                    ₹{(aiData.prediction || Math.round(avgTransaction)).toLocaleString()}
                  </p>
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
                <p className="text-[9px] text-[#6B7280] font-medium leading-tight max-w-[90%]">
                  Based on algorithmic mapping of discretionary vs. essential volume constraint.
                </p>
              </div>

            </div>

            {/* Row 4: Budget Health & Insights */}
            <div className="grid grid-cols-1 md:grid-cols-[40%_60%] lg:max-w-none lg:w-full gap-4 lg:gap-6 animate-fade-in-up delay-[400ms]">

              {/* Budget health */}
              <div className="liquid-glass-premium p-6 flex flex-col justify-between">
                <h3 className="font-space text-sm font-bold text-white tracking-tight mb-6">Budget health</h3>

                <div className="flex items-center gap-8 flex-1">
                  <div className="w-24 h-24 flex-shrink-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[{ value: budgetPercentage }, { value: 100 - budgetPercentage }]}
                          cx="50%" cy="50%"
                          innerRadius={35} outerRadius={45}
                          startAngle={90} endAngle={-270}
                          dataKey="value" stroke="none"
                        >
                          <Cell fill="#D97706" />
                          <Cell fill="rgba(255,255,255,0.05)" />
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
                  {aiData.insights?.length > 0 ? (
                    aiData.insights.map((insight, idx) => (
                      <div key={idx} className="flex gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.04]">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/5 border border-white/10 text-sm">
                          {insight.icon || '💡'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white mb-0.5">{insight.title}</p>
                          <p className="text-[10px] text-[#9CA3AF] leading-relaxed pr-2">{insight.message}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full opacity-50 py-6">
                      <BrainCircuit size={24} className="text-[#6B7280] mb-2" />
                      <p className="text-xs text-[#6B7280]">
                        {isAnalyzing ? 'Generating AI insights...' : 'Add more transactions for deeper pattern insights.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Category Intelligence Bar Chart — Full Width */}
            {categoryData.length > 1 && (
              <div className="liquid-glass-premium p-6 sm:p-8 animate-fade-in-up delay-[350ms]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-space text-sm font-bold text-white tracking-tight">Category intelligence</h3>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-[#6B7280] bg-white/5 px-2.5 py-1 rounded-md">Comparative View</span>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} barSize={32}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                          <stop offset="100%" stopColor="#059669" stopOpacity={0.6} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.04} vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF', fontWeight: '600' }} tickLine={false} axisLine={false} tickMargin={10} />
                      <YAxis tick={{ fontSize: 10, fill: '#6B7280', fontWeight: '600' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(1)}k`} width={50} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16,185,129,0.06)', radius: 8 }} />
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
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4 px-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-space text-sm font-bold text-white tracking-tight">Recent transactions</h3>
                  <button
                    onClick={handleConvertToINR}
                    disabled={isConverting}
                    className="text-[10px] bg-[#10B981]/10 border border-[#10B981]/20 px-2.5 py-1 rounded-md text-[#10B981] hover:bg-[#10B981]/20 transition-colors uppercase tracking-widest font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {isConverting ? <Loader2 size={10} className="animate-spin" /> : <ArrowRightLeft size={10} />}
                    Convert to INR
                  </button>
                </div>
                <button
                  onClick={() => navigate('/upload')}
                  className="text-[10px] uppercase tracking-widest font-bold text-[#9CA3AF] cursor-pointer hover:text-white transition-colors"
                >
                  + Scan Another
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {recentTransactions.map((t) => (
                  <ExpenseCard
                    key={t.id}
                    {...t}
                    onDelete={() => setExpenseToDelete(t)}
                    onEdit={(id, updatedData) => handleEditTransaction(id, updatedData)}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Add Manual Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="liquid-glass max-w-md w-full p-6 sm:p-7 border border-white/[0.12] animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-space text-lg font-bold text-white">Add Expense Manually</h3>
              <button
                onClick={() => { setShowAddModal(false); setManualError(''); }}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/[0.06]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddManualExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Merchant / Store Name *</label>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. Starbucks, Uber, Reliance Fresh"
                  value={manualForm.merchant}
                  onChange={e => setManualForm({ ...manualForm, merchant: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-sm text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Amount (INR) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={manualForm.amount}
                    onChange={e => setManualForm({ ...manualForm, amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-sm text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Date *</label>
                  <input
                    type="date"
                    value={manualForm.date}
                    onChange={e => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.10] text-sm text-white focus:outline-none focus:border-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9CA3AF] mb-1.5">Category</label>
                <select
                  value={manualForm.category}
                  onChange={e => setManualForm({ ...manualForm, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0E12] border border-white/[0.10] text-sm text-white focus:outline-none focus:border-[#10B981]"
                >
                  {[...categories, 'Other'].map(cat => (
                    <option key={cat} value={cat}>{CATEGORY_EMOJIS[cat] || '📦'} {cat}</option>
                  ))}
                </select>
              </div>

              {manualError && (
                <p className="text-xs text-[#EF4444] font-medium">{manualError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setManualError(''); }}
                  className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-[#9CA3AF] hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clear Session Data Confirmation Modal */}
      {/* Clear Session Data Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="liquid-glass max-w-sm w-full p-6 border border-white/[0.12] text-center animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#EF4444]" />
            </div>
            <h3 className="font-space text-lg font-bold text-white mb-2">Clear All Session Data?</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed mb-6">
              This will permanently remove all {transactions.length} receipts and reset your budget in this browser session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white text-xs font-semibold hover:bg-white/[0.10] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllData}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-xs font-semibold hover:bg-[#DC2626] cursor-pointer"
              >
                Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Expense Deletion Confirmation Modal */}
      {expenseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="liquid-glass max-w-sm w-full p-6 border border-white/[0.12] text-center animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-[#EF4444]" />
            </div>
            <h3 className="font-space text-lg font-bold text-white mb-2">Delete Expense?</h3>
            <p className="text-xs text-[#9CA3AF] leading-relaxed mb-6">
              Are you sure you want to remove <span className="font-semibold text-white">{expenseToDelete.merchant}</span> (₹{Number(expenseToDelete.amount || 0).toLocaleString()}) from your session?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setExpenseToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-white/[0.06] text-white text-xs font-semibold hover:bg-white/[0.10] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDeleteTransaction(expenseToDelete.id);
                  setExpenseToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#EF4444] text-white text-xs font-semibold hover:bg-[#DC2626] cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
