// frontend/web-app/src/components/admin/StatCard.jsx
import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatCard = ({ title, value, icon, change, changePeriod }) => {
  const isPositive = change >= 0;
  
  const getPeriodText = () => {
    switch (changePeriod) {
      case 'today':
        return 'today';
      case 'week':
        return 'this week';
      case 'month':
        return 'this month';
      default:
        return 'recently';
    }
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
          {icon}
        </div>
        
        {change !== undefined && (
          <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            <span className="text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      
      <h3 className="text-xl font-bold text-gray-800 mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{title}</p>
      
      {change !== undefined && (
        <p className="text-xs text-gray-500 mt-2">
          {isPositive ? 'Up' : 'Down'} {Math.abs(change)}% {getPeriodText()}
        </p>
      )}
    </div>
  );
};

export default StatCard;