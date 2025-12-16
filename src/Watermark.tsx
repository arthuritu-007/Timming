import React from 'react';
import { useAuth } from './context/AuthContext';

export const Watermark = () => {
  const { user } = useAuth();
  
  if (!user?.email) return null;

  // Create a pattern of the user's email
  const watermarkText = `${user.email} - ${new Date().toLocaleDateString()}`;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden opacity-[0.03] select-none flex flex-wrap content-start justify-start gap-16 p-8"
         style={{ transform: 'rotate(-15deg) scale(1.2)' }}>
      {Array.from({ length: 100 }).map((_, i) => (
        <div key={i} className="text-white font-bold text-xl whitespace-nowrap">
          {watermarkText}
        </div>
      ))}
    </div>
  );
};
