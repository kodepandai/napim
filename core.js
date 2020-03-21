require('dotenv').config()
const path = require('./utils/path')


const express = require('express');
const router = require('./router')
const app = express()
const { CallService, CoreService } = require('./core/ServiceProvider')
app.use(express.json());
app.use('', router)
const server = require('http').createServer(app);
const port = process.env.PORT || 3000
server.listen(port, '0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.debug('Listening on ' + bind);
}
