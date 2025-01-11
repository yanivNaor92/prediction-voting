"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    try {
      if (!socket) {
        socket = io('http://localhost:3000', {
          transports: ['websocket'],
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          autoConnect: true,
        });

        socket.on('connect', () => {
          console.log('Socket connected successfully');
          resolve(socket!);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });
      } else {
        resolve(socket);
      }
    } catch (error) {
      console.error('Socket initialization error:', error);
      reject(error);
    }
  });
};