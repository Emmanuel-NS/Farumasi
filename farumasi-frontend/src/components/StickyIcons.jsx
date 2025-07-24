import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PrescriptionUpload from './PrescriptionUpload';

export default function StickyIcons({ cartCount = 0 }) {
  const { isAuthenticated } = useAuth();
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  const handlePrescriptionClick = () => {
    if (isAuthenticated) {
      setShowPrescriptionModal(true);
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = '250790160172'; // Replace with any chossen WhatsApp actual number
    const message = 'Hello! I need help with Farumasi pharmacy services.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      {/* Sticky Icons Container */}
      <div className="fixed bottom-6 right-6 flex flex-col space-y-4 z-50">
        {/* WhatsApp Icon */}
        <button
          onClick={handleWhatsAppClick}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-110"
          title="Chat with us on WhatsApp"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
          </svg>
        </button>

        {/* Upload Prescription Icon */}
        <button
          onClick={handlePrescriptionClick}
          disabled={!isAuthenticated}
          className={`p-4 rounded-full shadow-lg transition-all transform ${
            isAuthenticated 
              ? 'bg-sky-500 hover:bg-sky-600 text-white hover:scale-110' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
          }`}
          title={isAuthenticated ? 'Upload Prescription' : 'Login to upload prescription'}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </button>

        {/* Cart Quick View */}
        {cartCount > 0 && (
          <div className="bg-white rounded-full p-2 shadow-lg border-2 border-green-500">
            <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {cartCount}
            </div>
          </div>
        )}
      </div>

      {/* Prescription Upload Modal */}
      {showPrescriptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Upload Prescription</h2>
              <button
                onClick={() => setShowPrescriptionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4">
              <PrescriptionUpload 
                onUploadSuccess={() => {
                  setShowPrescriptionModal(false);
                  // You can add a callback here to refresh orders or show success message
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
