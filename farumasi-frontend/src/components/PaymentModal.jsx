import React, { useState } from 'react';
import axios from 'axios';

export default function PaymentModal({ order, onClose, onPaymentSuccess }) {
  const [paymentData, setPaymentData] = useState({
    phoneNumber: '',
    currency: 'RWF'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const handleInputChange = (e) => {
    setPaymentData({
      ...paymentData,
      [e.target.name]: e.target.value
    });
  };

  const initiatePayment = async () => {
    if (!paymentData.phoneNumber) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/payment/pay', {
        order_id: order.id,
        amount: order.total_price.toString(),
        payer: paymentData.phoneNumber,
        currency: paymentData.currency
      });

      if (response.data.referenceId) {
        setPaymentReference(response.data.referenceId);
        setPaymentStatus('initiated');
        
        // Start checking payment status
        checkPaymentStatus(response.data.referenceId);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setError(error.response?.data?.error || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (referenceId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/payment/status/${referenceId}`);
      
      if (response.data.status === 'SUCCESSFUL') {
        setPaymentStatus('successful');
        if (onPaymentSuccess) {
          onPaymentSuccess(order.id);
        }
      } else if (response.data.status === 'FAILED') {
        setPaymentStatus('failed');
        setError('Payment failed. Please try again.');
      } else {
        // Still pending, check again after 3 seconds
        setTimeout(() => checkPaymentStatus(referenceId), 3000);
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
      setError('Failed to check payment status');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium mb-2">Order Summary</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Order ID:</span>
                <span>#{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Amount:</span>
                <span className="font-semibold">RWF {order.total_price?.toLocaleString()}</span>
              </div>
              {order.delivery_fee && (
                <div className="flex justify-between text-gray-600">
                  <span>Including delivery fee:</span>
                  <span>RWF {order.delivery_fee.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {paymentStatus === 'successful' ? (
            /* Success State */
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>
              <button
                onClick={onClose}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Close
              </button>
            </div>
          ) : paymentStatus === 'initiated' ? (
            /* Pending State */
            <div className="text-center">
              <div className="w-16 h-16 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
              </div>
              <h3 className="text-lg font-semibold text-sky-600 mb-2">Processing Payment</h3>
              <p className="text-gray-600 mb-4">
                Please complete the payment on your phone. We're waiting for confirmation...
              </p>
              <p className="text-sm text-gray-500">
                Reference: {paymentReference}
              </p>
            </div>
          ) : (
            /* Payment Form */
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Money Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={paymentData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="250788123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your mobile money number (MTN Mobile Money, Airtel Money)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={paymentData.currency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="RWF">RWF - Rwandan Franc</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="mt-6 space-y-3">
                <button
                  onClick={initiatePayment}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? 'Processing...' : 'Pay Now'}
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>

              <div className="mt-4 p-3 bg-sky-50 rounded-md">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-sky-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm text-sky-800">
                      <strong>How it works:</strong>
                    </p>
                    <ol className="text-xs text-sky-700 mt-1 list-decimal list-inside space-y-1">
                      <li>Click "Pay Now" to initiate payment</li>
                      <li>You'll receive a payment prompt on your phone</li>
                      <li>Enter your PIN to confirm the payment</li>
                      <li>We'll automatically confirm the payment</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
