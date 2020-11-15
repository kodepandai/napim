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
  ReqExtended,
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
    let mds = [];
    let routeMiddleware = [];
    for (let i = 0; i < middleware.length; i++) {
      try {
        routeMiddleware.push(require(middlewarePath + "/" + middleware[i]))
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
    let localMiddleware = service.middleware || []
    let mergeMiddleware = [...routeMiddleware, ...localMiddleware]
    for (let i = 0; i < mergeMiddleware.length; i++) {
      let mInstance = mergeMiddleware[i].default || mergeMiddleware[i];
      mds[i] = async (req: ReqExtended, res: Response, next: NextFunction) => {
        try {
          if (!req.input) req.input = {}
          await mInstance(req, res, next);
        } catch (err) {
          handleError(req, res, err);
        }
      };
    }
    router[method](routes.prefix + r.path, [
      ...mds,
      async (req: ReqExtended, res: Response) => {
        try {
          await serviceExec(req, res, service);
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
    if (routes.patch) {
      routeExec(routes, "patch", routes.middleware);
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
