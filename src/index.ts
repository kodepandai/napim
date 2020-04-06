require('dotenv').config()
import http from 'http'
import Log from './utils/logger'
import express, { Application } from 'express';
import router from './router'
import * as Console from './utils/console'

//start napim server
const port: (string | number) = process.env.PORT || 3000
const start = (): void => {
    try {
        const app: Application = express()
        app.use(express.json());
        app.use('', router)
        const server: http.Server = http.createServer(app);
        server.listen(port);
        server.on('error', onError);
        server.on('listening', () => onListening(server));
    } catch (error) {
        Log.error(error.message)
    }
}

const onError = (error: any) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            Console.error(bind + ' requires elevated privileges');
            process.exit(1);
        case 'EADDRINUSE':
            Console.error(bind + ' is already in use');
            process.exit(1);
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = (server: http.Server) => {
    var addr: any = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    Console.success('Listening on ' + bind);
}

export { start }
export { Request, Response } from 'express'
export * from './core/ServiceProvider'
export * from './utils/interface'
export { Console }
