// frontend/web-app/src/components/driver/EarningsSummary.jsx
import React from 'react';

const EarningsSummary = ({ title, amount, icon }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center mb-4">
        <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
      </div>
      <p className="text-3xl font-semibold text-gray-900">${amount.toFixed(2)}</p>
    </div>
  );
};

export default EarningsSummary;
