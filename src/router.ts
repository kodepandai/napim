import polka, { Next as NextFunction } from 'polka'

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
  IService,
  IMiddleware,
} from "./utils/interface";
import { Tmethod } from "./utils/types";
import * as Console from "./utils/console";
import { handleError, send } from "./utils/helper";
import { ServerResponse as Response } from 'http';

let router = polka()

const routers = require(routePath);

const runServices = (routes: IRoutes, method: Tmethod) => {
  routes[method]?.forEach((r: IRoute) => {
    let service: IService;
    try {
      const instance = require(servicePath + r.service);
      service = instance.default || instance;
    } catch (err) {
      throw new ApiException("Service Not Found", {}, 404, {
        type: "SERVICE_NOT_FOUND",
        detail: "service " + r.service + " not found",
      });
    }

    let localMiddleware = []
    for (let i = 0; i < (service.middleware || []).length; i++) {
      let mInstance = (service.middleware || [])[i].default || (service.middleware || [])[i];
      localMiddleware[i] = async (req: any, res: Response, next: NextFunction) => {
        try {
          if (!req.input) req.input = {}
          await mInstance(req, res, next);
        } catch (err) {
          handleError(req, res, err);
        }
      };
    }
    router[method](
      routes.prefix + r.path,
      ...localMiddleware,
      async (req: any, res: Response) => {
        try {
          await serviceExec(req, res, service);
        } catch (err) {
          handleError(req, res, err);
        }
      }
    )
  })
}

routers.forEach((routes: IRoutes) => {
  let routeMiddleware = [];
  for (let i = 0; i < routes.middleware.length; i++) {
    let mInstance: IMiddleware
    try {
      const midd = require(middlewarePath + "/" + routes.middleware[i])
      mInstance = midd.default || midd
    } catch (error) {
      let message =
        "middleware " + routes.middleware[i] + " not found, check your router.json";
      Console.error(message);
      Log.fatal(message);
      setTimeout(() => {
        process.exit(1);
      }, 500);
    }
    routeMiddleware[i] = async (req: any, res: Response, next: NextFunction) => {
      try {
        if (!req.input) req.input = {}
        await mInstance(req, res, next);
      } catch (err) {
        handleError(req, res, err);
      }
    }
  }
  router.use(routes.prefix, ...routeMiddleware)
  if (routes.post) runServices(routes, 'post')
  if (routes.get) runServices(routes, 'get')
  if (routes.patch) runServices(routes, 'patch')
  if (routes.put) runServices(routes, 'put')
  if (routes.delete) runServices(routes, 'delete')
})

router.get("/", function (req, res) {
  send(res, 200, "Node API Maker running beautifully");
});

router.all("*", (req: any, res) => {
  let err = new ApiException("Invalid route path", {}, 404, {
    type: "ROUTE_NOT_FOUND",
    detail: "no service can handle this route, check router for detail",
  });

  ApiResponse.error(req, res, err);
})

export { router }