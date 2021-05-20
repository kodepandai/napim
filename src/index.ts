import dotenv from 'dotenv'
dotenv.config()
import polka, { Polka } from 'polka'
import router from "./router";
import Console from "./utils/console";
import Parser from 'body-parser'
const { json } = Parser
import * as ServiceProvider from "./core/ServiceProvider";
import * as Path from './utils/path'
const { Log, registerDb } = ServiceProvider
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
export type { IMiddleware, IErrorData, IGmInstance, IKeyVal, IRoute, IRoutes, IService, ReqExtended } from "./utils/interface";
const Napim = { app, start, router, ...ServiceProvider, ...Path }
export default Napim
