import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Users, 
  Building2, 
  User, 
  LogOut,
  Menu,
  X,
  Settings,
  Search,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  requiredPrivilege: string;
  badge?: string;
}

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPrivilege } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Define all navigation items with their required privileges
  const allNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      description: 'Overview and key metrics',
      requiredPrivilege: 'VIEW_REPORTS'
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: <Package className="w-5 h-5" />,
      description: 'Manage drug stock and alerts',
      requiredPrivilege: 'VIEW_INVENTORY',
      badge: 'New'
    },
    {
      name: 'Sales',
      path: '/sales',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Process transactions and receipts',
      requiredPrivilege: 'VIEW_SALES'
    },
    {
      name: 'Prescriptions',
      path: '/prescriptions',
      icon: <FileText className="w-5 h-5" />,
      description: 'Manage patient prescriptions',
      requiredPrivilege: 'VIEW_PRESCRIPTIONS'
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Analytics and insights',
      requiredPrivilege: 'VIEW_REPORTS'
    },
    {
      name: 'Users',
      path: '/users',
      icon: <Users className="w-5 h-5" />,
      description: 'Manage system users',
      requiredPrivilege: 'VIEW_USERS'
    },
    {
      name: 'Stores',
      path: '/stores',
      icon: <Building2 className="w-5 h-5" />,
      description: 'Manage pharmacy locations',
      requiredPrivilege: 'SYSTEM_SETTINGS'
    }
  ];

  // Filter navigation items based on user privileges
  const navItems = allNavItems.filter(item => {
    const hasAccess = hasPrivilege(item.requiredPrivilege);
    console.log('Navigation Debug:', {
      item: item.name,
      requiredPrivilege: item.requiredPrivilege,
      hasAccess,
      userRole: user?.role
    });
    return hasAccess;
  });

  // Filter items based on search query
  const filteredNavItems = navItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-col h-screen w-64 bg-white border-r border-gray-200 shadow-lg">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JelpPharm
              </h1>
              <p className="text-xs text-gray-500">Pharmacy Management</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`group relative w-full flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={item.description}
            >
              <div className={`p-2 rounded-lg mr-3 ${
                isActive(item.path)
                  ? 'bg-white/20'
                  : 'bg-gray-100 group-hover:bg-blue-100'
              }`}>
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.name}</span>
                  {item.badge && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className={`text-xs ${
                  isActive(item.path) ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {item.description}
                </p>
              </div>
              {isActive(item.path) && (
                <ChevronRight className="w-4 h-4 ml-2" />
              )}
            </button>
          ))}
        </div>
        
        {/* User Profile Section */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role || 'Role'}
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={() => navigate('/settings')}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={toggleMobileMenu}
          className="p-2 bg-white rounded-lg shadow-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">JelpPharm</h2>
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Mobile Navigation Items */}
          <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
            {filteredNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center p-4 rounded-xl text-left transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className={`p-2 rounded-lg mr-4 ${
                  isActive(item.path) ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm ${
                    isActive(item.path) ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          {/* Mobile User Profile */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user?.role || 'Role'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => {
                    navigate('/settings');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center px-3 py-3 text-sm text-gray-600 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-3 text-sm text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
