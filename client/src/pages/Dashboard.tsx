import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  DollarSign,
  Activity
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => (
  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-gray-300 transform hover:-translate-y-1">
    <div className="flex items-center">
      <div className={`p-4 rounded-xl ${color} shadow-lg`}>
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
        {change && (
          <p className="text-sm text-green-600 flex items-center font-medium">
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
    </div>
  </div>
);

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, description, icon, href }) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1 group"
      onClick={() => navigate(href)}
    >
      <div className="flex items-center">
        <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  const stats = [
    {
      title: 'Total Drugs',
      value: '1,247',
      change: '+12% from last month',
      icon: <Package className="w-6 h-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Today\'s Sales',
      value: '₵2,450',
      change: '+8% from yesterday',
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Active Prescriptions',
      value: '89',
      change: '+5% from last week',
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Registered Users',
      value: '24',
      change: '+2 this month',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-orange-500'
    }
  ];

  const quickActions = [
    {
      title: 'Inventory Management',
      description: 'Monitor stock levels and manage alerts',
      icon: <Package className="w-6 h-6" />,
      href: '/inventory'
    },
    {
      title: 'Sales Management',
      description: 'Process sales and generate receipts',
      icon: <ShoppingCart className="w-6 h-6" />,
      href: '/sales'
    },
    {
      title: 'Prescriptions',
      description: 'Manage patient prescriptions',
      icon: <FileText className="w-6 h-6" />,
      href: '/prescriptions'
    },
    {
      title: 'Reports & Analytics',
      description: 'View performance metrics and insights',
      icon: <Activity className="w-6 h-6" />,
      href: '/reports'
    }
  ];

  const recentActivities = [
    { id: 1, action: 'New drug added', item: 'Paracetamol 500mg', time: '2 minutes ago', type: 'success' },
    { id: 2, action: 'Sale completed', item: '₵150.00', time: '15 minutes ago', type: 'success' },
    { id: 3, action: 'Low stock alert', item: 'Amoxicillin 250mg', time: '1 hour ago', type: 'warning' },
    { id: 4, action: 'Prescription filled', item: 'Patient: John Doe', time: '2 hours ago', type: 'info' },
    { id: 5, action: 'User login', item: 'Pharmacist: Sarah', time: '3 hours ago', type: 'info' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-r from-green-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-white via-blue-50 to-purple-50 shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Welcome back, <span className="font-semibold text-blue-600">{user?.name}</span>! Here's what's happening today.
              </p>
            </div>
            <div className="text-right bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-500 font-medium">Today</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <QuickAction key={index} {...action} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className={`w-3 h-3 rounded-full shadow-sm ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {activity.action}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.item} • {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-start">
              <div className="p-2 bg-yellow-100 rounded-lg mr-4">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Low Stock Alert</h3>
                <p className="text-sm text-yellow-700 leading-relaxed">
                  Several medications are running low on stock. Please review inventory and place reorders to ensure continuous service.
                </p>
                <button className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200">
                  View Inventory
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
