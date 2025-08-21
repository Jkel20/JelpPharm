import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  BarChart3,
  ArrowRight,
  Calendar,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { QuickAction } from '../components/ui/QuickAction';

interface Stat {
  value: string;
  change: string;
}

interface Alert {
  title: string;
  message: string;
  severity: 'danger' | 'warning' | 'info';
  drugs?: Array<{ name: string; quantity: number }>;
}

interface Activity {
  action: string;
  item: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

export const Dashboard: React.FC = () => {
  const { user, hasPrivilege } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stat[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  // Get dashboard type from URL
  const getDashboardType = () => {
    const path = location.pathname;
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/pharmacist')) return 'pharmacist';
    if (path.includes('/store-manager')) return 'store-manager';
    if (path.includes('/cashier')) return 'cashier';
    return 'general';
  };

  const dashboardType = getDashboardType();

  // Get role-specific dashboard content with detailed descriptions, privileges, and restrictions
  const getRoleSpecificContent = () => {
    switch (dashboardType) {
      case 'admin':
        return {
          title: '🎯 Administrator Dashboard',
          subtitle: 'Full system access with all privileges',
          description: 'You have complete control over the pharmacy management system. Manage users, roles, privileges, system settings, and access all features.',
          roleBadge: 'SYSTEM_ADMIN',
          roleColor: 'bg-gradient-to-r from-red-500 to-pink-600',
          privileges: [
            'Full system access',
            'User management (create, edit, delete)',
            'Role and privilege administration',
            'System settings and configuration',
            'Database management',
            'All reports and analytics',
            'Complete audit logs'
          ],
          restrictions: 'None - Full access to all features',
          accessLevel: 'SYSTEM_ADMIN'
        };
      case 'pharmacist':
        return {
          title: '💊 Pharmacist Dashboard',
          subtitle: 'Pharmaceutical operations and patient care',
          description: 'Professional pharmacist with comprehensive medication and inventory management privileges. Manage prescriptions, dispense medications, manage inventory, create sales, and generate reports.',
          roleBadge: 'PHARMACEUTICAL_PROFESSIONAL',
          roleColor: 'bg-gradient-to-r from-blue-500 to-cyan-600',
          privileges: [
            'Prescription management',
            'Inventory access and management',
            'Sales operations',
            'Patient safety monitoring',
            'Drug interaction checking',
            'Clinical decision support',
            'Basic reporting access'
          ],
          restrictions: 'Limited to pharmaceutical operations - No system administration access',
          accessLevel: 'PHARMACEUTICAL_PROFESSIONAL'
        };
      case 'store-manager':
        return {
          title: '🏪 Store Manager Dashboard',
          subtitle: 'Business operations and staff oversight',
          description: 'Store-level manager with oversight of operations, staff, and business performance. Manage inventory, sales, prescriptions, users within your store, and generate comprehensive reports.',
          roleBadge: 'BUSINESS_MANAGER',
          roleColor: 'bg-gradient-to-r from-green-500 to-emerald-600',
          privileges: [
            'Business performance monitoring',
            'Staff management and oversight',
            'Inventory control and management',
            'Sales analytics and trends',
            'Financial reporting access',
            'Store operations oversight',
            'Performance analytics'
          ],
          restrictions: 'Limited to business operations - No system administration or user management access',
          accessLevel: 'BUSINESS_MANAGER'
        };
      case 'cashier':
        return {
          title: '💰 Cashier Dashboard',
          subtitle: 'Sales transactions and customer service',
          description: 'Front-line staff member responsible for sales transactions and customer service. Process sales, view inventory, handle prescriptions, and generate basic reports.',
          roleBadge: 'FRONT_LINE_STAFF',
          roleColor: 'bg-gradient-to-r from-purple-500 to-violet-600',
          privileges: [
            'Sales transaction processing',
            'Inventory checking for customers',
            'Prescription verification',
            'Daily sales summary',
            'Customer service tools',
            'Basic reporting access'
          ],
          restrictions: 'Limited to sales transactions - No management or administrative access',
          accessLevel: 'FRONT_LINE_STAFF'
        };
      default:
        return {
          title: '📊 General Dashboard',
          subtitle: 'Overview and key metrics',
          description: 'Welcome to your personalized dashboard. View key metrics and access features based on your role and privileges.',
          roleBadge: 'USER',
          roleColor: 'bg-gradient-to-r from-gray-500 to-slate-600',
          privileges: [
            'View assigned features',
            'Access role-specific content',
            'Basic system navigation'
          ],
          restrictions: 'Access limited to assigned privileges and role-based features',
          accessLevel: 'USER'
        };
    }
  };

  // Get privilege-based dashboard stats
  const getPrivilegeBasedStats = () => {
    const privilegeStats = [];

    if (user && hasPrivilege('VIEW_INVENTORY')) {
      privilegeStats.push({
        title: 'Total Drugs',
        value: stats[0]?.value || '0',
        change: stats[0]?.change || 'Loading...',
        icon: <Package className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        trend: 'up'
      });
    }

    if (user && hasPrivilege('VIEW_SALES')) {
      privilegeStats.push({
        title: 'Today\'s Sales',
        value: stats[1]?.value || '₵0',
        change: stats[1]?.change || 'Loading...',
        icon: <ShoppingCart className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-r from-green-500 to-emerald-600',
        trend: 'up'
      });
    }

    if (user && hasPrivilege('VIEW_PRESCRIPTIONS')) {
      privilegeStats.push({
        title: 'Active Prescriptions',
        value: stats[2]?.value || '0',
        change: stats[2]?.change || 'Loading...',
        icon: <FileText className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-r from-purple-500 to-violet-600',
        trend: 'stable'
      });
    }

    if (user && hasPrivilege('VIEW_USERS')) {
      privilegeStats.push({
        title: 'Registered Users',
        value: stats[3]?.value || '0',
        change: stats[3]?.change || 'Loading...',
        icon: <Users className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-r from-orange-500 to-red-600',
        trend: 'up'
      });
    }

    return privilegeStats;
  };

  // Get privilege-based quick actions
  const getPrivilegeBasedQuickActions = () => {
    const privilegeActions = [];

    if (user && hasPrivilege('VIEW_INVENTORY')) {
      privilegeActions.push({
        title: 'Inventory Management',
        description: 'Monitor stock levels and manage alerts',
        icon: <Package className="w-6 h-6" />,
        href: '/inventory',
        color: 'from-blue-500 to-blue-600'
      });
    }

    if (user && hasPrivilege('VIEW_SALES')) {
      privilegeActions.push({
        title: 'Sales Management',
        description: 'Process sales and generate receipts',
        icon: <ShoppingCart className="w-6 h-6" />,
        href: '/sales',
        color: 'from-green-500 to-emerald-600'
      });
    }

    if (user && hasPrivilege('VIEW_PRESCRIPTIONS')) {
      privilegeActions.push({
        title: 'Prescriptions',
        description: 'Manage patient prescriptions',
        icon: <FileText className="w-6 h-6" />,
        href: '/prescriptions',
        color: 'from-purple-500 to-violet-600'
      });
    }

    if (user && hasPrivilege('VIEW_REPORTS')) {
      privilegeActions.push({
        title: 'Reports & Analytics',
        description: 'View performance metrics and insights',
        icon: <BarChart3 className="w-6 h-6" />,
        href: '/reports',
        color: 'from-orange-500 to-red-600'
      });
    }

    return privilegeActions;
  };

  // Mock data loading
  useEffect(() => {
    const loadData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats([
        { value: '1,247', change: '+12% from last month' },
        { value: '₵45,230', change: '+8% from yesterday' },
        { value: '89', change: '+5 new today' },
        { value: '156', change: '+3 this week' }
      ]);

      setAlerts([
        {
          title: 'Low Stock Alert',
          message: '5 medications are running low on stock and need reordering',
          severity: 'warning',
          drugs: [
            { name: 'Paracetamol 500mg', quantity: 15 },
            { name: 'Amoxicillin 250mg', quantity: 8 }
          ]
        },
        {
          title: 'Expiry Warning',
          message: '3 medications will expire within 30 days',
          severity: 'danger',
          drugs: [
            { name: 'Vitamin C 1000mg', quantity: 45 }
          ]
        }
      ]);

      setRecentActivity([
        { action: 'New sale completed', item: 'Prescription #1234', time: '2 minutes ago', type: 'success' },
        { action: 'Inventory updated', item: 'Paracetamol stock', time: '15 minutes ago', type: 'info' },
        { action: 'New user registered', item: 'Dr. Sarah Johnson', time: '1 hour ago', type: 'success' }
      ]);

      setLoading(false);
    };

    loadData();
  }, []);

  const roleContent = getRoleSpecificContent();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{roleContent.title}</h1>
              <p className="text-lg text-gray-600 mt-1">{roleContent.subtitle}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold text-white ${roleContent.roleColor} shadow-lg`}>
                {roleContent.roleBadge}
              </span>
              <div className="text-right">
                <p className="text-sm text-gray-500">Today</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 mt-3 max-w-3xl">{roleContent.description}</p>
          
          {/* Privileges and Restrictions */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Your Privileges
              </h3>
              <ul className="text-sm text-green-700 space-y-2">
                {roleContent.privileges.map((privilege, index) => (
                  <li key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    {privilege}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Access Restrictions
              </h3>
              <p className="text-sm text-orange-700">{roleContent.restrictions}</p>
              <div className="mt-3">
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  Access Level: {roleContent.accessLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getPrivilegeBasedStats().map((stat, index) => (
            <div key={index} className={`${stat.color} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className={`w-4 h-4 mr-1 ${stat.trend === 'up' ? 'text-green-300' : stat.trend === 'down' ? 'text-red-300' : 'text-blue-300'}`} />
                    <p className="text-xs opacity-75">{stat.change}</p>
                  </div>
                </div>
                <div className="opacity-80">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500">Access your most used features</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getPrivilegeBasedQuickActions().map((action, index) => (
              <QuickAction
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                href={action.href}
                color={action.color}
              />
            ))}
          </div>
        </div>

        {/* Recent Activity and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            {loading ? (
              <div className="card">
                <div className="card-body">
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="loading-skeleton w-8 h-8 rounded-full"></div>
                        <div className="flex-1">
                          <div className="loading-skeleton h-3 rounded w-3/4 mb-2"></div>
                          <div className="loading-skeleton h-2 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="card">
                <div className="card-body">
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          activity.type === 'success' ? 'bg-green-100 text-green-600' :
                          activity.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {activity.type === 'success' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : activity.type === 'warning' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                        </div>
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
            ) : (
              <div className="card">
                <div className="card-body text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <CheckCircle className="w-12 h-12 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">No recent activities</p>
                </div>
              </div>
            )}
          </div>

          {/* Alerts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Alerts & Notifications</h2>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            {loading ? (
              <div className="card">
                <div className="card-body">
                  <div className="animate-pulse space-y-4">
                    <div className="loading-skeleton h-4 rounded w-1/4 mb-2"></div>
                    <div className="loading-skeleton h-3 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            ) : alerts.length > 0 ? (
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div 
                    key={index}
                    className={`card border-l-4 ${
                      alert.severity === 'danger' 
                        ? 'border-l-red-500 bg-red-50' 
                        : alert.severity === 'warning'
                        ? 'border-l-yellow-500 bg-yellow-50'
                        : 'border-l-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="card-body">
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
                                    className="px-2 py-1 bg-white/50 rounded text-xs font-medium text-gray-700 border"
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="card bg-green-50 border-green-200">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg mr-4">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-green-800">All Good!</h3>
                      <p className="text-sm text-green-700">No alerts at the moment. Your inventory is well-managed.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Features Section */}
        <div className="mt-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">System Overview</h2>
            <p className="text-gray-600">Quick insights and system status</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-center p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">System Uptime</h3>
              <p className="text-3xl font-bold text-green-600">99.9%</p>
              <p className="text-sm text-gray-500 mt-1">Last 30 days</p>
            </div>
            
            <div className="card text-center p-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Users</h3>
              <p className="text-3xl font-bold text-blue-600">24</p>
              <p className="text-sm text-gray-500 mt-1">Currently online</p>
            </div>
            
            <div className="card text-center p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Store Locations</h3>
              <p className="text-3xl font-bold text-purple-600">3</p>
              <p className="text-sm text-gray-500 mt-1">Active branches</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
