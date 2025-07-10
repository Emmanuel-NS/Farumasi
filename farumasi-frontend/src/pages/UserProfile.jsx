import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export default function UserProfile() {
  const { user, updateLocation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [formData, setFormData] = useState({
    latitude: '',
    longitude: '',
    country: '',
    province: '',
    district: '',
    sector: '',
    village: ''
  });

  useEffect(() => {
    if (user?.location) {
      setFormData({
        latitude: user.location.coordinate?.latitude || '',
        longitude: user.location.coordinate?.longitude || '',
        country: user.location.country || '',
        province: user.location.province || '',
        district: user.location.district || '',
        sector: user.location.sector || '',
        village: user.location.village || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setError('');
    setSuccess('');
    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Location obtained:', position.coords);
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setSuccess('Location obtained successfully! You can now update your profile.');
        setGettingLocation(false);
      },
      (error) => {
        console.error('Geolocation error:', error);
        let errorMessage = 'Unable to get current location. ';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += 'Location access denied. Please enable location permissions in your browser settings and try again.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += 'Location information unavailable. Please check that your GPS/location services are enabled.';
            break;
          case error.TIMEOUT:
            errorMessage += 'Location request timed out. Please try again or enter coordinates manually.';
            break;
          default:
            errorMessage += 'An unknown error occurred while getting location.';
            break;
        }
        
        setError(errorMessage);
        setGettingLocation(false);
        
        // Reset the form fields if they were showing loading state
        setFormData(prev => ({
          ...prev,
          latitude: user?.location?.coordinate?.latitude || '',
          longitude: user?.location?.coordinate?.longitude || ''
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 60000 // 1 minute
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!formData.latitude || !formData.longitude) {
      setError('Latitude and longitude are required');
      setLoading(false);
      return;
    }

    const locationData = {
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      country: formData.country,
      province: formData.province,
      district: formData.district,
      sector: formData.sector,
      village: formData.village
    };

    const result = await updateLocation(locationData);
    
    if (result.success) {
      setSuccess('Location updated successfully!');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
        </div>
        
        <div className="px-6 py-4">
          {/* User Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                {user?.name}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                {user?.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                {user?.role}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Insurance Providers</label>
              <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                {user?.insurance_providers?.length > 0 
                  ? user.insurance_providers.join(', ') 
                  : 'None'}
              </div>
            </div>
          </div>

          {/* Location Update Form */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Location</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">
                  Coordinates
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  className="flex items-center text-sm text-green-600 hover:text-green-500 disabled:text-gray-400 disabled:cursor-not-allowed"
                  disabled={loading || gettingLocation}
                >
                  {gettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-1"></div>
                      Getting location...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Use current location
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="latitude" className="block text-sm font-medium text-gray-700">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    required
                    value={formData.latitude}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="longitude" className="block text-sm font-medium text-gray-700">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    required
                    value={formData.longitude}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-gray-700">
                    Province
                  </label>
                  <input
                    type="text"
                    id="province"
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <input
                    type="text"
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                    Sector
                  </label>
                  <input
                    type="text"
                    id="sector"
                    name="sector"
                    value={formData.sector}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="village" className="block text-sm font-medium text-gray-700">
                    Village
                  </label>
                  <input
                    type="text"
                    id="village"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Location'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
