"use client";

import { useEffect, useState } from 'react';

interface PWAManagerProps {
  children: React.ReactNode;
}

export default function PWAManager({ children }: PWAManagerProps) {
  // PWA and Notifications explicitly disabled by user request
  // No files will be downloaded to client's device, no popups will show up.
  useEffect(() => {
    // Unregister any existing service workers to clean up
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    }
  }, []);

  return (
    <>
      {children}
    </>
  );
}