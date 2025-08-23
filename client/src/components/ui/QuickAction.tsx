import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { gradients, combineClasses } from '../../utils/classUtils';

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

  // Safe color mapping using the utility system
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; border: string }> = {
      'from-blue-500 to-blue-600': { 
        bg: gradients.blue['500-to-600'], 
        border: 'group-hover:border-blue-500' 
      },
      'from-green-500 to-green-600': { 
        bg: gradients.green['500-to-600'], 
        border: 'group-hover:border-green-500' 
      },
      'from-emerald-500 to-emerald-600': { 
        bg: gradients.green['500-to-emerald-600'], 
        border: 'group-hover:border-emerald-500' 
      },
      'from-purple-500 to-purple-600': { 
        bg: gradients.purple['500-to-600'], 
        border: 'group-hover:border-purple-500' 
      },
      'from-orange-500 to-orange-600': { 
        bg: gradients.orange['500-to-600'], 
        border: 'group-hover:border-orange-500' 
      },
      'from-indigo-500 to-indigo-600': { 
        bg: 'bg-gradient-to-r from-indigo-500 to-indigo-600', 
        border: 'group-hover:border-indigo-500' 
      }
    };
    
    return colorMap[color] || { 
      bg: gradients.blue['500-to-600'], 
      border: 'group-hover:border-blue-500' 
    };
  };

  const colorClasses = getColorClasses(color);

  return (
    <button
      onClick={handleClick}
      className={combineClasses(
        "group relative bg-white rounded-xl p-6 shadow-sm border border-gray-200",
        "hover:shadow-lg hover:border-gray-300 transition-all duration-200",
        "transform hover:-translate-y-1 text-left"
      )}
    >
      {/* Background gradient overlay */}
      <div className={combineClasses(
        "absolute inset-0 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-200",
        colorClasses.bg
      )} />
      
      {/* Icon */}
      <div className={combineClasses(
        "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
        "group-hover:scale-110 transition-transform duration-200",
        colorClasses.bg
      )}>
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
      <div className={combineClasses(
        "absolute inset-0 rounded-xl border-2 border-transparent opacity-0",
        "group-hover:opacity-20 transition-all duration-200",
        colorClasses.border
      )} />
    </button>
  );
};
