import React, { useState } from 'react';
import axios from 'axios';

export default function PrescriptionUpload({ onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [insuranceProvider, setInsuranceProvider] = useState('NONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Please select a valid image (JPEG, PNG) or PDF file');
        return;
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        setError('File size should be less than 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a prescription file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('prescription_file', selectedFile);
      formData.append('insurance_provider', insuranceProvider);

      const response = await axios.post('https://farumasi.onrender.com/api/orders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setSuccess('Prescription uploaded successfully! Your order is under review.');
        setSelectedFile(null);
        if (onUploadSuccess) {
          onUploadSuccess();
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.response?.data?.error || 'Failed to upload prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-sky-900 mb-4">Upload Prescription</h3>
      
      <div className="space-y-4">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Prescription File
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: JPEG, PNG, PDF (max 5MB)
          </p>
        </div>

        {/* Insurance Provider Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Insurance Provider
          </label>
          <select
            value={insuranceProvider}
            onChange={(e) => setInsuranceProvider(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="NONE">No Insurance</option>
            <option value="RSSB">RSSB</option>
            <option value="MUTUELLE">MUTUELLE</option>
            <option value="SANLAM">SANLAM</option>
            <option value="MMI">MMI</option>
          </select>
        </div>

        {/* File Preview */}          {selectedFile && (
            <div className="bg-white border border-gray-200 rounded-md p-3">
              <div className="flex items-center">
                <svg className="w-8 h-8 text-sky-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Upload Button */}          <button
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            className="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Uploading...' : 'Upload Prescription'}
          </button>

          {/* Info */}
          <div className="bg-sky-50 border border-sky-200 rounded-md p-3">
            <div className="flex">
              <svg className="w-5 h-5 text-sky-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm text-sky-800">
                <strong>Important:</strong> After uploading your prescription, a pharmacist will review it and contact you with available medications and pricing. This may take 1-2 business days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
