"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { connectSocket } from '@/lib/socket';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const initSocket = async () => {
      try {
        const socketInstance = await connectSocket();
        setSocket(socketInstance);
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context.socket;
};