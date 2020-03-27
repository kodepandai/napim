require('dotenv').config()
const log = require('./utils/logger')
const express = require('express');
const router = require('./router')
const ServiceProvider = require('./core/ServiceProvider')

//start napim server
const start = () => {
    try {
        const app = express()
        app.use(express.json());
        app.use('', router)
        const server = require('http').createServer(app);
        const port = process.env.PORT || 3000
        server.listen(port, '0.0.0.0');
        server.on('error', onError);
        server.on('listening', () => onListening(server));
    } catch (error) {
        log.error(error.message)
    }
}

const onError = (error) => {
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

const onListening = (server) => {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.debug('Listening on ' + bind);
}

module.exports = { ...ServiceProvider, start }