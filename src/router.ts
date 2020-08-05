import { Request, Response, Router, NextFunction } from "express";
import { routePath, servicePath, middlewarePath } from "./utils/path";
import {
  ApiResponse,
  serviceExec,
  Log,
  ApiException,
} from "./core/ServiceProvider";
import {
  IRoute,
  IRoutes,
  IKeyVal,
  IService,
  IMiddleware,
} from "./utils/interface";
import { Tmethod } from "./utils/types";
import * as Console from "./utils/console";
import { handleError, parseError } from "./utils/helper";

let _modules: any[] = []
/**
 * Inject Napim Module
 * @param modules list modules will be injected
 */
export const injectModule = (modules: any[]) => {
  _modules = modules
}
let router: Router = Router();
const routeExec = (routes: IKeyVal, method: Tmethod, middleware: string[]) => {
  routes[method].forEach((r: IRoute) => {
    let mds: any[] = [];
    for (let i = 0; i < middleware.length; i++) {
      try {
        let mInstance = require(middlewarePath + "/" + middleware[i]);

        mInstance = (mInstance.default || mInstance) as IMiddleware;
        mds[i] = async (req: Request, res: Response, next: NextFunction) => {
          try {
            await mInstance(req, res, next);
          } catch (err) {
            handleError(req, res, err);
          }
        };
      } catch (error) {
        let message =
          "middleware " + middleware[i] + " not found, check your router.json";
        Console.error(message);
        Log.fatal(message);
        setTimeout(() => {
          process.exit(1);
        }, 500);
      }
    }
    router[method](routes.prefix + r.path, [
      ...mds,
      async (req: Request, res: Response) => {
        let service: IService;
        try {
          let instance = require(servicePath + r.service);
          service = instance.default || instance;
        } catch (err) {
          throw new ApiException("Service Not Found", {}, 404, {
            type: "SERVICE_NOT_FOUND",
            detail: "service " + r.service + " not found",
          });
        }
        try {
          await serviceExec(req, res, method, service);
        } catch (err) {
          handleError(req, res, err);
        }
      },
    ]);
  });
};

const routers = require(routePath);

// inject modules
const createRouter = () => {
  _modules.length > 0 && Console.info('Injecting module...');
  Log.info(['injecting module', _modules])
  routers.forEach((routes: IRoutes) => {
    if (routes.get) {
      routeExec(routes, "get", routes.middleware);
    }
    if (routes.post) {
      routeExec(routes, "post", routes.middleware);
    }
    if (routes.put) {
      routeExec(routes, "put", routes.middleware);
    }
    if (routes.delete) {
      routeExec(routes, "delete", routes.middleware);
    }
  });

  router.get("/", function (req: Request, res: Response) {
    res.status(200).send("Node API Maker running beautifully");
  });

  router.all("*", function (req: Request, res: Response) {
    let err = new ApiException("Invalid route path", {}, 404, {
      type: "ROUTE_NOT_FOUND",
      detail: "no service can handle this route, check router for detail",
    });
    Log.error(parseError(req, err));
    ApiResponse.error(req, res, err);
  });
  return router
}
export { router, createRouter };
