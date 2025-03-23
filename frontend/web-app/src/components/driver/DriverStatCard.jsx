// frontend/web-app/src/components/driver/DriverStatCard.jsx
import React from 'react';

const DriverStatCard = ({ icon, title, value }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
      <div className="text-2xl mb-2">
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{title}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
};

export default DriverStatCard;