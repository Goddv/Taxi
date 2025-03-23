// frontend/web-app/src/pages/passenger/PaymentMethodsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaCreditCard, FaPlus, FaTrash, FaCheck } from 'react-icons/fa';
import { getUserPaymentMethods, addPaymentMethod } from '../../redux/slices/paymentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaymentMethodCard from '../../components/payment/PaymentMethodCard';
import AddCardModal from '../../components/payment/AddCardModal';

const PaymentMethodsPage = () => {
  const dispatch = useDispatch();
  const { paymentMethods, isLoading } = useSelector(state => state.payment);
  
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  
  // Fetch payment methods
  useEffect(() => {
    dispatch(getUserPaymentMethods());
  }, [dispatch]);
  
  // Handle add card
  const handleAddCard = (cardData) => {
    dispatch(addPaymentMethod({
      type: 'card',
      isDefault: cardData.isDefault,
      cardDetails: {
        cardType: cardData.cardType,
        lastFour: cardData.cardNumber.slice(-4),
        expiryMonth: cardData.expiryMonth,
        expiryYear: cardData.expiryYear,
        cardholderName: cardData.cardholderName,
        tokenizedCard: 'token_' + Date.now() // In a real app, this would be from payment processor
      }
    }))
      .then(() => {
        setShowAddCardModal(false);
      });
  };
  
  return (
    <div className="container mx-auto px-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Payment Methods</h2>
          
          <button
            onClick={() => setShowAddCardModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FaPlus className="mr-2" />
            Add Payment Method
          </button>
        </div>
        
        {isLoading && !paymentMethods.length ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="lg" />
          </div>
        ) : paymentMethods.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaCreditCard className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
            <p className="text-gray-500 mb-4">You haven't added any payment methods yet.</p>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
            >
              <FaPlus className="mr-2" />
              Add Payment Method
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map(method => (
              <PaymentMethodCard key={method._id} method={method} />
            ))}
          </div>
        )}
      </div>
      
      {/* Add Card Modal */}
      {showAddCardModal && (
        <AddCardModal
          onClose={() => setShowAddCardModal(false)}
          onAddCard={handleAddCard}
        />
      )}
    </div>
  );
};

export default PaymentMethodsPage;
