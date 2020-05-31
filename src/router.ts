import { Request, Response, Router } from "express";
import { routePath, servicePath, middlewarePath } from "./utils/path";
import { ApiResponse, serviceExec } from "./core/ServiceProvider";
import {
  IRoute,
  IRoutes,
  IKeyVal,
  IService,
  IMiddleware,
} from "./utils/interface";
import { Tmethod } from "./utils/types";
import * as Console from "./utils/console";

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
        Console.error("middleware " + m + " not found");
      }
      mds.push(mInstance);
    });
    router[method](routes.prefix + r.path, [
      ...mds,
      (req: Request, res: Response) => {
        let service: IService;
        try {
          let instance = require(servicePath + r.service);
          service = instance.default || instance;
        } catch (err) {
          return ApiResponse.error(req, res, "Service Not Found", {}, 404, {
            type: "SERVICE_NOT_FOUND",
            detail: "service " + r.service + " not found",
          });
        }
        serviceExec(req, res, method, service);
      },
    ]);
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
  ApiResponse.error(req, res, "Invalid route path", {}, 404, {
    type: "ROUTE_NOT_FOUND",
    detail: "no service can handle this route, check router for detail",
  });
});
export default router;
