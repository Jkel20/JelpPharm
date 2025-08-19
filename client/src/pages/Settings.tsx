import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  MapPin, 
  Shield, 
  Bell,
  Save,
  Edit3
} from 'lucide-react';
import Button from '../components/ui/Button';

import { Card } from '../components/ui/Card';

interface SettingsFormData {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  storeName?: string;
  storeAddress?: string;
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number;
  };
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SettingsFormData>({
    fullName: user?.name || 'Kwame Addo',
    email: user?.email || 'kwame.addo@jelppharm.com',
    phone: '+233 24 123 4567',
    role: user?.role || 'Pharmacist',
    storeName: 'Addo Pharmacy',
    storeAddress: '123 High Street, Accra, Ghana',
    notifications: {
      email: true,
      sms: false,
      push: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
    },
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [section, key] = field.split('.');
      setFormData(prev => {
        if (section === 'notifications') {
          return {
            ...prev,
            notifications: {
              ...prev.notifications,
              [key]: value,
            },
          };
        } else if (section === 'security') {
          return {
            ...prev,
            security: {
              ...prev.security,
              [key]: value,
            },
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // TODO: Implement actual settings update API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
      // Show success message
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      fullName: user?.name || 'Kwame Addo',
      email: user?.email || 'kwame.addo@jelppharm.com',
      phone: '+233 24 123 4567',
      role: user?.role || 'Pharmacist',
      storeName: 'Addo Pharmacy',
      storeAddress: '123 High Street, Accra, Ghana',
      notifications: {
        email: true,
        sms: false,
        push: true,
      },
      security: {
        twoFactorAuth: false,
        sessionTimeout: 30,
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account and system preferences</p>
        </div>
        <div className="flex space-x-3">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                isLoading={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Profile Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                    className="pl-10 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your email address"
                    className="pl-10 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className="pl-10 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Store Manager">Store Manager</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        {/* Store Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <Building2 className="w-5 h-5 mr-2 text-green-600" />
              Store Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => handleInputChange('storeName', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter store name"
                    className="pl-10 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Store Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.storeAddress}
                    onChange={(e) => handleInputChange('storeAddress', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter store address"
                    className="pl-10 flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <Bell className="w-5 h-5 mr-2 text-yellow-600" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Email Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.email}
                  onChange={(e) => handleInputChange('notifications.email', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">SMS Notifications</p>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.sms}
                  onChange={(e) => handleInputChange('notifications.sms', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Push Notifications</p>
                  <p className="text-sm text-gray-500">Receive in-app notifications</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifications.push}
                  onChange={(e) => handleInputChange('notifications.push', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
              <Shield className="w-5 h-5 mr-2 text-red-600" />
              Security Settings
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Add an extra layer of security</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.security.twoFactorAuth}
                  onChange={(e) => handleInputChange('security.twoFactorAuth', e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <select
                  value={formData.security.sessionTimeout}
                  onChange={(e) => handleInputChange('security.sessionTimeout', parseInt(e.target.value))}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                  <option value={480}>8 hours</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </div>

              {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-8">
          <p>&copy; {new Date().getFullYear()} JelpPharm. All rights reserved.</p>
          <p className="mt-1">Pharmacy Management System for Ghana - Powered by Addo Pharmacy</p>
        </div>
    </div>
  );
};
