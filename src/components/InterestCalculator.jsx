import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Percent, 
  Calendar, 
  DollarSign, 
  Users,
  UserPlus,
  UserMinus,
  TrendingUp,
  Save,
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  X,
  Plus,
  History,
  Edit2,
  Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInDays, differenceInMonths, differenceInYears, addDays, addMonths, addYears, isBefore, isAfter } from 'date-fns';

const InterestCalculator = ({ lends, setLends, loans, setLoans }) => {
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [activeTab, setActiveTab] = useState('calculator');
  const [transactionType, setTransactionType] = useState('given');
  const [interestType, setInterestType] = useState('simple');
  const [compoundingFrequency, setCompoundingFrequency] = useState('monthly');
  const [calculationBasis, setCalculationBasis] = useState('days');
  
  const [formData, setFormData] = useState({
    principal: '',
    interestRate: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    timePeriod: '',
    personName: '',
    personPhone: '',
    description: '',
    notes: '',
    paymentDate: '', // New field for when user will pay
    partialPayments: [], // For multiple payments
  });

  const [result, setResult] = useState({
    principal: 0,
    interest: 0,
    totalAmount: 0,
    maturityDate: '',
    interestEarned: 0,
    effectiveRate: 0,
    dailyInterest: 0,
    interestPerDay: 0,
    remainingDays: 0,
    projectedAmount: 0,
  });

  const [savedCalculations, setSavedCalculations] = useState([]);
  const [editingCalculation, setEditingCalculation] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Load saved calculations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('interestCalculations');
    if (saved) {
      setSavedCalculations(JSON.parse(saved));
    }
  }, []);

  // Save calculations to localStorage
  useEffect(() => {
    localStorage.setItem('interestCalculations', JSON.stringify(savedCalculations));
  }, [savedCalculations]);

  // Calculate interest based on type and future payment date
  const calculateInterest = () => {
    const principal = parseFloat(formData.principal) || 0;
    const rate = parseFloat(formData.interestRate) || 0;
    
    if (principal <= 0 || rate <= 0) {
      toast.error('Please enter valid principal and interest rate');
      return;
    }

    let interest = 0;
    let totalAmount = 0;
    let maturityDate = '';
    let timeInYears = 0;
    let daysRemaining = 0;
    let dailyInterest = 0;

    // Calculate time period based on dates or manual input
    if (formData.startDate) {
      const start = new Date(formData.startDate);
      let end;

      if (formData.paymentDate) {
        // Calculate until future payment date
        end = new Date(formData.paymentDate);
        if (isBefore(end, start)) {
          toast.error('Payment date must be after start date');
          return;
        }
      } else if (formData.endDate) {
        end = new Date(formData.endDate);
        if (isBefore(end, start)) {
          toast.error('End date must be after start date');
          return;
        }
      } else if (formData.timePeriod) {
        const period = parseFloat(formData.timePeriod) || 0;
        switch (calculationBasis) {
          case 'days':
            end = addDays(start, period);
            break;
          case 'months':
            end = addMonths(start, period);
            break;
          case 'years':
            end = addYears(start, period);
            break;
          default:
            end = addDays(start, period);
        }
      } else {
        toast.error('Please provide either date range, time period, or payment date');
        return;
      }

      if (end) {
        maturityDate = format(end, 'dd MMM yyyy');
        
        // Calculate days remaining
        const today = new Date();
        if (isAfter(end, today)) {
          daysRemaining = differenceInDays(end, today);
        }

        switch (calculationBasis) {
          case 'days':
            timeInYears = differenceInDays(end, start) / 365;
            break;
          case 'months':
            timeInYears = differenceInMonths(end, start) / 12;
            break;
          case 'years':
            timeInYears = differenceInYears(end, start);
            break;
          default:
            timeInYears = differenceInDays(end, start) / 365;
        }

        // Calculate daily interest
        dailyInterest = (principal * rate / 100) / 365;
      }
    }

    // Calculate interest based on type
    switch (interestType) {
      case 'simple':
        interest = (principal * rate * timeInYears) / 100;
        break;

      case 'compound':
        let n = 1;
        switch (compoundingFrequency) {
          case 'monthly': n = 12; break;
          case 'quarterly': n = 4; break;
          case 'half-yearly': n = 2; break;
          case 'annually': n = 1; break;
          default: n = 12;
        }
        const ratePerPeriod = rate / (n * 100);
        const totalPeriods = n * timeInYears;
        const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
        totalAmount = principal * compoundFactor;
        interest = totalAmount - principal;
        break;

      case 'recurring':
        const months = timeInYears * 12;
        const monthlyRate = rate / 1200;
        interest = principal * months * (months + 1) * monthlyRate / 2;
        totalAmount = (principal * months) + interest;
        break;

      default:
        interest = 0;
    }

    if (interestType !== 'compound' && interestType !== 'recurring') {
      totalAmount = principal + interest;
    }

    // Calculate projected amount if payment date is in future
    let projectedAmount = totalAmount;
    if (formData.paymentDate && daysRemaining > 0) {
      const additionalInterest = dailyInterest * daysRemaining;
      projectedAmount = totalAmount + additionalInterest;
    }

    const effectiveRate = timeInYears > 0 ? (interest / principal / timeInYears) * 100 : 0;

    setResult({
      principal,
      interest,
      totalAmount,
      maturityDate,
      interestEarned: interest,
      effectiveRate: isNaN(effectiveRate) ? 0 : effectiveRate,
      timeInYears,
      dailyInterest,
      remainingDays: daysRemaining,
      projectedAmount,
    });

    toast.success('Interest calculated successfully!');
  };

  // Calculate interest from today until payment date
  const calculateFromToday = () => {
    setFormData({
      ...formData,
      startDate: new Date().toISOString().split('T')[0],
    });
    setTimeout(() => calculateInterest(), 100);
  };

  // Save calculation as lend/loan record
  const saveAsTransaction = () => {
    if (!formData.personName) {
      toast.error('Please enter person name');
      return;
    }

    const transaction = {
      id: editingCalculation?.id || Date.now().toString(),
      personName: formData.personName,
      personPhone: formData.personPhone || '',
      amount: result.principal,
      interestAmount: result.interest,
      totalAmount: result.totalAmount,
      projectedAmount: result.projectedAmount,
      interestRate: parseFloat(formData.interestRate) || 0,
      interestType: interestType,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
      maturityDate: result.maturityDate,
      description: formData.description || `Interest calculation for ${formData.personName}`,
      status: 'pending',
      notes: formData.notes || '',
      transactionType: transactionType,
      calculationResult: result,
      createdAt: new Date().toISOString(),
    };

    if (transactionType === 'given') {
      const newLend = {
        id: transaction.id,
        personName: transaction.personName,
        personPhone: transaction.personPhone,
        amount: transaction.amount,
        date: transaction.startDate,
        dueDate: transaction.paymentDate || transaction.endDate,
        description: transaction.description,
        status: 'pending',
        notes: `Interest: ${transaction.interestRate}% (${interestType})\nMaturity: ${result.maturityDate}\nTotal due: ₹${result.projectedAmount || result.totalAmount}\nDaily Interest: ₹${result.dailyInterest.toFixed(2)}`,
      };
      setLends([newLend, ...lends]);
      toast.success('Saved to Lend Tracker');
    } else {
      const newLoan = {
        id: transaction.id,
        lenderName: transaction.personName,
        loanType: 'personal',
        principalAmount: transaction.amount,
        interestRate: transaction.interestRate,
        startDate: transaction.startDate,
        paidAmount: 0,
        remainingAmount: result.projectedAmount || result.totalAmount,
        status: 'active',
        notes: `Interest: ${transaction.interestRate}% (${interestType})\nMaturity: ${result.maturityDate}\nTotal due: ₹${result.projectedAmount || result.totalAmount}\nDaily Interest: ₹${result.dailyInterest.toFixed(2)}`,
      };
      setLoans([newLoan, ...loans]);
      toast.success('Saved to Loan Tracker');
    }

    // Save to calculation history
    if (editingCalculation) {
      setSavedCalculations(savedCalculations.map(c => c.id === editingCalculation.id ? transaction : c));
      toast.success('Calculation updated');
    } else {
      setSavedCalculations([transaction, ...savedCalculations]);
      toast.success('Calculation saved to history');
    }

    setShowCalculatorModal(false);
    setEditingCalculation(null);
    resetForm();
  };

  // Reset calculator
  const resetForm = () => {
    setFormData({
      principal: '',
      interestRate: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      timePeriod: '',
      personName: '',
      personPhone: '',
      description: '',
      notes: '',
      paymentDate: '',
      partialPayments: [],
    });
    setResult({
      principal: 0,
      interest: 0,
      totalAmount: 0,
      maturityDate: '',
      interestEarned: 0,
      effectiveRate: 0,
      dailyInterest: 0,
      interestPerDay: 0,
      remainingDays: 0,
      projectedAmount: 0,
    });
  };

  // Load previous calculation
  const loadCalculation = (calc) => {
    setTransactionType(calc.transactionType);
    setInterestType(calc.interestType);
    setFormData({
      principal: calc.amount.toString(),
      interestRate: calc.interestRate.toString(),
      startDate: calc.startDate.split('T')[0],
      endDate: calc.endDate ? calc.endDate.split('T')[0] : '',
      paymentDate: calc.paymentDate ? calc.paymentDate.split('T')[0] : '',
      timePeriod: '',
      personName: calc.personName,
      personPhone: calc.personPhone || '',
      description: calc.description,
      notes: calc.notes,
      partialPayments: [],
    });
    setResult(calc.calculationResult || calc.result);
    setEditingCalculation(calc);
    setShowCalculatorModal(true);
    setShowHistoryModal(false);
  };

  // Delete calculation from history
  const deleteCalculation = (id) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      setSavedCalculations(savedCalculations.filter(c => c.id !== id));
      toast.success('Calculation deleted');
    }
  };

  // Handle partial payment
  const addPartialPayment = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    const payment = {
      id: Date.now().toString(),
      amount: parseFloat(paymentAmount),
      date: new Date().toISOString(),
      remainingAfter: result.projectedAmount - parseFloat(paymentAmount),
    };

    setFormData({
      ...formData,
      partialPayments: [...formData.partialPayments, payment],
    });
    setShowPaymentModal(false);
    setPaymentAmount('');
    
    // Recalculate with new balance
    const newPrincipal = result.projectedAmount - payment.amount;
    toast.success(`Payment added. Remaining: ₹${newPrincipal.toLocaleString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interest Calculator</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Calculate interest for given or taken loans with various interest types
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              resetForm();
              setEditingCalculation(null);
              setShowCalculatorModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Calculator className="w-5 h-5" />
            <span>New Calculation</span>
          </button>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <History className="w-5 h-5" />
            <span>History ({savedCalculations.length})</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card bg-gradient-to-br from-green-500 to-emerald-500 text-white">
          <p className="text-sm opacity-90">Active Lends (Given)</p>
          <p className="text-3xl font-bold mt-2">
            {lends.filter(l => l.status === 'pending').length}
          </p>
        </div>
        <div className="stat-card bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <p className="text-sm opacity-90">Active Loans (Taken)</p>
          <p className="text-3xl font-bold mt-2">
            {loans.filter(l => l.status === 'active').length}
          </p>
        </div>
        <div className="stat-card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
          <p className="text-sm opacity-90">Saved Calculations</p>
          <p className="text-3xl font-bold mt-2">{savedCalculations.length}</p>
        </div>
      </div>

      {/* Calculator Modal */}
      {showCalculatorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="premium-card p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingCalculation ? 'Edit Calculation' : 'Interest Calculator'}
              </h3>
              <button
                onClick={() => {
                  setShowCalculatorModal(false);
                  setEditingCalculation(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calculator Form */}
              <div className="space-y-4">
                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Transaction Type
                  </label>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => setTransactionType('given')}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                        transactionType === 'given'
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <UserPlus className={`w-5 h-5 ${transactionType === 'given' ? 'text-green-600' : 'text-gray-500'}`} />
                      <span className={transactionType === 'given' ? 'text-green-700 dark:text-green-400' : ''}>
                        I'm Giving
                      </span>
                    </button>
                    <button
                      onClick={() => setTransactionType('taken')}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center space-x-2 ${
                        transactionType === 'taken'
                          ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <UserMinus className={`w-5 h-5 ${transactionType === 'taken' ? 'text-orange-600' : 'text-gray-500'}`} />
                      <span className={transactionType === 'taken' ? 'text-orange-700 dark:text-orange-400' : ''}>
                        I'm Taking
                      </span>
                    </button>
                  </div>
                </div>

                {/* Interest Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Interest Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setInterestType('simple')}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        interestType === 'simple'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">Simple</span>
                    </button>
                    <button
                      onClick={() => setInterestType('compound')}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        interestType === 'compound'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">Compound</span>
                    </button>
                    <button
                      onClick={() => setInterestType('recurring')}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        interestType === 'recurring'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">Recurring</span>
                    </button>
                  </div>
                </div>

                {interestType === 'compound' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compounding Frequency
                    </label>
                    <select
                      value={compoundingFrequency}
                      onChange={(e) => setCompoundingFrequency(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="half-yearly">Half Yearly</option>
                      <option value="annually">Annually</option>
                    </select>
                  </div>
                )}

                {/* Principal Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.principal}
                    onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                    placeholder="Enter amount"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                {/* Interest Rate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Percent className="w-4 h-4 inline mr-2" />
                    Interest Rate (% per annum)
                  </label>
                  <input
                    type="number"
                    value={formData.interestRate}
                    onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                    placeholder="Enter rate"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                {/* Payment Date (New) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Expected Payment Date (Optional)
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value, endDate: '' })}
                      min={formData.startDate}
                      className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    <button
                      onClick={calculateFromToday}
                      className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                    >
                      Today
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Calculate interest from today until payment date
                  </p>
                </div>

                {/* OR End Date */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date (Fixed)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value, paymentDate: '' })}
                    min={formData.startDate}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>

                {/* OR Time Period */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OR</span>
                  </div>
                </div>

                {/* Time Period */}
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={formData.timePeriod}
                    onChange={(e) => setFormData({ ...formData, timePeriod: e.target.value, endDate: '', paymentDate: '' })}
                    placeholder={`Time in ${calculationBasis}`}
                    min="0"
                    step="0.01"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                  <select
                    value={calculationBasis}
                    onChange={(e) => setCalculationBasis(e.target.value)}
                    className="w-24 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  >
                    <option value="days">Days</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>

                {/* Person Details */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Person Details</h4>
                  
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.personName}
                      onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                      placeholder="Person Name *"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    
                    <input
                      type="tel"
                      value={formData.personPhone}
                      onChange={(e) => setFormData({ ...formData, personPhone: e.target.value })}
                      placeholder="Phone Number"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description"
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                    
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows="2"
                      placeholder="Additional notes..."
                      className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={calculateInterest}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <Calculator className="w-5 h-5" />
                    <span>Calculate</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="space-y-4">
                {/* Result Card */}
                <div className="premium-card p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <h4 className="text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Calculation Result
                  </h4>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm opacity-90">Principal Amount</p>
                      <p className="text-3xl font-bold">₹{result.principal.toLocaleString()}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm opacity-90">Interest Earned</p>
                        <p className="text-2xl font-bold text-yellow-300">+₹{result.interest.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm opacity-90">Total Amount</p>
                        <p className="text-2xl font-bold">₹{result.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {result.maturityDate && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="w-4 h-4 opacity-75" />
                        <span>Maturity: {result.maturityDate}</span>
                      </div>
                    )}

                    {result.dailyInterest > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 opacity-75" />
                        <span>Daily Interest: ₹{result.dailyInterest.toFixed(2)}</span>
                      </div>
                    )}

                    {result.remainingDays > 0 && (
                      <div className="flex items-center space-x-2 text-sm">
                        <AlertCircle className="w-4 h-4 opacity-75" />
                        <span>{result.remainingDays} days remaining</span>
                      </div>
                    )}

                    {result.projectedAmount > result.totalAmount && (
                      <div className="pt-2 border-t border-white/20">
                        <p className="text-sm opacity-90">Projected Amount by Payment Date</p>
                        <p className="text-2xl font-bold text-green-300">₹{result.projectedAmount.toLocaleString()}</p>
                      </div>
                    )}

                    <div className="pt-4 border-t border-white/20">
                      <div className="flex justify-between text-sm">
                        <span>Effective Rate</span>
                        <span className="font-semibold">{result.effectiveRate.toFixed(2)}% p.a.</span>
                      </div>
                    </div>

                    {result.principal > 0 && (
                      <button
                        onClick={saveAsTransaction}
                        disabled={!formData.personName}
                        className={`w-full mt-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                          formData.personName
                            ? 'bg-white text-blue-600 hover:bg-blue-50'
                            : 'bg-white/20 text-white/50 cursor-not-allowed'
                        }`}
                      >
                        <Save className="w-5 h-5" />
                        <span>Save as {transactionType === 'given' ? 'Lend' : 'Loan'} Record</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Info Card */}
                <div className="premium-card p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                    Interest Information
                  </h4>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {interestType === 'simple' && (
                      <p>Simple Interest: P × R × T / 100</p>
                    )}
                    {interestType === 'compound' && (
                      <p>Compound Interest: Compounded {compoundingFrequency}</p>
                    )}
                    {interestType === 'recurring' && (
                      <p>Recurring Deposit: For monthly deposits</p>
                    )}
                    {formData.paymentDate && (
                      <p className="mt-2 text-green-600 dark:text-green-400">
                        ✓ Interest calculated until payment date
                      </p>
                    )}
                  </div>
                </div>

                {/* Partial Payments Section */}
                {formData.partialPayments.length > 0 && (
                  <div className="premium-card p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Payment History
                    </h4>
                    <div className="space-y-2">
                      {formData.partialPayments.map((payment, index) => (
                        <div key={payment.id} className="flex justify-between text-sm">
                          <span>Payment {index + 1}: ₹{payment.amount.toLocaleString()}</span>
                          <span className="text-gray-500">
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Calculation History
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {savedCalculations.length === 0 ? (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No calculations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedCalculations.map((calc) => (
                  <div
                    key={calc.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          calc.transactionType === 'given'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                            : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
                        }`}>
                          {calc.transactionType === 'given' ? <UserPlus className="w-5 h-5" /> : <UserMinus className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{calc.personName || 'Unknown'}</h4>
                          <p className="text-sm text-gray-500">
                            {calc.transactionType === 'given' ? 'Given to' : 'Taken from'} • {new Date(calc.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => loadCalculation(calc)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"
                          title="Load Calculation"
                        >
                          <Calculator className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCalculation(calc.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div>
                        <p className="text-xs text-gray-500">Principal</p>
                        <p className="text-sm font-semibold">₹{calc.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Interest</p>
                        <p className="text-sm font-semibold text-green-600">+₹{(calc.calculationResult?.interest || calc.interestAmount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-sm font-semibold">₹{(calc.calculationResult?.totalAmount || calc.totalAmount || 0).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Percent className="w-3 h-3 mr-1" />
                        {calc.interestRate}% • {calc.interestType}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Maturity: {calc.calculationResult?.maturityDate || calc.maturityDate || 'N/A'}
                      </span>
                    </div>

                    {calc.paymentDate && (
                      <div className="mt-2 text-xs text-green-600">
                        Payment Date: {new Date(calc.paymentDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50">
          <div className="premium-card p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add Partial Payment
            </h3>
            <input
              type="number"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter payment amount"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={addPartialPayment}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
              >
                Add Payment
              </button>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterestCalculator;