📊 Premium Expense Tracker
A modern, feature-rich expense tracking application built with React, Tailwind CSS, and Vite. Track your expenses, manage multiple wallets, set budgets, and visualize your spending with beautiful charts.

✨ Features
📱 Core Features
✅ Add/Edit/Delete Expenses - Full CRUD operations for expense management

✅ Multiple Categories - Predefined categories with custom icons

✅ Payment Methods - Cash, Card, UPI, Net Banking

✅ Dark/Light Mode - Toggle between themes

✅ Responsive Design - Works perfectly on mobile, tablet, and desktop

💰 Financial Management
✅ Multi-Wallet Support - Track Cash, Bank, UPI, Credit Cards separately

✅ Income Tracking - Add income sources and calculate savings

✅ Budget Management - Set daily/weekly/monthly budgets with alerts

✅ Savings Goals - Track progress towards financial goals

✅ Recurring Expenses - Auto-add recurring transactions

📊 Analytics & Visualization
✅ Interactive Charts - Pie charts for categories, Line charts for trends

✅ Weekly/Monthly Analysis - Bar charts for spending patterns

✅ Dashboard Overview - Quick view of all financial metrics

✅ Spending Score - Daily spending evaluation (1-10)

📁 Data Management
✅ Export Data - Download as Excel, PDF, or CSV

✅ Import Data - Upload expenses/income from Excel/CSV files

✅ Data Backup - Export/import complete application data

✅ Preview Before Import - Review data before importing

🎯 Premium Features
✅ Financial Health Meter - Evaluate your financial condition

✅ Budget Alerts - Notifications when nearing budget limits

✅ Spending Insights - Category-wise spending analysis

✅ Glass Morphism UI - Modern, premium design with blur effects

🛠️ Tech Stack
Frontend: React 18

Build Tool: Vite

Styling: Tailwind CSS

Charts: Recharts

Icons: Lucide React

Date Handling: date-fns

Excel Export/Import: XLSX

PDF Export: jsPDF, jspdf-autotable

Notifications: React Hot Toast

Routing: React Router v6

📁 Project Structure
text
expense-tracker/
├── public/                  # Static assets
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── AddExpense.jsx   # Add expense form
│   │   ├── ExpenseList.jsx  # Expense listing
│   │   ├── Charts.jsx       # Analytics charts
│   │   ├── BudgetTracker.jsx # Budget management
│   │   ├── MultiWallet.jsx  # Wallet management
│   │   ├── IncomeTracker.jsx # Income tracking
│   │   ├── SavingsGoals.jsx # Savings goals
│   │   ├── ExportData.jsx   # Import/Export functionality
│   │   ├── Settings.jsx     # App settings
│   │   └── Layout.jsx       # Main layout with sidebar
│   ├── context/             # Context providers
│   │   └── ThemeContext.jsx # Dark mode context
│   ├── utils/               # Utility functions
│   │   └── exportUtils.js   # Export helpers
│   ├── App.jsx              # Main app component
│   ├── index.jsx            # Entry point
│   └── index.css            # Global styles
├── .env.example             # Environment variables example
├── index.html               # HTML template
├── package.json             # Dependencies
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
└── vite.config.js           # Vite configuration
🚀 Getting Started
Prerequisites
Node.js (v16 or higher)

npm or yarn

Installation
Clone the repository

bash
git clone https://github.com/yourusername/expense-tracker.git
cd expense-tracker
Install dependencies

bash
npm install
Start the development server

bash
npm run dev
Open your browser

text
http://localhost:3000
📦 Build for Production
bash
npm run build
The build output will be in the dist folder.

🎯 How to Use
Adding Expenses
Click "Add Expense" in the sidebar

Enter amount, select category, choose payment method

Add description and date

Click "Add Expense"

Managing Wallets
Go to "Wallets" section

Add wallets (Cash, Bank, UPI, Credit Card)

Set initial balances

Track balances automatically as you add expenses

Setting Budgets
Navigate to "Budget" section

Set daily, weekly, and monthly limits

Get alerts when approaching limits

Import/Export Data
Go to "Export" section

Choose data type (Expenses, Income, etc.)

Select format (Excel, PDF, CSV)

Download or upload data

🌐 Deployment
Deploy to Vercel (Recommended)
Push your code to GitHub

Visit vercel.com

Import your repository

Vercel auto-detects Vite - Click "Deploy"

Your app is live at your-app.vercel.app

Deploy to Netlify
bash
npm run build
# Drag and drop the 'dist' folder to Netlify
📝 Environment Variables
Create a .env file in the root directory:

env
VITE_APP_NAME=ExpenseTracker
VITE_APP_VERSION=1.0.0
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/AmazingFeature)

Commit your changes (git commit -m 'Add some AmazingFeature')

Push to the branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Icons by Lucide React

Charts by Recharts

UI inspiration from modern finance apps

📧 Contact
Your Name - @yourtwitter - email@example.com

Project Link: https://github.com/yourusername/expense-tracker

Made with ❤️ using React, Tailwind CSS, and Vite

