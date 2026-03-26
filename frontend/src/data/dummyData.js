export const transactions = [
  { id: 1, merchant: 'Zomato', amount: 340, date: '2026-03-16', category: 'Food', icon: '🍔' },
  { id: 2, merchant: 'Uber', amount: 215, date: '2026-03-15', category: 'Travel', icon: '🚗' },
  { id: 3, merchant: 'Amazon', amount: 1299, date: '2026-03-14', category: 'Shopping', icon: '🛍️' },
  { id: 4, merchant: 'Starbucks', amount: 450, date: '2026-03-13', category: 'Food', icon: '☕' },
  { id: 5, merchant: 'Netflix', amount: 649, date: '2026-03-12', category: 'Entertainment', icon: '🎬' },
  { id: 6, merchant: 'Swiggy', amount: 280, date: '2026-03-11', category: 'Food', icon: '🍕' },
  { id: 7, merchant: 'Ola', amount: 180, date: '2026-03-10', category: 'Travel', icon: '🛺' },
  { id: 8, merchant: 'Reliance Fresh', amount: 890, date: '2026-03-09', category: 'Groceries', icon: '🥦' },
  { id: 9, merchant: 'PVR Cinemas', amount: 520, date: '2026-03-08', category: 'Entertainment', icon: '🎥' },
  { id: 10, merchant: 'Myntra', amount: 2100, date: '2026-03-07', category: 'Shopping', icon: '👗' },
  { id: 11, merchant: 'Spotify', amount: 119, date: '2026-03-06', category: 'Entertainment', icon: '🎵' },
  { id: 12, merchant: 'Dominos', amount: 395, date: '2026-03-05', category: 'Food', icon: '🍕' },
];

// Modern vibrant colors for categories
export const COLORS = ['#8b5cf6', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899'];

export const categoryData = [
  { name: 'Food', value: 1465, color: '#8b5cf6', icon: '🍔' },
  { name: 'Travel', value: 395, color: '#0ea5e9', icon: '🚗' },
  { name: 'Shopping', value: 3399, color: '#10b981', icon: '🛍️' },
  { name: 'Entertainment', value: 1288, color: '#f59e0b', icon: '🎬' },
  { name: 'Groceries', value: 890, color: '#ec4899', icon: '🥦' },
];

export const monthlyData = [
  { month: 'Oct', amount: 5200 },
  { month: 'Nov', amount: 6800 },
  { month: 'Dec', amount: 8100 },
  { month: 'Jan', amount: 5900 },
  { month: 'Feb', amount: 7200 },
  { month: 'Mar', amount: 7437 },
];

export const insights = [
  {
    id: 1,
    type: 'warning',
    title: 'Food Spending Alert',
    message: 'Food spending increased by 30% compared to last month.',
    icon: '⚠️',
  },
  {
    id: 2,
    type: 'danger',
    title: 'Budget Forecast',
    message: 'You may exceed your monthly budget in 5 days at this pace.',
    icon: '🚨',
  },
  {
    id: 3,
    type: 'success',
    title: 'Travel Savings',
    message: 'Great job! Travel spending is down 15% this month.',
    icon: '✅',
  },
  {
    id: 4,
    type: 'info',
    title: 'Smart Tip',
    message: 'Consider setting a daily food budget of ₹250 to stay on track.',
    icon: '💡',
  },
];

export const budgetData = {
  total: 15000,
  spent: 7437,
  remaining: 7563,
  percentage: 49.6,
};

export const summaryCards = [
  { title: 'Total Spent', value: '₹7,437', change: '+12%', trend: 'up', color: 'bg-[#C68346]/10' },
  { title: 'This Month', value: '₹7,437', change: '18 transactions', trend: 'neutral', color: 'bg-[#E0A96D]/10' },
  { title: 'Remaining Budget', value: '₹7,563', change: '50.4% left', trend: 'down', color: 'bg-[#8B5E3C]/10' },
];

export const chatResponses = {
  'How much did I spend on food?': 'You spent **₹1,465** on food this month across 4 transactions. Your top food expenses were Starbucks (₹450), Dominos (₹395), Zomato (₹340), and Swiggy (₹280).',
  'Compare this month with last month': 'This month you\'ve spent **₹7,437** so far, compared to **₹7,200** last month. That\'s a **3.3% increase**. Food and Shopping categories have seen the most growth.',
  'What is my biggest expense?': 'Your biggest single expense this month was **Myntra — ₹2,100** in the Shopping category. Shopping overall is your highest category at ₹3,399.',
  'Am I within my budget?': 'You\'ve used **49.6%** of your ₹15,000 monthly budget with ₹7,563 remaining. At your current pace, you may slightly exceed your budget by month end.',
  'Show spending by category': 'Here\'s your breakdown:\n• 🛍️ Shopping: ₹3,399 (45.7%)\n• 🍔 Food: ₹1,465 (19.7%)\n• 🎬 Entertainment: ₹1,288 (17.3%)\n• 🥦 Groceries: ₹890 (12.0%)\n• 🚗 Travel: ₹395 (5.3%)',
};

export const categories = ['Food', 'Travel', 'Shopping', 'Entertainment', 'Groceries', 'Utilities', 'Health', 'Education'];
