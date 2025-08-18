import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Clock,
  Mail,
  Settings
} from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { generateReport, downloadPDF, ReportData } from '../utils/pdfGenerator';
import Modal from '../components/ui/Modal';

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedReport, setSelectedReport] = useState('sales');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    frequency: 'weekly',
    email: '',
    time: '09:00',
    dayOfWeek: 'monday'
  });

  const handleDownloadFullReport = () => {
    const reportData: ReportData = {
      title: 'Comprehensive Pharmacy Report',
      period: getPeriodText(selectedPeriod),
      generatedDate: new Date().toLocaleDateString(),
      data: generateMockReportData(selectedReport, selectedPeriod),
      summary: generateMockSummary(selectedReport, selectedPeriod)
    };

    const doc = generateReport(reportData);
    downloadPDF(doc, `full-report-${selectedReport}-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportReport = () => {
    const reportData: ReportData = {
      title: `${getReportTypeText(selectedReport)} Report`,
      period: getPeriodText(selectedPeriod),
      generatedDate: new Date().toLocaleDateString(),
      data: generateMockReportData(selectedReport, selectedPeriod),
      summary: generateMockSummary(selectedReport, selectedPeriod)
    };

    const doc = generateReport(reportData);
    downloadPDF(doc, `${selectedReport}-report-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleScheduleReport = () => {
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = () => {
    // Here you would typically save the schedule to your backend
    console.log('Schedule saved:', scheduleData);
    setShowScheduleModal(false);
    // Show success message
    alert('Report schedule saved successfully!');
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case '7': return 'Last 7 days';
      case '30': return 'Last 30 days';
      case '90': return 'Last 90 days';
      case '365': return 'Last year';
      default: return 'Custom period';
    }
  };

  const getReportTypeText = (reportType: string) => {
    switch (reportType) {
      case 'sales': return 'Sales';
      case 'inventory': return 'Inventory';
      case 'financial': return 'Financial';
      case 'performance': return 'Performance';
      default: return 'General';
    }
  };

  const generateMockReportData = (reportType: string, period: string) => {
    // Mock data generation based on report type and period
    const baseData = {
      'Date': '2024-01-15',
      'Value': '₵1,250.00',
      'Count': '45',
      'Status': 'Completed'
    };

    return Array.from({ length: 10 }, (_, i) => ({
      'Date': new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'Value': `₵${Math.floor(Math.random() * 2000 + 500)}.00`,
      'Count': Math.floor(Math.random() * 100 + 20).toString(),
      'Status': ['Completed', 'Pending', 'Cancelled'][Math.floor(Math.random() * 3)]
    }));
  };

  const generateMockSummary = (reportType: string, period: string) => {
    const baseSummary = {
      totalSales: Math.floor(Math.random() * 1000 + 500),
      totalRevenue: Math.random() * 50000 + 25000,
      totalItems: Math.floor(Math.random() * 5000 + 2000),
      averageOrder: Math.random() * 150 + 75
    };

    return baseSummary;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-400/20 to-rose-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-300/10 to-pink-300/10 rounded-full blur-3xl"></div>
      </div>
      {/* Header */}
      <div className="relative bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="text-gray-600">Comprehensive insights into pharmacy performance</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="flex items-center bg-white/80 hover:bg-white backdrop-blur-sm border-gray-300 hover:border-gray-400"
                onClick={handleExportReport}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center bg-white/80 hover:bg-white backdrop-blur-sm border-gray-300 hover:border-gray-400"
                onClick={handleScheduleReport}
              >
                <Clock className="w-4 h-4 mr-2" />
                Schedule Report
              </Button>
              <Button 
                className="flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                onClick={handleDownloadFullReport}
              >
                <FileText className="w-4 h-4 mr-2" />
                Download Full Report
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Filters */}
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 bg-white min-w-40"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                    <option value="365">Last year</option>
                    <option value="custom">Custom period</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
                    className="border border-gray-300 rounded-md px-4 py-2 bg-white min-w-40"
                  >
                    <option value="sales">Sales Report</option>
                    <option value="inventory">Inventory Report</option>
                    <option value="financial">Financial Report</option>
                    <option value="performance">Performance Report</option>
                    <option value="customer">Customer Report</option>
                    <option value="drug">Drug Usage Report</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    className="flex items-center"
                    onClick={() => {
                      // Refresh data based on current filters
                      console.log('Refreshing data for:', selectedReport, selectedPeriod);
                    }}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Apply Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-green-500">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sales</p>
                  <p className="text-2xl font-semibold text-gray-900">₵24,580</p>
                  <p className="text-xs text-green-600">+12% from last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-blue-500">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders</p>
                  <p className="text-2xl font-semibold text-gray-900">1,247</p>
                  <p className="text-xs text-blue-600">+8% from last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-500">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Products Sold</p>
                  <p className="text-2xl font-semibold text-gray-900">3,892</p>
                  <p className="text-xs text-purple-600">+15% from last period</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-orange-500">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Customers</p>
                  <p className="text-2xl font-semibold text-gray-900">456</p>
                  <p className="text-xs text-orange-600">+5% from last period</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Preview */}
          <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-purple-800">
                {getReportTypeText(selectedReport)} Report Preview
              </h3>
              <span className="text-sm text-purple-600">
                {getPeriodText(selectedPeriod)}
              </span>
              </div>
            </CardHeader>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generateMockReportData(selectedReport, selectedPeriod).slice(0, 5).map((row, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Value}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.Count}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          row.Status === 'Completed' ? 'bg-green-100 text-green-800' :
                          row.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {row.Status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
                      </div>
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                Showing 5 of {generateMockReportData(selectedReport, selectedPeriod).length} records
              </p>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Schedule Report Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Schedule Report"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="sales">Sales Report</option>
              <option value="inventory">Inventory Report</option>
              <option value="financial">Financial Report</option>
              <option value="performance">Performance Report</option>
            </select>
                    </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              value={scheduleData.frequency}
              onChange={(e) => setScheduleData({ ...scheduleData, frequency: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
                  </div>
                  
          {scheduleData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
              <select
                value={scheduleData.dayOfWeek}
                onChange={(e) => setScheduleData({ ...scheduleData, dayOfWeek: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              value={scheduleData.time}
              onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={scheduleData.email}
              onChange={(e) => setScheduleData({ ...scheduleData, email: e.target.value })}
              placeholder="Enter email for report delivery"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
            />
            </div>
            
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowScheduleModal(false)}>
              Cancel
          </Button>
            <Button 
              onClick={handleSaveSchedule}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Settings className="w-4 h-4 mr-2" />
            Schedule Report
          </Button>
        </div>
      </div>
      </Modal>
    </div>
  );
};
