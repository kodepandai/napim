import polka, { NextHandler } from 'polka'

import { routePath, servicePath, middlewarePath } from "./utils/path";
import {
  serviceExec,
  Log,
  ApiException,
  ApiResponse,
  handleError,
  send
} from "./core/ServiceProvider";
import type {
  IRoutes,
  IService,
  IMiddleware,
} from "./utils/interface";
import type { Tmethod } from "./utils/types";
import Console from "./utils/console";
import { ServerResponse as Response } from 'http';
let router = polka()

import(routePath).then(async (val) => {
  const Routes = val.default || val
  await Promise.all(Routes.map(async (routes: IRoutes) => {
    let routeMiddleware: IMiddleware[] = [];
    for (const m of routes.middleware) {
      let mInstance: IMiddleware
      try {
        const midd = await import(middlewarePath + "/" + m)
        mInstance = midd.default || midd
      } catch (error) {
        let message =
          "middleware " + m + " not found, check your router.json";
        Console.error(message);
        Log.fatal(message);
        setTimeout(() => {
          process.exit(1);
        }, 500);
      }
      routeMiddleware.push(async (req: any, res: Response, next: NextHandler) => {
        try {
          if (!req.input) req.input = {}
          await mInstance(req, res, next);
        } catch (err) {
          handleError(req, res, err);
        }
      })
    }
    await runServices(routes, routeMiddleware)
  }))
  router.all('*', (req, res, next) => {
    const err = new ApiException("Invalid route path", 404, {
      type: "ROUTE_NOT_FOUND",
      detail: "no service can handle this route, check router for detail",
    });
    return ApiResponse.error(req, res, err);
  })
})

const runServices = async (routes: IRoutes, routeMiddleware: IMiddleware[]) => {
  await Promise.all(
    (["post", "get", "patch", "put", "delete"] as Tmethod[]).map(async method => {
      await Promise.all(
        (routes[method] || []).map(async (r) => {
          let service: IService;
          let localMiddleware: IMiddleware[] = [];
          try {
            const instance = await import(servicePath + r.service);
            service = instance.default || instance;
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
          } catch (err) {
            Log.fatal(err)
          }
        })
      )
    })
  )

}

router.get("/", function (req, res) {
  send(res, 200, "Node API Maker running beautifully");
});

export default router