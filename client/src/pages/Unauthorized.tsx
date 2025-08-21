import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, ArrowLeft, Home } from 'lucide-react';
import Button from '../components/ui/Button';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Access Denied
        </h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          You don't have permission to access this resource
        </p>

        {/* Warning Icon */}
        <div className="flex items-center justify-center mb-6">
          <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
          <span className="text-sm text-orange-600 font-medium">
            Insufficient privileges
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          This page requires specific privileges that your current role doesn't have. 
          Please contact your administrator if you believe this is an error.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => navigate(-1)}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Dashboard
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-400 mt-6">
          If you need access to this feature, please contact your system administrator
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;
