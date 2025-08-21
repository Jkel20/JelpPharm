import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft, Home, Lock, UserCheck } from 'lucide-react';
import Button from '../components/ui/Button';

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-full mb-6 shadow-2xl">
            <Shield className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Access Denied
          </h1>
          <p className="text-xl text-gray-600">
            You don't have permission to access this resource
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-200 p-8 mb-8">
          {/* Alert Section */}
          <div className="flex items-start mb-6">
            <div className="p-3 bg-orange-100 rounded-lg mr-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-orange-800 mb-2">
                Insufficient Privileges
              </h2>
              <p className="text-orange-700 leading-relaxed">
                This page requires specific privileges that your current role doesn't have. 
                Please contact your administrator if you believe this is an error.
              </p>
            </div>
          </div>

          {/* What Happened */}
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-5 h-5 mr-2 text-gray-600" />
              What Happened?
            </h3>
            <div className="space-y-3 text-gray-700">
              <p className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                You attempted to access a protected resource or feature
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Your current role doesn't have the required permissions
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                This is a security measure to protect sensitive information
              </p>
            </div>
          </div>

          {/* How to Resolve */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
              How to Resolve
            </h3>
            <div className="space-y-3 text-blue-800">
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Contact your system administrator to request access
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Provide a business justification for the access request
              </p>
              <p className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Wait for approval and role assignment
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button
            onClick={() => navigate(-1)}
            className="w-full h-14 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full h-14 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold text-lg transition-all duration-200"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Need immediate assistance?
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="mailto:support@jelppharm.com" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Contact Support
            </a>
            <a href="tel:+233-XX-XXX-XXXX" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Call Admin
            </a>
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Request Access
            </button>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center text-xs text-gray-500 bg-white/60 px-4 py-2 rounded-full">
            <Shield className="w-4 h-4 mr-2" />
            This is a security feature to protect your pharmacy's data
          </div>
        </div>
      </div>
    </div>
  );
};
