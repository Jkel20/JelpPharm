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
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description: string;
  requiredPrivilege: string;
}

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, hasPrivilege } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      requiredPrivilege: 'VIEW_INVENTORY'
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
  const navItems = allNavItems.filter(item => hasPrivilege(item.requiredPrivilege));

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
      <nav className="hidden md:flex flex-col space-y-2 p-4">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`group relative flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              isActive(item.path)
                ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
            title={item.description}
          >
            <span className="mr-3">{item.icon}</span>
            {item.name}
            
            {/* Active indicator */}
            {isActive(item.path) && (
              <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-700 rounded-l-full" />
            )}
          </button>
        ))}
        
        {/* User Profile Section */}
        <div className="mt-auto pt-4 border-t border-gray-200">
          <div className="px-3 py-2">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
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
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Toggle */}
      <div className="md:hidden p-4">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
        <div className="md:hidden fixed inset-0 z-50 bg-white">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </button>
            ))}
            
            {/* Mobile User Profile */}
            <div className="pt-4 border-t border-gray-200">
              <div className="px-3 py-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.role || 'Role'}
                    </p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
