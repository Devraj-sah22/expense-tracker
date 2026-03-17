import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import AddExpense from './components/AddExpense';
import Charts from './components/Charts';
import BudgetTracker from './components/BudgetTracker';
import MultiWallet from './components/MultiWallet';
import IncomeTracker from './components/IncomeTracker';
import SavingsGoals from './components/SavingsGoals';
import ExportData from './components/ExportData';
import Settings from './components/Settings';
import LendTracker from './components/LendTracker';
import LoanTracker from './components/LoanTracker';
import Categories from './components/Categories';
import Notes from './components/Notes';
import BankStatements from './components/BankStatements';
import InterestCalculator from './components/InterestCalculator';

function App() {
  // Expenses State
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Wallets State
  const [wallets, setWallets] = useState(() => {
    const saved = localStorage.getItem('wallets');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Cash', balance: 5000, icon: '💰', type: 'cash' },
      { id: '2', name: 'Bank', balance: 15000, icon: '🏦', type: 'bank' },
      { id: '3', name: 'UPI', balance: 3000, icon: '📱', type: 'upi' },
      { id: '4', name: 'Credit Card', balance: -2000, icon: '💳', type: 'card' },
    ];
  });

  // Income State
  const [income, setIncome] = useState(() => {
    const saved = localStorage.getItem('income');
    return saved ? JSON.parse(saved) : [];
  });

  // Savings Goals State
  const [savingsGoals, setSavingsGoals] = useState(() => {
    const saved = localStorage.getItem('savingsGoals');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Buy Laptop', target: 60000, saved: 18000, icon: '💻', progress: 30 },
      { id: '2', name: 'Vacation', target: 50000, saved: 12500, icon: '✈️', progress: 25 },
    ];
  });

  // Lends State
  const [lends, setLends] = useState(() => {
    const saved = localStorage.getItem('lends');
    return saved ? JSON.parse(saved) : [];
  });

  // Loans State
  const [loans, setLoans] = useState(() => {
    const saved = localStorage.getItem('loans');
    return saved ? JSON.parse(saved) : [];
  });

  // Budgets State
  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('budgets');
    return saved ? JSON.parse(saved) : {
      daily: 1000,
      weekly: 7000,
      monthly: 30000,
    };
  });

  // Categories State
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    return saved ? JSON.parse(saved) : [];
  });

  // Notes State
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        title: 'Welcome to Notes',
        content: 'Use this space to jot down important financial reminders, goals, or ideas.',
        category: 'personal',
        isPinned: true,
        color: 'blue',
        tags: ['welcome', 'guide'],
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Monthly Budget Review',
        content: 'Remember to review your monthly budget on the last day of each month.',
        category: 'financial',
        isPinned: false,
        color: 'green',
        tags: ['budget', 'reminder'],
        createdAt: new Date().toISOString(),
      },
    ];
  });

  // Bank Statements State
  const [banks, setBanks] = useState(() => {
    const saved = localStorage.getItem('banks');
    return saved ? JSON.parse(saved) : [];
  });

  const [bankTransactions, setBankTransactions] = useState(() => {
    const saved = localStorage.getItem('bankTransactions');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('wallets', JSON.stringify(wallets));
  }, [wallets]);

  useEffect(() => {
    localStorage.setItem('income', JSON.stringify(income));
  }, [income]);

  useEffect(() => {
    localStorage.setItem('savingsGoals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('lends', JSON.stringify(lends));
  }, [lends]);

  useEffect(() => {
    localStorage.setItem('loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('banks', JSON.stringify(banks));
  }, [banks]);

  useEffect(() => {
    localStorage.setItem('bankTransactions', JSON.stringify(bankTransactions));
  }, [bankTransactions]);

  // Expense Functions
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date(expense.date).toISOString(),
    };
    setExpenses([newExpense, ...expenses]);

    // Update wallet balance
    setWallets(wallets.map(wallet =>
      wallet.id === expense.walletId
        ? { ...wallet, balance: wallet.balance - expense.amount }
        : wallet
    ));
  };

  const deleteExpense = (id) => {
    const expense = expenses.find(e => e.id === id);
    if (expense) {
      setWallets(wallets.map(wallet =>
        wallet.id === expense.walletId
          ? { ...wallet, balance: wallet.balance + expense.amount }
          : wallet
      ));
    }
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const editExpense = (id, updatedExpense) => {
    const oldExpense = expenses.find(e => e.id === id);
    if (oldExpense) {
      setWallets(wallets.map(wallet => {
        if (wallet.id === oldExpense.walletId) {
          return { ...wallet, balance: wallet.balance + oldExpense.amount };
        }
        return wallet;
      }));

      setWallets(wallets.map(wallet => {
        if (wallet.id === updatedExpense.walletId) {
          return { ...wallet, balance: wallet.balance - updatedExpense.amount };
        }
        return wallet;
      }));
    }

    setExpenses(expenses.map(e =>
      e.id === id ? { ...updatedExpense, id, date: new Date(updatedExpense.date).toISOString() } : e
    ));
  };

  return (
    <ThemeProvider>
      <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            className: 'dark:bg-gray-800 dark:text-white',
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              icon: '✅',
            },
            error: {
              duration: 4000,
              icon: '❌',
            },
          }}
        />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard Route */}
            <Route path="dashboard" element={
              <Dashboard
                expenses={expenses}
                wallets={wallets}
                income={income}
                budgets={budgets}
                lends={lends}
                loans={loans}
                banks={banks}
              />
            } />

            {/* Expenses Routes */}
            <Route path="expenses" element={
              <ExpenseList
                expenses={expenses}
                onDelete={deleteExpense}
                onEdit={editExpense}
                onImport={setExpenses}  // Add this line
                wallets={wallets}
              />
            } />
            {/* <Route path="expenses" element={
              <ExpenseList 
                expenses={expenses}
                onDelete={deleteExpense}
                onEdit={editExpense}
                wallets={wallets}
              />
            } /> */}

            <Route path="add-expense" element={
              <AddExpense
                onAddExpense={addExpense}
                wallets={wallets}
              />
            } />

            {/* Analytics Route */}
            <Route path="charts" element={
              <Charts expenses={expenses} />
            } />

            {/* Budget Route */}
            <Route path="budget" element={
              <BudgetTracker
                expenses={expenses}
                budgets={budgets}
                setBudgets={setBudgets}
              />
            } />

            {/* Wallets Route */}
            <Route path="wallets" element={
              <MultiWallet
                wallets={wallets}
                setWallets={setWallets}
              />
            } />

            {/* Income Route */}
            <Route path="income" element={
              <IncomeTracker
                income={income}
                setIncome={setIncome}
                expenses={expenses}
              />
            } />

            {/* Savings Goals Route */}
            <Route path="savings" element={
              <SavingsGoals
                goals={savingsGoals}
                setGoals={setSavingsGoals}
              />
            } />

            {/* Lend Tracker Route */}
            <Route path="lend" element={
              <LendTracker
                lends={lends}
                setLends={setLends}
              />
            } />

            {/* Loan Tracker Route */}
            <Route path="loan" element={
              <LoanTracker
                loans={loans}
                setLoans={setLoans}
              />
            } />

            {/* Categories Route */}
            <Route path="categories" element={
              <Categories
                categories={categories}
                setCategories={setCategories}
                expenses={expenses}
              />
            } />

            {/* Notes Route */}
            <Route path="notes" element={
              <Notes
                notes={notes}
                setNotes={setNotes}
              />
            } />

            {/* Bank Statements Route */}
            <Route path="banks" element={
              <BankStatements
                banks={banks}
                setBanks={setBanks}
                transactions={bankTransactions}
                setTransactions={setBankTransactions}
              />
            } />

            {/* Interest Calculator Route */}
            <Route path="interest" element={
              <InterestCalculator
                lends={lends}
                setLends={setLends}
                loans={loans}
                setLoans={setLoans}
              />
            } />

            {/* Export Data Route */}
            <Route path="export" element={
              <ExportData
                expenses={expenses}
                income={income}
                wallets={wallets}
                savingsGoals={savingsGoals}
                setExpenses={setExpenses}
                setIncome={setIncome}
              />
            } />

            {/* Settings Route */}
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;