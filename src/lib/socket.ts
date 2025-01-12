import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const connectSocket = async (): Promise<Socket> => {
  return new Promise((resolve) => {
    if (!socket) {
      socket = io();
      
      socket.on('connect', () => {
        console.log('Socket connected');
      });

      socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }

    resolve(socket);
  });
};