// frontend/web-app/src/components/payment/AddCardModal.jsx
import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaCreditCard, FaUser, FaCalendarAlt, FaLock, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../common/LoadingSpinner';

const AddCardModal = ({ onClose, onAddCard }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formik = useFormik({
    initialValues: {
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false,
      cardType: 'visa' // Will be determined based on card number in real app
    },
    validationSchema: Yup.object({
      cardholderName: Yup.string().required('Cardholder name is required'),
      cardNumber: Yup.string()
        .required('Card number is required')
        .matches(/^[0-9]{16}$/, 'Card number must be 16 digits'),
      expiryMonth: Yup.string()
        .required('Expiry month is required')
        .matches(/^(0[1-9]|1[0-2])$/, 'Must be valid month (01-12)'),
      expiryYear: Yup.string()
        .required('Expiry year is required')
        .matches(/^[0-9]{2}$/, 'Must be valid 2-digit year'),
      cvv: Yup.string()
        .required('CVV is required')
        .matches(/^[0-9]{3,4}$/, 'CVV must be 3 or 4 digits')
    }),
    onSubmit: values => {
      setIsSubmitting(true);
      
      // Simulate card verification delay
      setTimeout(() => {
        onAddCard(values);
        setIsSubmitting(false);
      }, 1000);
    }
  });
  
  // Format card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0; i < match.length; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    
    return value;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Add Payment Method</h2>
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
              <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                Cardholder Name
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  id="cardholderName"
                  name="cardholderName"
                  type="text"
                  placeholder="Name on card"
                  value={formik.values.cardholderName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    formik.touched.cardholderName && formik.errors.cardholderName
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                />
              </div>
              {formik.touched.cardholderName && formik.errors.cardholderName && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.cardholderName}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCreditCard className="text-gray-400" />
                </div>
                <input
                  id="cardNumber"
                  name="cardNumber"
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  value={formatCardNumber(formik.values.cardNumber)}
                  onChange={(e) => {
                    // Remove spaces for validation but keep for display
                    const rawValue = e.target.value.replace(/\s/g, '');
                    formik.setFieldValue('cardNumber', rawValue);
                  }}
                  onBlur={formik.handleBlur}
                  className={`block w-full pl-10 pr-3 py-2 border ${
                    formik.touched.cardNumber && formik.errors.cardNumber
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                />
              </div>
              {formik.touched.cardNumber && formik.errors.cardNumber && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.cardNumber}</p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <div className="flex space-x-2">
                  <div className="relative rounded-md shadow-sm w-1/2">
                    <input
                      id="expiryMonth"
                      name="expiryMonth"
                      type="text"
                      placeholder="MM"
                      maxLength={2}
                      value={formik.values.expiryMonth}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`block w-full px-3 py-2 border ${
                        formik.touched.expiryMonth && formik.errors.expiryMonth
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                    />
                  </div>
                  <div className="relative rounded-md shadow-sm w-1/2">
                    <input
                      id="expiryYear"
                      name="expiryYear"
                      type="text"
                      placeholder="YY"
                      maxLength={2}
                      value={formik.values.expiryYear}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`block w-full px-3 py-2 border ${
                        formik.touched.expiryYear && formik.errors.expiryYear
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                    />
                  </div>
                </div>
                {((formik.touched.expiryMonth && formik.errors.expiryMonth) || 
                  (formik.touched.expiryYear && formik.errors.expiryYear)) && (
                  <p className="mt-1 text-sm text-red-600">
                    {formik.errors.expiryMonth || formik.errors.expiryYear}
                  </p>
                )}
              </div>
              
              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className="text-gray-400" />
                  </div>
                  <input
                    id="cvv"
                    name="cvv"
                    type="text"
                    placeholder="123"
                    maxLength={4}
                    value={formik.values.cvv}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`block w-full pl-10 pr-3 py-2 border ${
                      formik.touched.cvv && formik.errors.cvv
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                    } rounded-md shadow-sm focus:outline-none sm:text-sm`}
                  />
                </div>
                {formik.touched.cvv && formik.errors.cvv && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.cvv}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="isDefault"
                name="isDefault"
                type="checkbox"
                checked={formik.values.isDefault}
                onChange={formik.handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                Set as default payment method
              </label>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {isSubmitting ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                'Add Card'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;