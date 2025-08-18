import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Download,
  Eye,
  Edit,
  Trash2,
  TrendingDown,
  Calendar,
  DollarSign,
  BarChart3,
  FileText
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { generateReport, downloadPDF, ReportData } from '../utils/pdfGenerator';

interface Drug {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
  manufacturer: string;
  unitPrice: number;
  costPrice: number;
  currentStock: number;
  reorderLevel: number;
  maxStockLevel: number;
  expiryDate: string;
  batchNumber: string;
  isActive: boolean;
}

interface Alert {
  id: string;
  type: 'low_stock' | 'expiring_soon' | 'expired';
  drugId: string;
  drugName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
}

interface DrugFormData {
  name: string;
  genericName: string;
  brandName: string;
  strength: string;
  dosageForm: string;
  category: string;
  manufacturer: string;
  unitPrice: string;
  costPrice: string;
  currentStock: string;
  reorderLevel: string;
  maxStockLevel: string;
  expiryDate: string;
  batchNumber: string;
}

export const Inventory: React.FC = () => {
  const [drugs, setDrugs] = useState<Drug[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAlertType, setSelectedAlertType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDrug, setShowAddDrug] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [showViewDrug, setShowViewDrug] = useState(false);
  const [showEditDrug, setShowEditDrug] = useState(false);
  const [drugFormData, setDrugFormData] = useState<DrugFormData>({
    name: '',
    genericName: '',
    brandName: '',
    strength: '',
    dosageForm: 'Tablet',
    category: 'Analgesic',
    manufacturer: '',
    unitPrice: '',
    costPrice: '',
    currentStock: '',
    reorderLevel: '',
    maxStockLevel: '',
    expiryDate: '',
    batchNumber: ''
  });

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
        category: 'Analgesic',
        manufacturer: 'GSK',
        unitPrice: 2.50,
        costPrice: 1.80,
        currentStock: 25,
        reorderLevel: 50,
        maxStockLevel: 500,
        expiryDate: '2024-12-31',
        batchNumber: 'PAN-2024-001',
        isActive: true
      },
      {
        id: '2',
        name: 'Amoxicillin',
        genericName: 'Amoxicillin',
        brandName: 'Amoxil',
        strength: '500mg',
        dosageForm: 'Capsule',
        category: 'Antibiotic',
        manufacturer: 'Pfizer',
        unitPrice: 8.50,
        costPrice: 6.80,
        currentStock: 15,
        reorderLevel: 30,
        maxStockLevel: 300,
        expiryDate: '2024-08-15',
        batchNumber: 'AMX-2024-003',
        isActive: true
      },
      {
        id: '3',
        name: 'Artemether-Lumefantrine',
        genericName: 'Artemether-Lumefantrine',
        brandName: 'Coartem',
        strength: '20mg/120mg',
        dosageForm: 'Tablet',
        category: 'Antimalarial',
        manufacturer: 'Novartis',
        unitPrice: 25.00,
        costPrice: 20.00,
        currentStock: 8,
        reorderLevel: 20,
        maxStockLevel: 200,
        expiryDate: '2024-10-20',
        batchNumber: 'COA-2024-002',
        isActive: true
      }
    ];

    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'low_stock',
        drugId: '2',
        drugName: 'Amoxicillin',
        message: 'Stock level below reorder level',
        severity: 'high',
        createdAt: '2024-01-15T10:30:00Z'
      },
      {
        id: '2',
        type: 'expiring_soon',
        drugId: '2',
        drugName: 'Amoxicillin',
        message: 'Expires in 30 days',
        severity: 'medium',
        createdAt: '2024-01-14T14:20:00Z'
      }
    ];

    setDrugs(mockDrugs);
    setAlerts(mockAlerts);
    setIsLoading(false);
  }, []);

  const handleExportInventory = () => {
    const reportData: ReportData = {
      title: 'Drug Inventory Report',
      period: new Date().toLocaleDateString(),
      generatedDate: new Date().toLocaleDateString(),
      data: drugs.map(drug => ({
        'Drug Name': drug.name,
        'Generic Name': drug.genericName,
        'Brand Name': drug.brandName,
        'Strength': drug.strength,
        'Category': drug.category,
        'Current Stock': drug.currentStock,
        'Unit Price': `GHS ${drug.unitPrice.toFixed(2)}`,
        'Total Value': `GHS ${(drug.currentStock * drug.unitPrice).toFixed(2)}`,
        'Expiry Date': drug.expiryDate,
        'Status': drug.currentStock > 0 ? 'In Stock' : 'Out of Stock'
      })),
      summary: {
        totalItems: drugs.length,
        totalRevenue: drugs.reduce((sum, drug) => sum + (drug.currentStock * drug.unitPrice), 0)
      }
    };

    const doc = generateReport(reportData);
    downloadPDF(doc, `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleViewDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setShowViewDrug(true);
  };

  const handleEditDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setShowEditDrug(true);
  };

  const handleDeleteDrug = (drugId: string) => {
    if (window.confirm('Are you sure you want to delete this drug?')) {
      setDrugs(drugs.filter(drug => drug.id !== drugId));
    }
  };

  const handleAddDrug = () => {
    // Validate required fields
    if (!drugFormData.name || !drugFormData.genericName || !drugFormData.unitPrice) {
      alert('Please fill in all required fields');
      return;
    }

    const newDrug: Drug = {
      id: Date.now().toString(),
      name: drugFormData.name,
      genericName: drugFormData.genericName,
      brandName: drugFormData.brandName,
      strength: drugFormData.strength,
      dosageForm: drugFormData.dosageForm,
      category: drugFormData.category,
      manufacturer: drugFormData.manufacturer,
      unitPrice: parseFloat(drugFormData.unitPrice),
      costPrice: parseFloat(drugFormData.costPrice) || 0,
      currentStock: parseInt(drugFormData.currentStock) || 0,
      reorderLevel: parseInt(drugFormData.reorderLevel) || 0,
      maxStockLevel: parseInt(drugFormData.maxStockLevel) || 0,
      expiryDate: drugFormData.expiryDate,
      batchNumber: drugFormData.batchNumber,
      isActive: true
    };

    setDrugs([...drugs, newDrug]);
    setShowAddDrug(false);
    
    // Reset form data
    setDrugFormData({
      name: '',
      genericName: '',
      brandName: '',
      strength: '',
      dosageForm: 'Tablet',
      category: 'Analgesic',
      manufacturer: '',
      unitPrice: '',
      costPrice: '',
      currentStock: '',
      reorderLevel: '',
      maxStockLevel: '',
      expiryDate: '',
      batchNumber: ''
    });

    alert('Drug added successfully!');
  };

  const handleInputChange = (field: keyof DrugFormData, value: string) => {
    setDrugFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredDrugs = drugs.filter(drug => {
    const matchesSearch = drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drug.genericName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         drug.brandName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || drug.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredAlerts = alerts.filter(alert => {
    return selectedAlertType === 'all' || alert.type === selectedAlertType;
  });

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'low_stock':
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'expiring_soon':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'expired':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'high':
        return 'bg-orange-50 border-orange-200';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200';
      case 'low':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStockStatus = (currentStock: number, reorderLevel: number) => {
    if (currentStock === 0) return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' };
    if (currentStock <= reorderLevel) return { status: 'Low Stock', color: 'text-orange-600 bg-orange-100' };
    if (currentStock <= reorderLevel * 1.5) return { status: 'Moderate', color: 'text-yellow-600 bg-yellow-100' };
    return { status: 'In Stock', color: 'text-green-600 bg-green-100' };
  };

  const calculateDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = (expiryDate: string) => {
    const daysUntilExpiry = calculateDaysUntilExpiry(expiryDate);
    if (daysUntilExpiry < 0) return { status: 'Expired', color: 'text-red-600 bg-red-100' };
    if (daysUntilExpiry <= 30) return { status: 'Expires Soon', color: 'text-red-600 bg-red-100' };
    if (daysUntilExpiry <= 90) return { status: 'Expires Soon', color: 'text-yellow-600 bg-yellow-100' };
    if (daysUntilExpiry <= 180) return { status: 'Expires Soon', color: 'text-orange-600 bg-orange-100' };
    return { status: 'Valid', color: 'text-green-600 bg-green-100' };
  };

  const totalInventoryValue = drugs.reduce((sum, drug) => sum + (drug.currentStock * drug.costPrice), 0);
  const totalRetailValue = drugs.reduce((sum, drug) => sum + (drug.currentStock * drug.unitPrice), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-300/10 to-purple-300/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Drug Inventory</h1>
              <p className="text-gray-600">Manage your pharmacy's drug stock and monitor alerts</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center bg-white/80 hover:bg-white backdrop-blur-sm border-gray-300 hover:border-gray-400"
                onClick={handleExportInventory}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Inventory
              </Button>
              <Button 
                className="flex items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={() => setShowAddDrug(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Drug
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search drugs by name, generic name, or brand..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 bg-white/80 backdrop-blur-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    <option value="Analgesic">Analgesic</option>
                    <option value="Antibiotic">Antibiotic</option>
                    <option value="Antimalarial">Antimalarial</option>
                    <option value="Antihypertensive">Antihypertensive</option>
                    <option value="Antidiabetic">Antidiabetic</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Alerts Section */}
        {filteredAlerts.length > 0 && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-red-50/90 to-orange-50/90 backdrop-blur-sm border-red-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-red-100/80 to-orange-100/80 backdrop-blur-sm border-b border-red-200">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="text-lg font-semibold text-red-800">Inventory Alerts</h3>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-red-100">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 hover:bg-red-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-3 ${
                            alert.severity === 'critical' ? 'bg-red-600' :
                            alert.severity === 'high' ? 'bg-orange-500' :
                            alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{alert.drugName}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                              {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                          </div>
                        </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Drug Inventory Table */}
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-100/80 to-indigo-100/80 backdrop-blur-sm border-b border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-blue-800">Drug Inventory</h3>
              <span className="text-sm text-blue-600">
                {filteredDrugs.length} drugs found
              </span>
                </div>
              </CardHeader>
          <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Drug Information
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock & Pricing
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/60 backdrop-blur-sm divide-y divide-gray-200">
                  {filteredDrugs.map((drug) => (
                    <tr key={drug.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{drug.name}</div>
                          <div className="text-sm text-gray-500">{drug.genericName}</div>
                          <div className="text-sm text-gray-500">{drug.brandName}</div>
                          <div className="text-xs text-gray-400">{drug.strength} • {drug.dosageForm}</div>
                              </div>
                            </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>Stock: {drug.currentStock}</div>
                          <div>Price: ₵{drug.unitPrice.toFixed(2)}</div>
                          <div>Value: ₵{(drug.currentStock * drug.unitPrice).toFixed(2)}</div>
                              </div>
                            </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            drug.currentStock === 0 ? 'bg-red-100 text-red-800' :
                            drug.currentStock <= drug.reorderLevel ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {drug.currentStock === 0 ? 'Out of Stock' :
                             drug.currentStock <= drug.reorderLevel ? 'Low Stock' : 'In Stock'}
                                </span>
                              </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Expires: {new Date(drug.expiryDate).toLocaleDateString()}
                              </div>
                            </td>
                      <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDrug(drug)}
                            className="text-blue-600 hover:text-blue-700 bg-white/80 backdrop-blur-sm"
                          >
                                  <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditDrug(drug)}
                            className="text-green-600 hover:text-green-700 bg-white/80 backdrop-blur-sm"
                          >
                                  <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteDrug(drug.id)}
                            className="text-red-600 hover:text-red-700 bg-white/80 backdrop-blur-sm"
                          >
                                  <Trash2 className="w-4 h-4" />
                          </Button>
                              </div>
                            </td>
                          </tr>
                  ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

      {/* Add Drug Modal */}
      <Modal
        isOpen={showAddDrug}
        onClose={() => setShowAddDrug(false)}
        title="Add New Drug"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Drug Name *</label>
              <Input 
                type="text" 
                placeholder="Enter drug name" 
                value={drugFormData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Generic Name *</label>
              <Input 
                type="text" 
                placeholder="Enter generic name" 
                value={drugFormData.genericName}
                onChange={(e) => handleInputChange('genericName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
              <Input 
                type="text" 
                placeholder="Enter brand name" 
                value={drugFormData.brandName}
                onChange={(e) => handleInputChange('brandName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Strength</label>
              <Input 
                type="text" 
                placeholder="e.g., 500mg" 
                value={drugFormData.strength}
                onChange={(e) => handleInputChange('strength', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Dosage Form</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={drugFormData.dosageForm}
                onChange={(e) => handleInputChange('dosageForm', e.target.value)}
              >
                <option>Tablet</option>
                <option>Capsule</option>
                <option>Syrup</option>
                <option>Injection</option>
                <option>Cream</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                value={drugFormData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
              >
                <option>Analgesic</option>
                <option>Antibiotic</option>
                <option>Antimalarial</option>
                <option>Antihypertensive</option>
                <option>Antidiabetic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
              <Input 
                type="text" 
                placeholder="Enter manufacturer" 
                value={drugFormData.manufacturer}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₵) *</label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={drugFormData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price (₵)</label>
              <Input 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={drugFormData.costPrice}
                onChange={(e) => handleInputChange('costPrice', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Initial Stock</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={drugFormData.currentStock}
                onChange={(e) => handleInputChange('currentStock', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={drugFormData.reorderLevel}
                onChange={(e) => handleInputChange('reorderLevel', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock Level</label>
              <Input 
                type="number" 
                placeholder="0" 
                value={drugFormData.maxStockLevel}
                onChange={(e) => handleInputChange('maxStockLevel', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
              <Input 
                type="date" 
                value={drugFormData.expiryDate}
                onChange={(e) => handleInputChange('expiryDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
              <Input 
                type="text" 
                placeholder="Enter batch number" 
                value={drugFormData.batchNumber}
                onChange={(e) => handleInputChange('batchNumber', e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowAddDrug(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={handleAddDrug}
            >
              Add Drug
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Drug Modal */}
      <Modal
        isOpen={showViewDrug}
        onClose={() => setShowViewDrug(false)}
        title="Drug Details"
        size="md"
      >
        {selectedDrug && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Drug Name</label>
                <p className="text-gray-900">{selectedDrug.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Generic Name</label>
                <p className="text-gray-900">{selectedDrug.genericName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Brand Name</label>
                <p className="text-gray-900">{selectedDrug.brandName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Strength</label>
                <p className="text-gray-900">{selectedDrug.strength}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-gray-900">{selectedDrug.category}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                <p className="text-gray-900">{selectedDrug.manufacturer}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Current Stock</label>
                <p className="text-gray-900">{selectedDrug.currentStock}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit Price</label>
                <p className="text-gray-900">₵{selectedDrug.unitPrice.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                <p className="text-gray-900">{new Date(selectedDrug.expiryDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Batch Number</label>
                <p className="text-gray-900">{selectedDrug.batchNumber}</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button onClick={() => setShowViewDrug(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Drug Modal */}
      <Modal
        isOpen={showEditDrug}
        onClose={() => setShowEditDrug(false)}
        title="Edit Drug"
        size="lg"
      >
        {selectedDrug && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drug Name</label>
                <Input type="text" defaultValue={selectedDrug.name} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Generic Name</label>
                <Input type="text" defaultValue={selectedDrug.genericName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand Name</label>
                <Input type="text" defaultValue={selectedDrug.brandName} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Strength</label>
                <Input type="text" defaultValue={selectedDrug.strength} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Price (₵)</label>
                <Input type="number" step="0.01" defaultValue={selectedDrug.unitPrice} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock</label>
                <Input type="number" defaultValue={selectedDrug.currentStock} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Level</label>
                <Input type="number" defaultValue={selectedDrug.reorderLevel} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Stock Level</label>
                <Input type="number" defaultValue={selectedDrug.maxStockLevel} />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setShowEditDrug(false)}>
                Cancel
              </Button>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700">
                Update Drug
              </Button>
        </div>
      </div>
        )}
      </Modal>
    </div>
  );
};
