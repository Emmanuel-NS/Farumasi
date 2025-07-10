import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';

export default function OrderSummary({ cart, onUpdateQuantity, onRemoveItem, onPlaceOrder }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [insuranceProvider, setInsuranceProvider] = useState('NONE');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const hasPrescriptionItems = cart.some(item => item.requires_prescription);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const orderData = new FormData();
      
      const items = cart.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));
      
      orderData.append('items', JSON.stringify(items));
      orderData.append('insurance_provider', insuranceProvider);

      const result = await onPlaceOrder(orderData);
      
      if (result.success) {
        setSuccess('Order placed successfully!');
        setCurrentOrder(result.data);
        
        // Show payment modal if order has total price
        if (result.data.total_price) {
          setTimeout(() => {
            setShowPaymentModal(true);
          }, 1000);
        }
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 sticky top-6">
      <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

      {cart.length === 0 ? (
        <p className="text-gray-500 text-center py-8">Your cart is empty</p>
      ) : (
        <>
          {/* Cart Items */}
          <div className="space-y-4 mb-6">
            {cart.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between border-b pb-4">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{item.product_name}</h4>
                  <p className="text-gray-600 text-sm">
                    RWF {item.price.toLocaleString()} each
                  </p>
                  {item.requires_prescription && (
                    <span className="text-red-600 text-xs">Requires prescription</span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => onUpdateQuantity(item.product_id, item.quantity - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                    >
                      -
                    </button>
                    <span className="mx-2 text-sm w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.product_id, item.quantity + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm hover:bg-gray-300"
                    >
                      +
                    </button>
                  </div>
                  
                  <button
                    onClick={() => onRemoveItem(item.product_id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Insurance Provider Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Insurance Provider
            </label>
            <select
              value={insuranceProvider}
              onChange={(e) => setInsuranceProvider(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="NONE">No Insurance</option>
              <option value="RSSB">RSSB</option>
              <option value="MUTUELLE">MUTUELLE</option>
              <option value="SANLAM">SANLAM</option>
              <option value="MMI">MMI</option>
            </select>
          </div>

          {/* Prescription Warning */}
          {hasPrescriptionItems && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <div className="flex">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm text-yellow-800">
                    Some items require a prescription. Please ensure you have a valid prescription before ordering.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4 mb-6">
            <div className="flex justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>RWF {subtotal.toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              * Final price may vary based on pharmacy selection and delivery fees
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading || cart.length === 0}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>

          <p className="text-xs text-gray-500 mt-2 text-center">
            By placing an order, you agree to our terms and conditions
          </p>
        </>
      )}

      {/* Payment Modal */}
      {showPaymentModal && currentOrder && (
        <PaymentModal
          order={currentOrder}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={(orderId) => {
            setShowPaymentModal(false);
            setSuccess('Payment completed successfully!');
            // You can add additional logic here like refreshing orders
          }}
        />
      )}
    </div>
  );
}
