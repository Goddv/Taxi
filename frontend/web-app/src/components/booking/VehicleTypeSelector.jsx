// frontend/web-app/src/components/booking/VehicleTypeSelector.jsx
import React from 'react';
import { FaCar, FaCarSide, FaCrown, FaUsers } from 'react-icons/fa';

const VehicleTypeSelector = ({ selectedType, onChange, nearbyDrivers }) => {
  const vehicleTypes = [
    {
      id: 'economy',
      name: 'Economy',
      icon: <FaCar className="text-blue-500 text-xl" />,
      description: 'Budget-friendly, everyday rides',
      capacity: '4 passengers',
      multiplier: 1
    },
    {
      id: 'comfort',
      name: 'Comfort',
      icon: <FaCarSide className="text-green-500 text-xl" />,
      description: 'Newer cars with extra legroom',
      capacity: '4 passengers',
      multiplier: 1.2
    },
    {
      id: 'premium',
      name: 'Premium',
      icon: <FaCrown className="text-yellow-500 text-xl" />,
      description: 'Luxury vehicles with top-rated drivers',
      capacity: '4 passengers',
      multiplier: 1.5
    },
    {
      id: 'van',
      name: 'Van',
      icon: <FaUsers className="text-purple-500 text-xl" />,
      description: 'Spacious vehicles for larger groups',
      capacity: '6 passengers',
      multiplier: 1.7
    }
  ];

  // Count nearby drivers by vehicle type
  const getDriverCountByType = (type) => {
    return nearbyDrivers.filter(driver => driver.vehicleType === type).length;
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Select Vehicle Type</h3>
      
      <div className="space-y-3">
        {vehicleTypes.map(type => (
          <div
            key={type.id}
            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onChange({ target: { name: 'vehicleType', value: type.id } })}
          >
            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
              {type.icon}
            </div>
            
            <div className="ml-4 flex-grow">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">{type.name}</div>
                <div className="text-sm text-gray-500">{type.multiplier > 1 ? `${type.multiplier}x` : 'Base rate'}</div>
              </div>
              <div className="text-sm text-gray-500">{type.description}</div>
              <div className="text-xs text-gray-500">Up to {type.capacity}</div>
            </div>
            
            <div className="ml-4 flex-shrink-0">
              <div className="text-sm text-gray-500">{getDriverCountByType(type.id)} nearby</div>
              <input
                type="radio"
                name="vehicleType"
                checked={selectedType === type.id}
                onChange={() => {}}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleTypeSelector;