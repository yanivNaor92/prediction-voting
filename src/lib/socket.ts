import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    try {
      if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', {
          path: '/api/socketio',
          addTrailingSlash: false,
          transports: ['websocket', 'polling'],
          reconnectionDelayMax: 10000,
          reconnectionAttempts: 10
        });

        socket.on('connect', () => {
          console.log('Socket connected successfully:', socket?.id);
          resolve(socket!);
        });

        socket.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          reject(error);
        });

        socket.on('disconnect', (reason) => {
          console.log('Socket disconnected:', reason);
        });

        socket.on('error', (error) => {
          console.error('Socket error:', error);
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