import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface QuickActionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}

export const QuickAction: React.FC<QuickActionProps> = ({
  title,
  description,
  icon,
  href,
  color
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(href);
  };

  // Safe color mapping to avoid dynamic class generation issues
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string }> = {
      'from-blue-500 to-blue-600': { 
        bg: 'bg-gradient-to-r from-blue-500 to-blue-600', 
        border: 'group-hover:border-blue-500' 
      },
      'from-green-500 to-emerald-600': { 
        bg: 'bg-gradient-to-r from-green-500 to-emerald-600', 
        border: 'group-hover:border-emerald-500' 
      },
      'from-purple-500 to-violet-600': { 
        bg: 'bg-gradient-to-r from-purple-500 to-violet-600', 
        border: 'group-hover:border-violet-500' 
      },
      'from-orange-500 to-red-600': { 
        bg: 'bg-gradient-to-r from-orange-500 to-red-600', 
        border: 'group-hover:border-red-500' 
      }
    };
    
    return colorMap[color] || { 
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600', 
      border: 'group-hover:border-blue-500' 
    };
  };

  const colorClasses = getColorClasses(color);

  return (
    <button
      onClick={handleClick}
      className="group relative bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 transform hover:-translate-y-1 text-left"
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 ${colorClasses.bg} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200`} />
      
      {/* Icon */}
      <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
        <div className="text-white">
          {icon}
        </div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>
        
        {/* Action indicator */}
        <div className="flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
          <span>Get Started</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
      
      {/* Hover effect border */}
      <div className={`absolute inset-0 rounded-xl border-2 border-transparent opacity-0 group-hover:opacity-20 ${colorClasses.border} transition-all duration-200`} />
    </button>
  );
};
