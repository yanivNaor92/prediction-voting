"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket] = useState<Socket | null>(null);

  useEffect(() => {
    // Effect cleanup
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]); // Add socket to dependency array

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};