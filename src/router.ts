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

let router: Router = Router();
const routeExec = (routes: IKeyVal, method: Tmethod, middleware: string[]) => {
  routes[method].forEach((r: IRoute) => {
    let mds: any[] = [];
    let mInstance: any;
    middleware.map((m: string) => {
      try {
        mInstance = require(middlewarePath + "/" + m);
        mInstance = (mInstance.default || mInstance) as IMiddleware;
      } catch (error) {
        let message = "middleware " + m + " not found, check your router.json";
        Console.error(message);
        Log.fatal(message);
        setTimeout(() => {
          process.exit(1);
        }, 500);
      }
      mds.push((req: Request, res: Response, next: NextFunction) => {
        try {
          mInstance(req, res, next);
        } catch (err) {
          handleError(req, res, err);
        }
      });
    });
    try {
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
    } catch (err) {
      Log.fatal(err.stack);
      setTimeout(() => {
        process.exit(1);
      }, 500);
    }
  });
};

const routers = require(routePath);
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
export default router;
