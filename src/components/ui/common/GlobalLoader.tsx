'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function GlobalLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if the page is already fully loaded (e.g., on Refresh)
    if (document.readyState === 'complete') {
      setLoading(false);
    } else {
      // 2. Wait for all resources (images, styles, etc.) to load
      const handleLoad = () => {
        // Optional slight delay to ensure a smooth transition
        setTimeout(() => setLoading(false), 500);
      };

      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="relative w-20 h-20">
        {/* Spinning Ring */}
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-gray-200 border-t-[#d1922b]" />
        
        {/* Centered Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image 
            height={80} 
            width={80} 
            src='/images/mada_icon.svg' 
            alt="Logo" 
            className="w-12 h-12" 
            priority // Critical to ensure the loader logo itself appears immediately
          />
        </div>
      </div>
    </div>
  );
}