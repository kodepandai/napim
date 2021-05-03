require("dotenv").config();
import Log from "./utils/logger";
import polka, { Polka } from 'polka'
import { router } from "./router";
import * as Console from "./utils/console";
import { json } from 'body-parser'
import { registerDb } from "./core/ServiceProvider";

const port: string | number = process.env.PORT || 3000;

const app = polka();
/**
 * Start Node API Maker
 */
const start = (config: { db?: any, beforeStart?: any, listen?:boolean} = { db: null, beforeStart: () => { }, listen:true}):Polka['handler']|Polka => {
  try {
    Console.info('Starting framework...')
    registerDb(config.db, config.beforeStart)
    app.use(json())
    app.use("", router);
    if (!config.listen) return app.handler
    return app.listen(port, (err: Error) => onListening(port, err));
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
