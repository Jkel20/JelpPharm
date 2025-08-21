import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { dashboardAPI } from '../services/api';
import { mockDashboardData } from '../services/mockData';

// TypeScript interfaces for dashboard data
interface Alert {
  type: string;
  title: string;
  message: string;
  severity: 'danger' | 'warning' | 'info';
  drugs?: Array<{
    name: string;
    quantity: number;
    reorderLevel?: number;
    expiryDate?: Date;
  }>;
}

interface Activity {
  id: string;
  action: string;
  item: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

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
  const { user, logout, dashboardInfo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine dashboard type based on current route
  const getDashboardType = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/pharmacist')) return 'pharmacist';
    if (path.includes('/store-manager')) return 'store-manager';
    if (path.includes('/cashier')) return 'cashier';
    if (path.includes('/inventory-specialist')) return 'inventory-specialist';
    if (path.includes('/data-analyst')) return 'data-analyst';
    return 'general';
  };
  
  const dashboardType = getDashboardType();
  
  const [stats, setStats] = useState([
    {
      title: 'Total Drugs',
      value: '0',
      change: 'Loading...',
      icon: <Package className="w-6 h-6 text-white" />,
      color: 'bg-blue-500'
    },
    {
      title: 'Today\'s Sales',
      value: '₵0',
      change: 'Loading...',
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      color: 'bg-green-500'
    },
    {
      title: 'Active Prescriptions',
      value: '0',
      change: 'Loading...',
      icon: <FileText className="w-6 h-6 text-white" />,
      color: 'bg-purple-500'
    },
    {
      title: 'Registered Users',
      value: '0',
      change: 'Loading...',
      icon: <Users className="w-6 h-6 text-white" />,
      color: 'bg-orange-500'
    }
  ]);
  
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch dashboard data on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch stats, alerts, and activities in parallel
        const [statsData, alertsData, activitiesData] = await Promise.all([
          dashboardAPI.getStats(),
          dashboardAPI.getAlerts(),
          dashboardAPI.getRecentActivities()
        ]);
        
        // Update stats
        setStats([
          {
            title: 'Total Drugs',
            value: statsData.totalDrugs.value,
            change: statsData.totalDrugs.change,
            icon: <Package className="w-6 h-6 text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Today\'s Sales',
            value: statsData.todaySales.value,
            change: statsData.todaySales.change,
            icon: <ShoppingCart className="w-6 h-6 text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Active Prescriptions',
            value: statsData.activePrescriptions.value,
            change: statsData.activePrescriptions.change,
            icon: <FileText className="w-6 h-6 text-white" />,
            color: 'bg-purple-500'
          },
          {
            title: 'Registered Users',
            value: statsData.registeredUsers.value,
            change: statsData.registeredUsers.change,
            icon: <Users className="w-6 h-6 text-white" />,
            color: 'bg-orange-500'
          }
        ]);
        
        setAlerts(alertsData.alerts);
        setRecentActivities(activitiesData.activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use mock data when API fails
        setStats([
          {
            title: 'Total Drugs',
            value: mockDashboardData.stats.totalDrugs.value.toString(),
            change: mockDashboardData.stats.totalDrugs.change,
            icon: <Package className="w-6 h-6 text-white" />,
            color: 'bg-blue-500'
          },
          {
            title: 'Today\'s Sales',
            value: mockDashboardData.stats.todaySales.value,
            change: mockDashboardData.stats.todaySales.change,
            icon: <ShoppingCart className="w-6 h-6 text-white" />,
            color: 'bg-green-500'
          },
          {
            title: 'Active Prescriptions',
            value: mockDashboardData.stats.activePrescriptions.value.toString(),
            change: mockDashboardData.stats.activePrescriptions.change,
            icon: <FileText className="w-6 h-6 text-white" />,
            color: 'bg-purple-500'
          },
          {
            title: 'Registered Users',
            value: mockDashboardData.stats.registeredUsers.value.toString(),
            change: mockDashboardData.stats.registeredUsers.change,
            icon: <Users className="w-6 h-6 text-white" />,
            color: 'bg-orange-500'
          }
        ]);
        
        setAlerts(mockDashboardData.alerts);
        setRecentActivities(mockDashboardData.activities);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Get role-specific dashboard content
  const getRoleSpecificContent = () => {
    switch (dashboardType) {
      case 'admin':
        return {
          title: '🎯 Administrator Dashboard',
          subtitle: 'Full system access with all privileges',
          description: 'You have complete control over the pharmacy management system',
          roleBadge: 'SYSTEM_ADMIN',
          roleColor: 'bg-red-500'
        };
      case 'pharmacist':
        return {
          title: '💊 Pharmacist Dashboard',
          subtitle: 'Pharmaceutical operations and patient care',
          description: 'Manage prescriptions, inventory, and ensure patient safety',
          roleBadge: 'PHARMACEUTICAL_PROFESSIONAL',
          roleColor: 'bg-blue-500'
        };
      case 'store-manager':
        return {
          title: '🏪 Store Manager Dashboard',
          subtitle: 'Business operations and performance oversight',
          description: 'Monitor sales, manage staff, and optimize operations',
          roleBadge: 'BUSINESS_MANAGER',
          roleColor: 'bg-green-500'
        };
      case 'cashier':
        return {
          title: '💰 Cashier Dashboard',
          subtitle: 'Sales transactions and customer service',
          description: 'Process sales, check inventory, and assist customers',
          roleBadge: 'FRONT_LINE_STAFF',
          roleColor: 'bg-purple-500'
        };
      case 'inventory-specialist':
        return {
          title: '📦 Inventory Specialist Dashboard',
          subtitle: 'Stock control and inventory management',
          description: 'Monitor stock levels, manage reorders, and track batches',
          roleBadge: 'INVENTORY_PROFESSIONAL',
          roleColor: 'bg-orange-500'
        };
      case 'data-analyst':
        return {
          title: '📊 Data Analyst Dashboard',
          subtitle: 'Reporting and business intelligence',
          description: 'Analyze trends, generate reports, and provide insights',
          roleBadge: 'ANALYTICS_PROFESSIONAL',
          roleColor: 'bg-indigo-500'
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'System overview',
          description: 'Here\'s what\'s happening today',
          roleBadge: user?.role || 'USER',
          roleColor: 'bg-gray-500'
        };
    }
  };

  const roleContent = getRoleSpecificContent();

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
                {roleContent.title}
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                {roleContent.subtitle}
              </p>
              <p className="text-gray-500 mt-1 text-base">
                {roleContent.description}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className={`inline-block ${roleContent.roleColor} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                  {roleContent.roleBadge}
                </div>
                {user?.role && (
                  <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    Role: {user.role}
                  </div>
                )}
              </div>
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
          {loading ? (
            // Loading skeleton for stats
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))
          )}
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
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center space-x-4 p-3">
                        <div className="w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentActivities.length > 0 ? (
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
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <Activity className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 text-sm">No recent activities</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Alerts & Notifications</h2>
          {loading ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ) : alerts.length > 0 ? (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div 
                  key={index}
                  className={`border rounded-xl p-6 shadow-lg ${
                    alert.severity === 'danger' 
                      ? 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200' 
                      : alert.severity === 'warning'
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                      : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg mr-4 ${
                      alert.severity === 'danger' 
                        ? 'bg-red-100' 
                        : alert.severity === 'warning'
                        ? 'bg-yellow-100'
                        : 'bg-blue-100'
                    }`}>
                      <AlertTriangle className={`w-6 h-6 ${
                        alert.severity === 'danger' 
                          ? 'text-red-600' 
                          : alert.severity === 'warning'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-lg font-semibold mb-2 ${
                        alert.severity === 'danger' 
                          ? 'text-red-800' 
                          : alert.severity === 'warning'
                          ? 'text-yellow-800'
                          : 'text-blue-800'
                      }`}>
                        {alert.title}
                      </h3>
                      <p className={`text-sm leading-relaxed mb-3 ${
                        alert.severity === 'danger' 
                          ? 'text-red-700' 
                          : alert.severity === 'warning'
                          ? 'text-yellow-700'
                          : 'text-blue-700'
                      }`}>
                        {alert.message}
                      </p>
                      {alert.drugs && alert.drugs.length > 0 && (
                        <div className="mb-3">
                          <p className="text-xs font-medium text-gray-600 mb-2">Affected Medications:</p>
                          <div className="flex flex-wrap gap-2">
                            {alert.drugs.map((drug, drugIndex) => (
                              <span 
                                key={drugIndex}
                                className="px-2 py-1 bg-white/50 rounded text-xs font-medium text-gray-700"
                              >
                                {drug.name} (Qty: {drug.quantity})
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <button 
                        onClick={() => navigate('/inventory')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          alert.severity === 'danger' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : alert.severity === 'warning'
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        View Inventory
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-800">All Good!</h3>
                  <p className="text-sm text-green-700">No alerts at the moment. Your inventory is well-managed.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
