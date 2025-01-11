import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function SocketHandler(req: any, res: NextApiResponse) {
    if (!res.socket.server.io) {
        const httpServer: NetServer = res.socket.server as any;
        res.socket.server.io = new SocketIOServer(httpServer, {
            path: '/api/socketio',
            addTrailingSlash: false,
        });
    }
    res.end();
}