import { Server as SocketServer } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { Socket as NetSocket } from 'net';

interface SocketServer extends HTTPServer {
  io?: SocketServer | undefined;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
  } else {
    console.log('Socket is initializing');
    const io = new SocketServer(res.socket.server as any);
    res.socket.server.io = io;
  }
  res.end();
};

export default SocketHandler;