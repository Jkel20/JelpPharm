import React, { useState, useEffect } from 'react';

interface NetworkStatusProps {
  onNetworkChange?: (isOnline: boolean) => void;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({ onNetworkChange }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      onNetworkChange?.(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      onNetworkChange?.(false);
      
      // Hide offline message after 5 seconds
      setTimeout(() => setShowOfflineMessage(false), 5000);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [onNetworkChange]);

  // Don't render anything if online
  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {showOfflineMessage && (
        <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z" />
            </svg>
            <span className="font-medium">You're offline</span>
          </div>
          <p className="text-sm mt-1 opacity-90">
            Some features may not work properly. Please check your internet connection.
          </p>
        </div>
      )}
    </div>
  );
};

export default NetworkStatus;
