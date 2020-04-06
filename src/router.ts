import { Request, Response, Router } from 'express'
import { servicePath, routePath } from './utils/path'
import { ApiService, ApiResponse } from './core/ServiceProvider'
import { IRoute, IRoutes, IService, IKeyVal } from './utils/interface'
import { Tmethod } from './utils/types'

let router: Router = Router()

const routeExec = (routes: IKeyVal, method: Tmethod, middleware: string[]) => {
    routes[method].forEach((r: IRoute) => {
        router[method](routes.prefix + r.path, (req: Request, res: Response) => {
            let service: IService
            try {
                let instance = require(servicePath + r.service)
                service = instance.default || instance
            } catch (err) {
                return ApiResponse.error(req, res, 'Service Not Found', {}, 404, { type: "SERVICE_NOT_FOUND", detail: "service " + r.service + ' not found' })
            }
            if (service.method) {
                if (!service.method.includes(method)) {
                    return ApiResponse.error(req, res, 'Method not allowed', {}, 405, { detail: "allowed method:  " + service.method.join(', '), type: "METHOD_NOT_ALLOWED" })
                }
            }
            try {
                if (method != 'get') {
                    req.body = { ...req.body, ...req.params }
                } else {
                    req.query = { ...req.query, ...req.params }
                }
                return ApiService(service).run(req, res, method, middleware)
            } catch (err) {
                return ApiResponse.error(req, res, err.message)
            }
        })
    })
}

const routers = require(routePath)
routers.forEach((routes: IRoutes) => {
    if (routes.get) {
        routeExec(routes, 'get', routes.middleware)
    }
    if (routes.post) {
        routeExec(routes, 'post', routes.middleware)
    }
    if (routes.put) {
        routeExec(routes, 'put', routes.middleware)
    }
    if (routes.delete) {
        routeExec(routes, 'delete', routes.middleware)
    }
})

router.get('/', function (req: Request, res: Response) {
    res.status(200).send('Node API Maker running beautifully')
})

router.all('*', function (req: Request, res: Response) {
    ApiResponse.error(req, res, "Invalid route path", {}, 404, {
        type: 'ROUTE_NOT_FOUND',
        detail: 'no service can handle this route, check router for detail'
    })
})
export default router