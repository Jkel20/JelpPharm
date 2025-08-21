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

  return (
    <button
      onClick={handleClick}
      className="group relative bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 transform hover:-translate-y-1 text-left"
    >
      {/* Background gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200`} />
      
      {/* Icon */}
      <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
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
      <div className={`absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-opacity-20 group-hover:border-${color.split('-')[1]}-500 transition-all duration-200`} />
    </button>
  );
};
