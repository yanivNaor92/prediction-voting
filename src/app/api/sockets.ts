import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { Socket } from 'net';

// Add custom type for the extended socket
interface SocketServer extends Socket {
  server: NetServer & {
    io?: SocketIOServer;
  };
}

// Add custom type for the extended response
interface ResponseWithSocket extends NextApiResponse {
  socket: SocketServer;
}

export default async function SocketHandler(
  req: Request,
  res: ResponseWithSocket
) {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server;
    res.socket.server.io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
    });

    res.socket.server.io.on('connection', (socket) => {
      console.log('Socket connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
      });
    });
  }
  
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};