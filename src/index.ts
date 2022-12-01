import dotenv from 'dotenv'
dotenv.config()
import polka, { Polka } from 'polka'
import router from "./router";
import Parser from 'body-parser'
const { json } = Parser
import {
  ApiCall,
  registerDb,
  handleError,
  parseError,
  send,
  ApiException,
  ApiResponse,
  ApiService,
  getDB,
  serviceExec,
  Console,
  Log,
  extendRule,
  addCustomMessages,
  extendMessages
} from "./core/ServiceProvider";
import { basePath, servicePath, logPath, routePath, middlewarePath } from './utils/path'
const port: string | number = process.env.PORT || 3000;
const app = polka();
/**
 * Start Node API Maker
 */
const start = (config: { db?: any, beforeStart?: any, listen?: boolean } = { db: null, beforeStart: () => { }, listen: true }): Polka['handler'] | Polka => {
  const listen = config.listen ?? true
  try {
    Console.info('Starting framework...')
    registerDb(config.db, config.beforeStart)
    app.use(json({ limit: process.env.MAX_JSON || '50mb' }))
    app.use(router);
    if (!listen) return app.handler
    return app.listen(port, () => onListening(port));
  } catch (error) {
    console.log(error)
    if (typeof error == 'string') {
      Console.error(error)
    }
    Log.fatal(error)
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
export { app, start, router }
export {
  ApiCall,
  registerDb,
  handleError,
  parseError,
  send,
  ApiException,
  ApiResponse,
  ApiService,
  getDB,
  serviceExec,
  Console,
  Log,
  extendRule,
  addCustomMessages,
  extendMessages
}
export { basePath, servicePath, logPath, routePath, middlewarePath }
