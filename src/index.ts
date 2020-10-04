require("dotenv").config();
import http from "http";
import Log from "./utils/logger";
import express, { Application } from "express";
import { createRouter, router, injectModule } from "./router";
import * as Console from "./utils/console";

const port: string | number = process.env.PORT || 3000;
const app: Application = express();
/**
 * Start Node API Maker
 */
const start = (): void => {
  try {
    Console.info('Starting framework...')
    app.use(express.json());
    app.use("", createRouter());
    const server: http.Server = http.createServer(app);
    server.listen(port);
    server.on("error", onError);
    server.on("listening", () => onListening(server));
  } catch (error) {
    Log.fatal(error);
    process.exit(1);
  }
};

const onError = (error: any) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      Console.error(bind + " requires elevated privileges");
      process.exit(1);
    case "EADDRINUSE":
      Console.error(bind + " is already in use");
      process.exit(1);
    default:
      throw error;
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = (server: http.Server) => {
  var addr: any = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  Console.success("Listening on " + bind);
};

export { app, start, injectModule, express, router };
export { Request, Response } from "express";
export * from "./core/ServiceProvider";
export * from "./utils/interface";
export * from './utils/path'
