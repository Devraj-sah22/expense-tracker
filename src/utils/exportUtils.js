import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToExcel = (data, filename = 'expenses') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Expenses');
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToPDF = (data, filename = 'expenses') => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Expense Report', 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 32);
  
  const tableColumn = ['Date', 'Category', 'Description', 'Amount', 'Payment Method'];
  const tableRows = [];
  
  data.forEach(expense => {
    const expenseData = [
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      expense.description || '-',
      `₹${expense.amount}`,
      expense.paymentMethod,
    ];
    tableRows.push(expenseData);
  });
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [59, 130, 246] },
  });
  
  doc.save(`${filename}.pdf`);
};

export const exportToCSV = (data, filename = 'expenses') => {
  const headers = ['Date', 'Category', 'Description', 'Amount', 'Payment Method', 'Wallet'];
  const csvContent = [
    headers.join(','),
    ...data.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.category,
      `"${expense.description || ''}"`,
      expense.amount,
      expense.paymentMethod,
      expense.walletId,
    ].join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};