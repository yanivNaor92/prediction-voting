import { Server as NetServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as SocketIOServer } from 'socket.io';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const SocketHandler = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (res.socket.server.io) {
    console.log('Socket is already running');
    res.end();
    return;
  }

  console.log('Setting up socket');
  const io = new SocketIOServer(res.socket.server, {
    addTrailingSlash: false,
  });
  res.socket.server.io = io;

  io.on('connection', socket => {
    console.log('Client connected:', socket.id);

    socket.on('vote', (data) => {
      io.emit('vote-update', data);
    });

    socket.on('show-results', (data) => {
      io.emit('show-results-update', data);
    });

    socket.on('next-question', (index) => {
      io.emit('next-question-update', index);
    });

    socket.on('reset-session', (data) => {
      io.emit('reset-session-update', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  console.log('Socket is set up');
  res.end();
};

export default SocketHandler;