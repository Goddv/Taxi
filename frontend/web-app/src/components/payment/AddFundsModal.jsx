// frontend/web-app/src/components/payment/AddFundsModal.jsx
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaWallet, FaCreditCard, FaTimes, FaPlus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../common/LoadingSpinner';

const AddFundsModal = ({ onClose, onAddFunds, paymentMethods }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const presetAmounts = [10, 25, 50, 100];
  
  const formik = useFormik({
    initialValues: {
      amount: '',
      paymentMethodId: paymentMethods.length > 0 ? paymentMethods[0]._id : ''
    },
    validationSchema: Yup.object({
      amount: Yup.number()
        .required('Amount is required')
        .min(5, 'Minimum amount is $5')
        .max(1000, 'Maximum amount is $1000'),
      paymentMethodId: Yup.string().required('Payment method is required')
    }),
    onSubmit: values => {
      setIsSubmitting(true);
      
      // Process payment with slight delay for UX
      setTimeout(() => {
        onAddFunds(parseFloat(values.amount), values.paymentMethodId);
        setIsSubmitting(false);
      }, 1000);
    }
  });
  
  // Handle preset amount click
  const handlePresetAmount = (amount) => {
    formik.setFieldValue('amount', amount);
  };
  
  // Get card details for display
  const getCardDetails = (methodId) => {
    const method = paymentMethods.find(m => m._id === methodId);
    if (!method) return null;
    
    return {
      type: method.cardDetails.cardType,
      lastFour: method.cardDetails.lastFour
    };
  };
  
  // Format card type for display
  const formatCardType = (type) => {
    switch (type) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'Amex';
      default:
        return 'Card';
    }
  };
  
  const selectedCard = formik.values.paymentMethodId ? getCardDetails(formik.values.paymentMethodId) : null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Funds to Wallet</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={formik.handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Select Amount
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {presetAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handlePresetAmount(amount)}
                    className={`py-2 px-4 rounded-md text-sm font-medium ${
                      formik.values.amount === amount
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  placeholder="Enter amount"
                  min="5"
                  max="1000"
                  value={formik.values.amount}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-7 pr-12 py-2 border ${
                    formik.touched.amount && formik.errors.amount
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
              {formik.touched.amount && formik.errors.amount && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.amount}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="paymentMethodId" className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              {paymentMethods.length === 0 ? (
                <div className="border border-gray-300 rounded-md p-4 text-center">
                  <p className="text-sm text-gray-500 mb-2">No payment methods available</p>
                  <Link
                    to="/payment-methods"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    onClick={onClose}
                  >
                    <FaPlus className="mr-1" />
                    Add Payment Method
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <div
                      key={method._id}
                      className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${
                        formik.values.paymentMethodId === method._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => formik.setFieldValue('paymentMethodId', method._id)}
                    >
                      <div className="flex items-center">
                        <FaCreditCard className="text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {formatCardType(method.cardDetails.cardType)}
                            {method.isDefault && <span className="ml-2 text-xs text-blue-600">(Default)</span>}
                          </p>
                          <p className="text-xs text-gray-500">**** {method.cardDetails.lastFour}</p>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="paymentMethodId"
                        value={method._id}
                        checked={formik.values.paymentMethodId === method._id}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                    </div>
                  ))}
                </div>
              )}
              {formik.touched.paymentMethodId && formik.errors.paymentMethodId && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.paymentMethodId}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6">
            {formik.values.amount && selectedCard && (
              <div className="bg-gray-50 rounded-md p-3 mb-4">
                <p className="text-sm text-gray-600 mb-1">Summary</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Add ${parseFloat(formik.values.amount).toFixed(2)} to Wallet
                  </span>
                  <span className="text-sm text-gray-600">
                    Using {formatCardType(selectedCard.type)} *{selectedCard.lastFour}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || paymentMethods.length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <>
                    <FaWallet className="mr-2" />
                    Add Funds
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFundsModal;