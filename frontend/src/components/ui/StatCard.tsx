import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  ariaLabel?: string;
}

/**
 * Reusable StatCard component for displaying statistics
 * Accessible with ARIA labels and keyboard navigation support
 */
const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  ariaLabel 
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  };

  const iconColorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`p-6 rounded-lg border-2 ${colorClasses[color]} shadow-sm hover:shadow-md transition-shadow`}
      role="region"
      aria-label={ariaLabel || `${title}: ${value}`}
      tabIndex={0}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-80 mb-1" aria-hidden="true">
            {title}
          </p>
          <p className="text-3xl font-bold" aria-label={`${title} value is ${value}`}>
            {value}
          </p>
        </div>
        {icon && (
          <div className={`ml-4 ${iconColorClasses[color]}`} aria-hidden="true">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StatCard;

