require("dotenv").config();
import Log from "./utils/logger";
import polka from 'polka'
import { router } from "./router";
import * as Console from "./utils/console";
import { json } from 'body-parser'

const port: string | number = process.env.PORT || 3000;

const app = polka();
/**
 * Start Node API Maker
 */
const start = () => {
  try {
    Console.info('Starting framework...')
    app.use(json())
    app.use("", router);
    if (process.env.SERVERLESS == 'true') return app.handler
    app.listen(port, (err: Error) => onListening(port, err));
  } catch (error) {
    Log.fatal(error);
    process.exit(1);
  }
};



/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = (port: string | number, error: any) => {
  if (error) {
    switch (error.code) {
      case "EACCES":
        Console.error(port + " requires elevated privileges");
        process.exit(1);
      case "EADDRINUSE":
        Console.error(port + " is already in use");
        process.exit(1);
      default:
        throw error;
    }
  }
  Console.success("Listening on " + port);
};

export { app, start, router };
export * from "./core/ServiceProvider";
export * from "./utils/interface";
export * from './utils/path'
