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
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInDays, differenceInMonths, differenceInYears, addDays, addMonths, addYears } from 'date-fns';

const InterestCalculator = ({ lends, setLends, loans, setLoans }) => {
  const [activeTab, setActiveTab] = useState('calculator'); // calculator, history
  const [transactionType, setTransactionType] = useState('given'); // given, taken
  const [interestType, setInterestType] = useState('simple'); // simple, compound, recurring
  const [compoundingFrequency, setCompoundingFrequency] = useState('monthly'); // monthly, quarterly, half-yearly, annually
  const [calculationBasis, setCalculationBasis] = useState('days'); // days, months, years
  
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
  });

  const [result, setResult] = useState({
    principal: 0,
    interest: 0,
    totalAmount: 0,
    maturityDate: '',
    interestEarned: 0,
    effectiveRate: 0,
  });

  const [savedCalculations, setSavedCalculations] = useState([]);

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

  // Calculate interest based on type
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

    // Calculate time period based on dates or manual input
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end < start) {
        toast.error('End date must be after start date');
        return;
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
      
      maturityDate = format(end, 'dd MMM yyyy');
    } else if (formData.timePeriod) {
      timeInYears = parseFloat(formData.timePeriod) || 0;
      
      if (formData.startDate) {
        const start = new Date(formData.startDate);
        let end;
        switch (calculationBasis) {
          case 'days':
            end = addDays(start, timeInYears);
            timeInYears = timeInYears / 365;
            break;
          case 'months':
            end = addMonths(start, timeInYears);
            timeInYears = timeInYears / 12;
            break;
          case 'years':
            end = addYears(start, timeInYears);
            break;
          default:
            end = addDays(start, timeInYears);
            timeInYears = timeInYears / 365;
        }
        maturityDate = format(end, 'dd MMM yyyy');
      }
    } else {
      toast.error('Please provide either date range or time period');
      return;
    }

    // Calculate interest based on type
    switch (interestType) {
      case 'simple':
        // Simple Interest: P * R * T / 100
        interest = (principal * rate * timeInYears) / 100;
        break;

      case 'compound':
        // Compound Interest: P * (1 + R/n)^(n*t) - P
        let n = 1;
        switch (compoundingFrequency) {
          case 'monthly':
            n = 12;
            break;
          case 'quarterly':
            n = 4;
            break;
          case 'half-yearly':
            n = 2;
            break;
          case 'annually':
            n = 1;
            break;
          default:
            n = 12;
        }
        const ratePerPeriod = rate / (n * 100);
        const totalPeriods = n * timeInYears;
        const compoundFactor = Math.pow(1 + ratePerPeriod, totalPeriods);
        totalAmount = principal * compoundFactor;
        interest = totalAmount - principal;
        break;

      case 'recurring':
        // Recurring Deposit: P * n * (n+1) * r / 2400 (for monthly)
        const months = timeInYears * 12;
        const monthlyRate = rate / 1200; // rate/100/12
        interest = principal * months * (months + 1) * monthlyRate / 2;
        totalAmount = (principal * months) + interest;
        break;

      default:
        interest = 0;
    }

    if (interestType !== 'compound' && interestType !== 'recurring') {
      totalAmount = principal + interest;
    }

    const effectiveRate = (interest / principal / timeInYears) * 100;

    setResult({
      principal,
      interest,
      totalAmount,
      maturityDate,
      interestEarned: interest,
      effectiveRate: isNaN(effectiveRate) ? 0 : effectiveRate,
      timeInYears,
    });

    toast.success('Interest calculated successfully!');
  };

  // Save calculation as lend/loan record
  const saveAsTransaction = () => {
    if (!formData.personName) {
      toast.error('Please enter person name');
      return;
    }

    const transaction = {
      id: Date.now().toString(),
      personName: formData.personName,
      personPhone: formData.personPhone || '',
      amount: result.principal,
      interestAmount: result.interest,
      totalAmount: result.totalAmount,
      interestRate: parseFloat(formData.interestRate) || 0,
      interestType: interestType,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      maturityDate: result.maturityDate,
      description: formData.description || `Interest calculation for ${formData.personName}`,
      status: 'pending',
      notes: formData.notes || '',
      transactionType: transactionType,
      createdAt: new Date().toISOString(),
    };

    if (transactionType === 'given') {
      // Save as lend
      const newLend = {
        id: transaction.id,
        personName: transaction.personName,
        personPhone: transaction.personPhone,
        amount: transaction.amount,
        date: transaction.startDate,
        dueDate: transaction.endDate,
        description: transaction.description,
        status: 'pending',
        notes: `Interest: ${transaction.interestRate}% (${interestType})\nMaturity: ${result.maturityDate}\nTotal due: ₹${transaction.totalAmount}`,
      };
      setLends([newLend, ...lends]);
      toast.success('Saved to Lend Tracker');
    } else {
      // Save as loan
      const newLoan = {
        id: transaction.id,
        lenderName: transaction.personName,
        loanType: 'personal',
        principalAmount: transaction.amount,
        interestRate: transaction.interestRate,
        startDate: transaction.startDate,
        paidAmount: 0,
        remainingAmount: transaction.totalAmount,
        status: 'active',
        notes: `Interest: ${transaction.interestRate}% (${interestType})\nMaturity: ${result.maturityDate}\nTotal due: ₹${transaction.totalAmount}`,
      };
      setLoans([newLoan, ...loans]);
      toast.success('Saved to Loan Tracker');
    }

    // Save to calculation history
    const calculationRecord = {
      ...transaction,
      result: result,
      savedAt: new Date().toISOString(),
    };
    setSavedCalculations([calculationRecord, ...savedCalculations]);

    // Reset form
    setActiveTab('history');
  };

  // Reset calculator
  const resetCalculator = () => {
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
    });
    setResult({
      principal: 0,
      interest: 0,
      totalAmount: 0,
      maturityDate: '',
      interestEarned: 0,
      effectiveRate: 0,
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
      timePeriod: '',
      personName: calc.personName,
      personPhone: calc.personPhone || '',
      description: calc.description,
      notes: calc.notes,
    });
    setResult(calc.result);
    setActiveTab('calculator');
  };

  // Delete calculation from history
  const deleteCalculation = (id) => {
    if (window.confirm('Are you sure you want to delete this calculation?')) {
      setSavedCalculations(savedCalculations.filter(c => c.id !== id));
      toast.success('Calculation deleted');
    }
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
            onClick={() => setActiveTab('calculator')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'calculator'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calculator</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center space-x-2 ${
              activeTab === 'history'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>History ({savedCalculations.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calculator Form */}
          <div className="premium-card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Calculate Interest
            </h3>

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

              {/* Calculation Basis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Calculation Basis
                </label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCalculationBasis('days')}
                    className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                      calculationBasis === 'days'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Days
                  </button>
                  <button
                    onClick={() => setCalculationBasis('months')}
                    className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                      calculationBasis === 'months'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Months
                  </button>
                  <button
                    onClick={() => setCalculationBasis('years')}
                    className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                      calculationBasis === 'years'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    Years
                  </button>
                </div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                  />
                </div>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Period ({calculationBasis === 'days' ? 'Days' : calculationBasis === 'months' ? 'Months' : 'Years'})
                </label>
                <input
                  type="number"
                  value={formData.timePeriod}
                  onChange={(e) => setFormData({ ...formData, timePeriod: e.target.value, endDate: '' })}
                  placeholder={`Enter time in ${calculationBasis}`}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                />
              </div>

              {/* Person Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">Person Details (Optional)</h4>
                
                <div className="space-y-3">
                  <input
                    type="text"
                    value={formData.personName}
                    onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                    placeholder="Person Name"
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
                  onClick={resetCalculator}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {/* Result Card */}
            <div className="premium-card p-6 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Calculation Result
              </h3>

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
                    <span>Maturity Date: {result.maturityDate}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span>Effective Interest Rate</span>
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
            <div className="premium-card p-6">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2 text-blue-500" />
                Interest Type Information
              </h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {interestType === 'simple' && (
                  <>
                    <p><span className="font-medium text-gray-900 dark:text-white">Simple Interest:</span> Interest is calculated only on the principal amount.</p>
                    <p className="text-xs mt-2">Formula: P × R × T / 100</p>
                  </>
                )}
                {interestType === 'compound' && (
                  <>
                    <p><span className="font-medium text-gray-900 dark:text-white">Compound Interest:</span> Interest is calculated on principal + accumulated interest.</p>
                    <p className="text-xs mt-2">Compounding: {compoundingFrequency}</p>
                  </>
                )}
                {interestType === 'recurring' && (
                  <>
                    <p><span className="font-medium text-gray-900 dark:text-white">Recurring Deposit:</span> For monthly deposits with compound interest.</p>
                    <p className="text-xs mt-2">Assumes monthly deposits of the principal amount</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* History Tab */
        <div className="premium-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Calculation History
          </h3>

          {savedCalculations.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                          {calc.transactionType === 'given' ? 'Given to' : 'Taken from'} • {new Date(calc.savedAt).toLocaleDateString()}
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
                      <p className="text-sm font-semibold text-green-600">+₹{calc.result.interest.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-sm font-semibold">₹{calc.result.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <Percent className="w-3 h-3 mr-1" />
                      {calc.interestRate}% • {calc.interestType}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Maturity: {calc.result.maturityDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterestCalculator;