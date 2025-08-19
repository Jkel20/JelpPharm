import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  FileText, 
  BarChart3, 
  Menu, 
  X, 
  User,
  LogOut,
  Settings,
  Bell,
  Search
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <Home className="w-5 h-5" />,
      description: 'Overview and key metrics'
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: <Package className="w-5 h-5" />,
      description: 'Manage drug stock and alerts'
    },
    {
      name: 'Sales',
      path: '/sales',
      icon: <ShoppingCart className="w-5 h-5" />,
      description: 'Process transactions and receipts'
    },
    {
      name: 'Prescriptions',
      path: '/prescriptions',
      icon: <FileText className="w-5 h-5" />,
      description: 'Manage patient prescriptions'
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: <BarChart3 className="w-5 h-5" />,
      description: 'Analytics and insights'
    }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:block fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-white via-blue-50 to-purple-50 shadow-xl border-r border-gray-200 z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
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

          {/* Navigation Items */}
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-white/80 hover:shadow-md hover:scale-105'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    isActive(item.path)
                      ? 'bg-white/20'
                      : 'bg-gray-100 group-hover:bg-blue-100'
                  }`}>
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className={`text-xs ${
                      isActive(item.path) ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.role || 'Staff'}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => navigate('/settings')}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </button>
                <button 
                  onClick={logout}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JelpPharm
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                <Bell className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-xl border-b border-gray-200 z-30">
            <div className="px-4 py-6">
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      isActive(item.path) ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.name}</div>
                      <div className={`text-xs ${
                        isActive(item.path) ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
              
              {/* Mobile User Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{user?.role || 'Staff'}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate('/settings')}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </button>
                  <button 
                    onClick={logout}
                    className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Offset for Desktop */}
      <div className="hidden lg:block w-64"></div>
    </>
  );
};

export default Navigation;
