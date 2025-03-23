// frontend/web-app/src/components/booking/PaymentMethodSelector.jsx
import React from 'react';
import { FaWallet, FaCreditCard, FaMoneyBillWave, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const PaymentMethodSelector = ({ selectedMethod, paymentMethods, onChange }) => {
  const getLastFour = (card) => {
    return card?.cardDetails?.lastFour || '****';
  };
  
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
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
      
      <div className="space-y-3">
        {/* Cash option */}
        <div
          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            selectedMethod === 'cash'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange({ target: { name: 'paymentMethod', value: 'cash' } })}
        >
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
            <FaMoneyBillWave className="text-green-500 text-xl" />
          </div>
          
          <div className="ml-4 flex-grow">
            <div className="text-sm font-medium text-gray-900">Cash</div>
            <div className="text-sm text-gray-500">Pay with cash directly to driver</div>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === 'cash'}
              onChange={() => {}}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
          </div>
        </div>
        
        {/* Wallet option */}
        <div
          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
            selectedMethod === 'wallet'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:bg-gray-50'
          }`}
          onClick={() => onChange({ target: { name: 'paymentMethod', value: 'wallet' } })}
        >
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
            <FaWallet className="text-blue-500 text-xl" />
          </div>
          
          <div className="ml-4 flex-grow">
            <div className="text-sm font-medium text-gray-900">Wallet</div>
            <div className="text-sm text-gray-500">Pay with your wallet balance</div>
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <input
              type="radio"
              name="paymentMethod"
              checked={selectedMethod === 'wallet'}
              onChange={() => {}}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
          </div>
        </div>
        
        {/* Saved cards */}
        {paymentMethods.map(method => {
          if (method.type === 'card') {
            return (
              <div
                key={method._id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => onChange({ target: { name: 'paymentMethod', value: method._id } })}
              >
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                  <FaCreditCard className="text-purple-500 text-xl" />
                </div>
                
                <div className="ml-4 flex-grow">
                  <div className="text-sm font-medium text-gray-900">
                    {getCardIcon(method.cardDetails.cardType)}
                  </div>
                  <div className="text-sm text-gray-500">
                    **** **** **** {getLastFour(method)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Expires {method.cardDetails.expiryMonth}/{method.cardDetails.expiryYear}
                  </div>
                </div>
                
                <div className="ml-4 flex-shrink-0">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === method._id}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                </div>
              </div>
            );
          }
          return null;
        })}
        
        {/* Add new payment method */}
        <Link
          to="/payment-methods"
          className="flex items-center p-3 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
            <FaPlus className="text-gray-500 text-xl" />
          </div>
          
          <div className="ml-4 flex-grow">
            <div className="text-sm font-medium text-gray-900">Add Payment Method</div>
            <div className="text-sm text-gray-500">Add a new card or payment option</div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;