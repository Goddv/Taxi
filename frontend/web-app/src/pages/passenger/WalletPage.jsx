// frontend/web-app/src/pages/passenger/WalletPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaWallet, FaMoneyBillWave, FaCreditCard, FaArrowUp, FaArrowDown, FaHistory } from 'react-icons/fa';
import { getUserWallet, addWalletFunds, getUserPaymentMethods } from '../../redux/slices/paymentSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AddFundsModal from '../../components/payment/AddFundsModal';

const WalletPage = () => {
  const dispatch = useDispatch();
  const { wallet, paymentMethods, isLoading } = useSelector(state => state.payment);
  
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  
  // Fetch wallet and payment methods
  useEffect(() => {
    dispatch(getUserWallet());
    dispatch(getUserPaymentMethods());
  }, [dispatch]);
  
  // Handle add funds
  const handleAddFunds = (amount, paymentMethodId) => {
    dispatch(addWalletFunds({ amount, paymentMethodId }))
      .then(() => {
        setShowAddFundsModal(false);
      });
  };
  
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  if (isLoading && !wallet) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Your Wallet</h2>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <FaWallet className="text-blue-600 text-xl" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Available Balance</p>
                    <p className="text-3xl font-semibold text-blue-700">${(wallet?.balance || 0).toFixed(2)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAddFundsModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Funds
                </button>
              </div>
              
              <div className="flex flex-wrap -mx-2">
                <div className="w-1/2 px-2">
                  <Link
                    to="/bookings"
                    className="block text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <FaHistory className="mx-auto text-gray-500 mb-2" />
                    <span className="text-sm text-gray-700">Transaction History</span>
                  </Link>
                </div>
                <div className="w-1/2 px-2">
                  <Link
                    to="/payment-methods"
                    className="block text-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <FaCreditCard className="mx-auto text-gray-500 mb-2" />
                    <span className="text-sm text-gray-700">Payment Methods</span>
                  </Link>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
            
            {!wallet || !wallet.recentTransactions || wallet.recentTransactions.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <div className="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FaMoneyBillWave className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions</h3>
                <p className="text-gray-500 mb-4">You haven't made any transactions yet.</p>
                <button
                  onClick={() => setShowAddFundsModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                >
                  Add Funds to Get Started
                </button>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Date
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Description
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {wallet.recentTransactions.map((transaction, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {transaction.description}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                          transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'credit' ? (
                            <span className="flex items-center justify-end">
                              <FaArrowUp className="mr-1" />
                              +${transaction.amount.toFixed(2)}
                            </span>
                          ) : (
                            <span className="flex items-center justify-end">
                              <FaArrowDown className="mr-1" />
                              -${transaction.amount.toFixed(2)}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full lg:w-1/3">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Payment Methods</h3>
            
            {paymentMethods.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500 mb-4">You haven't added any payment methods yet.</p>
                <Link
                  to="/payment-methods"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  <FaCreditCard className="mr-2" />
                  Add Payment Method
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.filter(method => method.type === 'card').slice(0, 3).map(method => (
                  <div key={method._id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <FaCreditCard className={`mr-3 ${method.isDefault ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {method.cardDetails.cardType === 'visa' ? 'Visa' : 
                           method.cardDetails.cardType === 'mastercard' ? 'Mastercard' : 
                           method.cardDetails.cardType === 'amex' ? 'Amex' : 'Card'}
                          {method.isDefault && <span className="ml-2 text-xs text-blue-600">(Default)</span>}
                        </p>
                        <p className="text-xs text-gray-500">**** {method.cardDetails.lastFour}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <Link
                  to="/payment-methods"
                  className="block text-center text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Manage Payment Methods
                </Link>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Benefits of Using Wallet</h3>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Fast and Convenient</p>
                  <p className="text-sm text-gray-500">Quick payments without entering card details each time.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Track Your Spending</p>
                  <p className="text-sm text-gray-500">Monitor all your ride expenses in one place.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Exclusive Rewards</p>
                  <p className="text-sm text-gray-500">Earn points for wallet payments and get special discounts.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Funds Modal */}
      {showAddFundsModal && (
        <AddFundsModal
          onClose={() => setShowAddFundsModal(false)}
          onAddFunds={handleAddFunds}
          paymentMethods={paymentMethods.filter(method => method.type === 'card')}
        />
      )}
    </div>
  );
};

export default WalletPage;