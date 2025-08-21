import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  AlertCircle,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

interface LoginFormData {
  identifier: string;
  password: string;
}

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, dashboardInfo } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard when authenticated
  React.useEffect(() => {
    if (isAuthenticated && dashboardInfo) {
      if (dashboardInfo.route) {
        navigate(dashboardInfo.route);
      } else {
        navigate('/dashboard');
      }
    } else if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, dashboardInfo, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      console.log('Attempting login with:', data.identifier);
      await login(data.identifier, data.password);
      console.log('Login successful, authentication state updated...');
      // Navigation will be handled by useEffect when isAuthenticated becomes true
    } catch (error: any) {
      console.error('Login error:', error);
      // Handle different types of errors
      if (error.message) {
        setError('root', {
          type: 'manual',
          message: error.message,
        });
      } else if (error.response?.status === 423) {
        setError('root', {
          type: 'manual',
          message: 'Account is locked due to multiple failed login attempts. Please try again later or contact support.',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Login failed. Please check your credentials and try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full mb-6 shadow-lg">
            <Building2 className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Welcome Back
          </h1>
          <p className="text-lg text-gray-600">Sign in to your JelpPharm PMS account</p>
        </div>

        {/* Login Form */}
        <Card className="p-8 shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign In</h2>
            <p className="text-gray-600">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Username Field */}
            <div>
              <label htmlFor="identifier" className="form-label">
                Email or Username <span className="form-required">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="identifier"
                  type="text"
                  placeholder="Enter your email or username"
                  className={`pl-10 pr-4 h-12 w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200 ${
                    errors.identifier ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  {...register('identifier', {
                    required: 'Email or username is required'
                  })}
                />
              </div>
              {errors.identifier && (
                <p className="form-error">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.identifier.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="form-label">
                Password <span className="form-required">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`pl-10 pr-12 h-12 w-full rounded-lg border bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-all duration-200 ${
                    errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'
                  }`}
                  {...register('password', {
                    required: 'Password is required'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Error Display */}
            {errors.root && (
              <div className="alert alert-error">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-600">{errors.root.message}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-5 h-5 mr-2"></div>
                  Signing In...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  Sign In
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              )}
            </Button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <a 
                href="/forgot-password" 
                className="text-blue-600 hover:text-blue-700 font-medium transition-colors text-sm"
              >
                Forgot your password?
              </a>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">New to JelpPharm?</span>
              </div>
            </div>

            <Button
              onClick={() => navigate('/signup')}
              variant="outline"
              className="w-full h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold transition-all duration-200"
            >
              Create New Account
            </Button>
          </div>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center text-xs text-gray-500">
            <Shield className="w-4 h-4 mr-1" />
            Your data is protected with enterprise-grade security
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex justify-center space-x-6 text-sm">
            <button className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
              Privacy Policy
            </button>
            <button className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
              Terms of Service
            </button>
            <button className="text-gray-500 hover:text-gray-700 font-medium transition-colors">
              Support
            </button>
          </div>
          <p className="text-xs text-gray-400">
            © 2024 JelpPharm PMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
