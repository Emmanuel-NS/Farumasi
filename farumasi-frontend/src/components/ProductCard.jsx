import React, { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="mb-4">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-md flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
        {product.description && (
          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
        )}
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-green-600">
            RWF {product.price.toLocaleString()}
          </span>
          {product.category && (
            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
              {product.category}
            </span>
          )}
        </div>

        {product.requires_prescription && (
          <div className="flex items-center text-red-600 text-sm mb-2">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Requires Prescription
          </div>
        )}

        {product.pharmacy_name && (
          <p className="text-gray-600 text-sm">
            Sold by: {product.pharmacy_name}
          </p>
        )}
      </div>

      {/* Quantity and Add to Cart */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <label className="text-sm font-medium text-gray-700 mr-2">Qty:</label>
          <select
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
