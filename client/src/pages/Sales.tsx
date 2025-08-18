import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  Receipt,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { generateReceipt, generateReport, downloadPDF, ReceiptData, ReportData } from '../utils/pdfGenerator';

interface Drug {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  unitPrice: number;
  currentStock: number;
  prescriptionRequired: boolean;
}

interface CartItem {
  drug: Drug;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt: string;
  cashier: string;
}

export const Sales: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showReceipt, setShowReceipt] = useState(false);
  const [currentSale, setCurrentSale] = useState<Sale | null>(null);

  const handleExportSales = () => {
    const reportData: ReportData = {
      title: 'Sales Report',
      period: new Date().toLocaleDateString(),
      generatedDate: new Date().toLocaleDateString(),
      data: sales.map(sale => ({
        'Sale ID': sale.id,
        'Customer Name': sale.customerName,
        'Customer Phone': sale.customerPhone,
        'Items': sale.items.length,
        'Subtotal': `GHS ${sale.subtotal.toFixed(2)}`,
        'Tax': `GHS ${sale.tax.toFixed(2)}`,
        'Discount': `GHS ${sale.discount.toFixed(2)}`,
        'Total': `GHS ${sale.total.toFixed(2)}`,
        'Payment Method': sale.paymentMethod,
        'Status': sale.status,
        'Date': new Date(sale.createdAt).toLocaleDateString(),
        'Cashier': sale.cashier
      })),
      summary: {
        totalSales: sales.length,
        totalRevenue: sales.reduce((sum, sale) => sum + sale.total, 0),
        totalItems: sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0),
        averageOrder: sales.length > 0 ? sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length : 0
      }
    };

    const doc = generateReport(reportData);
    downloadPDF(doc, `sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleGenerateReceipt = (sale: Sale) => {
    const receiptData: ReceiptData = {
      saleId: sale.id,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      items: sale.items.map(item => ({
        name: item.drug.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice
      })),
      subtotal: sale.subtotal,
      tax: sale.tax,
      discount: sale.discount,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      cashier: sale.cashier,
      date: new Date(sale.createdAt).toLocaleDateString()
    };

    const doc = generateReceipt(receiptData);
    downloadPDF(doc, `receipt-${sale.id}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Mock data - replace with API calls
  useEffect(() => {
    const mockDrugs: Drug[] = [
      {
        id: '1',
        name: 'Paracetamol',
        genericName: 'Acetaminophen',
        brandName: 'Panadol',
        strength: '500mg',
        dosageForm: 'Tablet',
        unitPrice: 2.50,
        currentStock: 25,
        prescriptionRequired: false
      },
      {
        id: '2',
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        brandName: 'Amoxil',
        strength: '500mg',
        dosageForm: 'Capsule',
        unitPrice: 8.50,
        currentStock: 15,
        prescriptionRequired: true
      },
      {
        id: '3',
        name: 'Artemether-Lumefantrine',
        genericName: 'Artemether-Lumefantrine',
        brandName: 'Coartem',
        strength: '20mg/120mg',
        dosageForm: 'Tablet',
        unitPrice: 25.00,
        currentStock: 8,
        prescriptionRequired: true
      },
      {
        id: '4',
        name: 'Omeprazole',
        genericName: 'Omeprazole',
        brandName: 'Losec',
        strength: '20mg',
        dosageForm: 'Capsule',
        unitPrice: 15.50,
        currentStock: 45,
        prescriptionRequired: true
      },
      {
        id: '5',
        name: 'Cetirizine',
        genericName: 'Cetirizine',
        brandName: 'Zyrtec',
        strength: '10mg',
        dosageForm: 'Tablet',
        unitPrice: 5.80,
        currentStock: 60,
        prescriptionRequired: false
      }
    ];

    const mockSales: Sale[] = [
      {
        id: '1',
        customerName: 'John Doe',
        customerPhone: '+233 24 123 4567',
        items: [
          {
            drug: mockDrugs[0],
            quantity: 2,
            unitPrice: 2.50,
            totalPrice: 5.00
          }
        ],
        subtotal: 5.00,
        tax: 0.75,
        discount: 0,
        total: 5.75,
        paymentMethod: 'cash',
        status: 'completed',
        createdAt: '2024-01-15T10:30:00Z',
        cashier: 'Sarah Johnson'
      }
    ];

    setDrugs(mockDrugs);
    setSales(mockSales);
    setIsLoading(false);
  }, []);

  const filteredDrugs = drugs.filter(drug => {
    return drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           drug.brandName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const addToCart = (drug: Drug) => {
    const existingItem = cart.find(item => item.drug.id === drug.id);
    
    if (existingItem) {
      if (existingItem.quantity < drug.currentStock) {
        setCart(cart.map(item =>
          item.drug.id === drug.id
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        ));
      }
    } else {
      setCart([...cart, {
        drug,
        quantity: 1,
        unitPrice: drug.unitPrice,
        totalPrice: drug.unitPrice
      }]);
    }
  };

  const updateQuantity = (drugId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(drugId);
      return;
    }

    const drug = drugs.find(d => d.id === drugId);
    if (drug && newQuantity <= drug.currentStock) {
      setCart(cart.map(item =>
        item.drug.id === drugId
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      ));
    }
  };

  const removeFromCart = (drugId: string) => {
    setCart(cart.filter(item => item.drug.id !== drugId));
  };

  const clearCart = () => {
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setDiscount(0);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = subtotal * 0.15; // 15% VAT
  const total = subtotal + tax - discount;

  const processSale = () => {
    if (cart.length === 0 || !customerName || !customerPhone) {
      alert('Please add items to cart and provide customer information');
      return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.15; // 15% tax
    const total = subtotal + tax - discount;

    const newSale: Sale = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      items: [...cart],
      subtotal,
      tax,
      discount,
      total,
      paymentMethod,
      status: 'completed',
      createdAt: new Date().toISOString(),
      cashier: 'Current User'
    };

    setSales([...sales, newSale]);
    setCurrentSale(newSale);
    setShowReceipt(true);
    clearCart();
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-red-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-orange-300/10 to-red-300/10 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sales Management</h1>
              <p className="text-gray-600">Process sales, manage transactions, and generate receipts</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center bg-white/80 hover:bg-white backdrop-blur-sm border-gray-300 hover:border-gray-400"
                onClick={handleExportSales}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Sales
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Sales</p>
                  <p className="text-2xl font-semibold text-gray-900">₵{sales.reduce((sum, sale) => sum + sale.total, 0).toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-semibold text-gray-900">{sales.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Customers Served</p>
                  <p className="text-2xl font-semibold text-gray-900">{new Set(sales.map(sale => sale.customerName)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-500">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Average Sale</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ₵{sales.length > 0 ? (sales.reduce((sum, sale) => sum + sale.total, 0) / sales.length).toFixed(2) : '0.00'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Drug Search and Cart */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Drug Search */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Search & Add Drugs</h3>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Search drugs by name, generic name, or brand..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      <div className="space-y-2">
                        {filteredDrugs.map((drug) => (
                          <div
                            key={drug.id}
                            className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{drug.name}</div>
                              <div className="text-sm text-gray-500">
                                {drug.brandName} {drug.strength} • {drug.dosageForm}
                              </div>
                              <div className="text-xs text-gray-400">
                                Stock: {drug.currentStock} • ₵{drug.unitPrice.toFixed(2)}
                                {drug.prescriptionRequired && (
                                  <span className="ml-2 text-red-600 font-medium">Prescription Required</span>
                                )}
                              </div>
                            </div>
                            <Button
                              onClick={() => addToCart(drug)}
                              disabled={drug.currentStock === 0}
                              size="sm"
                              className="ml-3"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shopping Cart */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Shopping Cart</h3>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Your cart is empty</p>
                      <p className="text-sm">Search and add drugs to get started</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cart.map((item) => (
                        <div
                          key={item.drug.id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.drug.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.drug.brandName} {item.drug.strength}
                            </div>
                            <div className="text-xs text-gray-400">
                              Stock: {item.drug.currentStock}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => updateQuantity(item.drug.id, item.quantity - 1)}
                                size="sm"
                                variant="outline"
                              >
                                <Minus className="w-4 h-4" />
                              </Button>
                              <span className="w-12 text-center font-medium">{item.quantity}</span>
                              <Button
                                onClick={() => updateQuantity(item.drug.id, item.quantity + 1)}
                                size="sm"
                                variant="outline"
                                disabled={item.quantity >= item.drug.currentStock}
                              >
                                <Plus className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="text-right">
                              <div className="font-medium text-gray-900">₵{item.totalPrice.toFixed(2)}</div>
                              <div className="text-sm text-gray-500">₵{item.unitPrice.toFixed(2)} each</div>
                            </div>
                            
                            <Button
                              onClick={() => removeFromCart(item.drug.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Checkout Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Checkout</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Customer Information */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Customer Name *
                    </label>
                    <Input
                      type="text"
                      placeholder="Enter customer name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="cash">Cash</option>
                      <option value="mobile_money">Mobile Money</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Discount (₵)
                    </label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  {/* Order Summary */}
                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>₵{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (15%):</span>
                        <span>₵{tax.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount:</span>
                          <span>-₵{discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span>₵{total.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={processSale}
                      disabled={cart.length === 0 || !customerName.trim() || !customerPhone.trim()}
                      className="w-full"
                      size="lg"
                    >
                      Process Sale
                    </Button>
                    
                    {cart.length > 0 && (
                      <Button
                        onClick={clearCart}
                        variant="outline"
                        className="w-full"
                      >
                        Clear Cart
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900">Recent Sales</h3>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sale ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sales.map((sale) => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{sale.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{sale.customerName}</div>
                            <div className="text-sm text-gray-500">{sale.customerPhone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale.items.length} item(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ₵{sale.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            sale.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            sale.paymentMethod === 'mobile_money' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {sale.paymentMethod.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            onClick={() => handleGenerateReceipt(sale)}
                            variant="outline"
                            size="sm"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Receipt
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && currentSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center mb-6">
              <Receipt className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Sale Completed!</h3>
              <p className="text-gray-600">Receipt has been generated</p>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">₵{currentSale.total.toFixed(2)}</p>
                <p className="text-sm text-gray-500">Total Amount</p>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">Sale ID: #{currentSale.id}</p>
                <p className="text-sm text-gray-600">Customer: {currentSale.customerName}</p>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <Button
                onClick={() => handleGenerateReceipt(currentSale)}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Receipt
              </Button>
              <Button
                onClick={() => setShowReceipt(false)}
                variant="outline"
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
