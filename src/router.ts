import polka, { NextHandler } from 'polka'

import Path from "./utils/path";
const { routePath, servicePath, middlewarePath } = Path
import {
  ApiResponse,
  serviceExec,
  Log,
  ApiException
} from "./core/ServiceProvider";
import type {
  IRoute,
  IRoutes,
  IService,
  IMiddleware,
} from "./utils/interface";
import type { Tmethod } from "./utils/types";
import Console from "./utils/console";
import * as Helper from "./utils/helper";
const { handleError, send } = Helper
import { ServerResponse as Response } from 'http';
import fs from 'fs'
let router = polka()

const routers = eval(fs.readFileSync(routePath, { encoding: 'utf-8' }))

const runServices = (routes: IRoutes, method: Tmethod, routeMiddleware: IMiddleware[]) => {
  routes[method]?.forEach(async (r: IRoute) => {
    let service: IService;
    try {
      const instance = await import(servicePath + r.service);

      service = instance.default || instance;
    } catch (err) {
      throw new ApiException("Service Not Found", 404, {
        type: "SERVICE_NOT_FOUND",
        detail: "service " + r.service + " not found",
      });
    }

    let localMiddleware: IMiddleware[] = [];
    (service.middleware || []).forEach((m, i) => {
      let mInstance = m.default || m;
      localMiddleware[i] = async (req: any, res: Response, next: NextHandler) => {
        try {
          if (!req.input) req.input = {}
          await mInstance(req, res, next);
        } catch (err) {
          handleError(req, res, err);
        }
      };
    })
    router[method](
      routes.prefix + r.path,
      async (req, res: Response, next: NextHandler) => {
        req.path = routes.prefix + r.path
        delete req.params.wild
        next()
      },
      ...routeMiddleware as [],
      ...localMiddleware as [],
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
  let routeMiddleware: IMiddleware[] = [];
  routes.middleware.forEach(async (m, i) => {
    let mInstance: IMiddleware
    try {
      const midd = await import(middlewarePath + "/" + m)
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
    routeMiddleware[i] = async (req: any, res: Response, next: NextHandler) => {
      try {
        if (!req.input) req.input = {}
        await mInstance(req, res, next);
      } catch (err) {
        handleError(req, res, err);
      }
    }
  })
  if (routes.post) runServices(routes, 'post', routeMiddleware)
  if (routes.get) runServices(routes, 'get', routeMiddleware)
  if (routes.patch) runServices(routes, 'patch', routeMiddleware)
  if (routes.put) runServices(routes, 'put', routeMiddleware)
  if (routes.delete) runServices(routes, 'delete', routeMiddleware)
})

router.get("/", function (req, res) {
  send(res, 200, "Node API Maker running beautifully");
});

router.all("*", (req: any, res) => {
  let err = new ApiException("Invalid route path", 404, {
    type: "ROUTE_NOT_FOUND",
    detail: "no service can handle this route, check router for detail",
  });

  ApiResponse.error(req, res, err);
})

export default router