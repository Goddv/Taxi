// frontend/web-app/src/components/payment/PaymentMethodCard.jsx
import React from 'react';
import { FaCreditCard, FaStar, FaTrash, FaCheckCircle } from 'react-icons/fa';

const PaymentMethodCard = ({ method }) => {
  const getCardIcon = (cardType) => {
    switch (cardType) {
      case 'visa':
        return '💳 Visa';
      case 'mastercard':
        return '💳 Mastercard';
      case 'amex':
        return '💳 Amex';
      default:
        return '💳 Card';
    }
  };
  
  const getLastFour = (card) => {
    return card?.cardDetails?.lastFour || '****';
  };
  
  const formatExpiryDate = (month, year) => {
    return `${month}/${year}`;
  };
  
  if (method.type !== 'card') return null;
  
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-center">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
            <FaCreditCard className="text-blue-600" />
          </div>
          
          <div>
            <div className="text-lg font-medium text-gray-800">
              {getCardIcon(method.cardDetails.cardType)}
              {method.isDefault && (
                <span className="ml-2 text-sm text-green-600 font-normal inline-flex items-center">
                  <FaCheckCircle className="mr-1" />
                  Default
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500">
              **** **** **** {getLastFour(method)}
            </div>
            <div className="text-sm text-gray-500">
              Expires {formatExpiryDate(method.cardDetails.expiryMonth, method.cardDetails.expiryYear)}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          {!method.isDefault && (
            <button
              className="p-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              title="Set as default"
            >
              <FaStar />
            </button>
          )}
          
          <button
            className="p-2 text-red-600 hover:text-red-800 focus:outline-none"
            title="Remove"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodCard;