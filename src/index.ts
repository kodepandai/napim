require("dotenv").config();
import Log from "./utils/logger";
import polka, { IError, NextHandler, Polka, Request, Response } from 'polka'
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
  const listen = config.listen || true
  try {
    Console.info('Starting framework...')
    registerDb(config.db, config.beforeStart)
    app.use(json())
    app.use("", router);
    if (!listen) return app.handler
    return app.listen(port, () => onListening(port));
  } catch (error) {
    if (typeof error != 'string') {
      Log.fatal(error)
    } else {
      Console.error(error)
    }
    process.exit(1)
  }
};

/**
 * Event listener for HTTP server "listening" event.
 */

const onListening = (port: string | number) => {
  Console.success("Listening on " + port);
};

export { app, start, router };
export * from "./core/ServiceProvider";
export * from "./utils/interface";
export * from './utils/path'
