import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface ReceiptData {
  saleId: string;
  customerName: string;
  customerPhone: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  cashier: string;
  date: string;
}

export interface ReportData {
  title: string;
  period: string;
  generatedDate: string;
  data: any[];
  summary: {
    totalSales?: number;
    totalItems?: number;
    totalRevenue?: number;
    averageOrder?: number;
  };
}

// Helper function to format currency with proper Cedis symbol
const formatCurrency = (amount: number): string => {
  return `GHS ${amount.toFixed(2)}`;
};

export const generateReceipt = (data: ReceiptData): jsPDF => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text('JELPPHARM', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(52, 73, 94);
  doc.text('Pharmacy Management System', 105, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(149, 165, 166);
  doc.text('Receipt', 105, 40, { align: 'center' });
  
  // Receipt details
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text(`Receipt #: ${data.saleId}`, 20, 60);
  doc.text(`Date: ${data.date}`, 20, 70);
  doc.text(`Customer: ${data.customerName}`, 20, 80);
  doc.text(`Phone: ${data.customerPhone}`, 20, 90);
  doc.text(`Cashier: ${data.cashier}`, 20, 100);
  
  // Items table - using a simpler approach without autotable for now
  let yPos = 120;
  doc.setFontSize(10);
  doc.setTextColor(44, 62, 80);
  
  // Table header
  doc.text('Item', 20, yPos);
  doc.text('Qty', 80, yPos);
  doc.text('Unit Price', 120, yPos);
  doc.text('Total', 160, yPos);
  
  yPos += 10;
  doc.setFontSize(8);
  
  // Table rows
  data.items.forEach(item => {
    doc.text(item.name, 20, yPos);
    doc.text(item.quantity.toString(), 80, yPos);
    doc.text(formatCurrency(item.unitPrice), 120, yPos);
    doc.text(formatCurrency(item.totalPrice), 160, yPos);
    yPos += 8;
  });
  
  // Totals
  yPos += 5;
  doc.setFontSize(12);
  doc.setTextColor(44, 62, 80);
  doc.text(`Subtotal: ${formatCurrency(data.subtotal)}`, 140, yPos);
  doc.text(`Tax: ${formatCurrency(data.tax)}`, 140, yPos + 10);
  doc.text(`Discount: ${formatCurrency(data.discount)}`, 140, yPos + 20);
  doc.text(`Total: ${formatCurrency(data.total)}`, 140, yPos + 30);
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(149, 165, 166);
  doc.text('Thank you for choosing JELPPHARM!', 105, yPos + 50, { align: 'center' });
  doc.text('For any queries, please contact us', 105, yPos + 60, { align: 'center' });
  
  return doc;
};

export const generateReport = (data: ReportData): jsPDF => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(44, 62, 80);
  doc.text('JELPPHARM', 105, 20, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setTextColor(52, 73, 94);
  doc.text(data.title, 105, 35, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setTextColor(149, 165, 166);
  doc.text(`Period: ${data.period}`, 105, 45, { align: 'center' });
  doc.text(`Generated: ${data.generatedDate}`, 105, 55, { align: 'center' });
  
  // Summary section
  if (data.summary) {
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Summary', 20, 75);
    
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    let yPos = 85;
    
    if (data.summary.totalSales !== undefined) {
      doc.text(`Total Sales: ${data.summary.totalSales}`, 20, yPos);
      yPos += 10;
    }
    if (data.summary.totalRevenue !== undefined) {
      doc.text(`Total Revenue: ${formatCurrency(data.summary.totalRevenue)}`, 20, yPos);
      yPos += 10;
    }
    if (data.summary.totalItems !== undefined) {
      doc.text(`Total Items Sold: ${data.summary.totalItems}`, 20, yPos);
      yPos += 10;
    }
    if (data.summary.averageOrder !== undefined) {
      doc.text(`Average Order Value: ${formatCurrency(data.summary.averageOrder)}`, 20, yPos);
      yPos += 10;
    }
  }
  
  // Data table - using a simpler approach without autotable for now
  if (data.data.length > 0) {
    let yPos = 120;
    doc.setFontSize(10);
    doc.setTextColor(44, 62, 80);
    
    // Table headers
    const headers = Object.keys(data.data[0]);
    let xPos = 20;
    headers.forEach((header, index) => {
      doc.text(header, xPos, yPos);
      xPos += 40;
    });
    
    yPos += 10;
    doc.setFontSize(8);
    
    // Table rows
    data.data.slice(0, 20).forEach(row => { // Limit to 20 rows to avoid overflow
      xPos = 20;
      Object.values(row).forEach((value, index) => {
        let text = String(value);
        
        // Format currency values properly
        if (text.includes('₵') || text.includes('μ')) {
          // Extract the numeric value and format it properly
          const numericValue = text.replace(/[₵μ]/g, '').trim();
          if (!isNaN(parseFloat(numericValue))) {
            text = formatCurrency(parseFloat(numericValue));
          }
        }
        
        doc.text(text, xPos, yPos);
        xPos += 40;
      });
      yPos += 8;
    });
  }
  
  // Footer
  doc.setFontSize(10);
  doc.setTextColor(149, 165, 166);
  doc.text('JELPPHARM - Pharmacy Management System', 105, 250, { align: 'center' });
  
  return doc;
};

export const downloadPDF = (doc: jsPDF, filename: string): void => {
  doc.save(filename);
};
