import React, { useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Target,
  AlertCircle,
  Award,
  Users,
  CreditCard,
  PiggyBank
} from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = ({ expenses, wallets, income, budgets, lends = [], loans = [] }) => {
  // Calculate today's expenses
  const today = new Date();
  const todayExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfDay(today) && expenseDate <= endOfDay(today);
  }).reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate monthly expenses
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= startOfMonth(today) && expenseDate <= endOfMonth(today);
  }).reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate total income
  const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);

  // Calculate total balance
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  // Calculate lend/loan totals
  const totalLent = lends.reduce((sum, l) => sum + (l.status === 'pending' ? l.amount : 0), 0);
  const totalBorrowed = loans.reduce((sum, l) => sum + (l.remainingAmount || 0), 0);
  const netLend = totalLent - totalBorrowed;

  // Calculate budget progress
  const monthlyBudgetProgress = (monthlyExpenses / budgets.monthly) * 100;

  // Check for budget alerts
  useEffect(() => {
    if (monthlyBudgetProgress >= 80 && monthlyBudgetProgress < 100) {
      toast('⚠️ You have used 80% of your monthly budget!', {
        icon: '⚠️',
        duration: 5000,
      });
    } else if (monthlyBudgetProgress >= 100) {
      toast.error('❌ Monthly budget exceeded!', {
        duration: 5000,
      });
    }
  }, [monthlyBudgetProgress]);

  // Calculate daily spending score (1-10)
  const spendingScore = Math.max(0, Math.min(10, 
    10 - (todayExpenses / (budgets.daily / 10))
  ));

  // Calculate financial health meter
  const savingsRate = totalIncome > 0 
    ? ((totalIncome - monthlyExpenses) / totalIncome) * 100 
    : 0;
  
  const healthStatus = savingsRate >= 30 ? 'Excellent' : 
                      savingsRate >= 20 ? 'Good' : 
                      savingsRate >= 10 ? 'Fair' : 'Needs Improvement';

  const stats = [
    {
      name: 'Today\'s Spending',
      value: `₹${todayExpenses.toLocaleString()}`,
      change: todayExpenses > budgets.daily ? '+12%' : '-8%',
      changeType: todayExpenses > budgets.daily ? 'negative' : 'positive',
      icon: TrendingDown,
    },
    {
      name: 'Monthly Spending',
      value: `₹${monthlyExpenses.toLocaleString()}`,
      change: `${monthlyBudgetProgress.toFixed(1)}% of budget`,
      changeType: monthlyBudgetProgress > 80 ? 'negative' : 'positive',
      icon: TrendingUp,
    },
    {
      name: 'Total Balance',
      value: `₹${totalBalance.toLocaleString()}`,
      change: `${wallets.length} wallets`,
      changeType: 'neutral',
      icon: Wallet,
    },
    {
      name: 'Budget Left',
      value: `₹${(budgets.monthly - monthlyExpenses).toLocaleString()}`,
      change: `${(100 - monthlyBudgetProgress).toFixed(1)}% remaining`,
      changeType: monthlyBudgetProgress > 80 ? 'negative' : 'positive',
      icon: Target,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome section with spending score */}
      <div className="premium-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome back! 👋
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
              <Award className="w-5 h-5 mr-2" />
              <span className="font-semibold">Spending Score: {spendingScore.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`
                  p-3 rounded-xl
                  ${stat.changeType === 'positive' ? 'bg-green-100 dark:bg-green-900/30' : ''}
                  ${stat.changeType === 'negative' ? 'bg-red-100 dark:bg-red-900/30' : ''}
                  ${stat.changeType === 'neutral' ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                `}>
                  <Icon className={`
                    w-6 h-6
                    ${stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : ''}
                    ${stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : ''}
                    ${stat.changeType === 'neutral' ? 'text-blue-600 dark:text-blue-400' : ''}
                  `} />
                </div>
              </div>
              <div className="mt-4">
                <span className={`
                  text-sm font-medium
                  ${stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : ''}
                  ${stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' : ''}
                  ${stat.changeType === 'neutral' ? 'text-blue-600 dark:text-blue-400' : ''}
                `}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lend/Loan Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Lent</p>
              <p className="text-2xl font-bold mt-2">₹{totalLent.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 opacity-75" />
          </div>
          <p className="text-xs opacity-75 mt-2">{lends.filter(l => l.status === 'pending').length} pending</p>
        </div>

        <div className="stat-card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Total Borrowed</p>
              <p className="text-2xl font-bold mt-2">₹{totalBorrowed.toLocaleString()}</p>
            </div>
            <CreditCard className="w-8 h-8 opacity-75" />
          </div>
          <p className="text-xs opacity-75 mt-2">{loans.filter(l => l.status === 'active').length} active loans</p>
        </div>

        <div className="stat-card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Net Lend</p>
              <p className="text-2xl font-bold mt-2">₹{netLend.toLocaleString()}</p>
            </div>
            <PiggyBank className="w-8 h-8 opacity-75" />
          </div>
          <p className="text-xs opacity-75 mt-2">{netLend >= 0 ? 'You are a lender' : 'You are a borrower'}</p>
        </div>
      </div>

      {/* Financial Health Meter */}
      <div className="premium-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Financial Health Meter
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {savingsRate.toFixed(1)}%
            </span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(savingsRate, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
            <span className={`
              px-3 py-1 rounded-full text-sm font-medium
              ${healthStatus === 'Excellent' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : ''}
              ${healthStatus === 'Good' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
              ${healthStatus === 'Fair' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
              ${healthStatus === 'Needs Improvement' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
            `}>
              {healthStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Wallets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {wallets.map(wallet => (
          <div key={wallet.id} className="premium-card p-4 text-center">
            <span className="text-3xl mb-2 block">{wallet.icon}</span>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{wallet.name}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">₹{wallet.balance}</p>
          </div>
        ))}
      </div>

      {/* Recent Lends and Loans Preview */}
      {(lends.length > 0 || loans.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lends.length > 0 && (
            <div className="premium-card p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <Users className="w-4 h-4 mr-2" /> Recent Lends
              </h4>
              {lends.slice(0, 3).map(lend => (
                <div key={lend.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{lend.personName}</span>
                  <span className="text-sm font-semibold text-blue-600">₹{lend.amount}</span>
                </div>
              ))}
            </div>
          )}
          
          {loans.length > 0 && (
            <div className="premium-card p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                <CreditCard className="w-4 h-4 mr-2" /> Active Loans
              </h4>
              {loans.slice(0, 3).map(loan => (
                <div key={loan.id} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{loan.lenderName}</span>
                  <span className="text-sm font-semibold text-orange-600">₹{loan.remainingAmount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;