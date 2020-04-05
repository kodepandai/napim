import { Request, Response, Router } from 'express'
import { servicePath, routePath } from './utils/path'
import { ApiService, ApiResponse } from './core/ServiceProvider'
import { IRoute, IRoutes, IService } from './utils/interface'

let router: Router = Router()
type Tmethod = 'post' | 'delete' | 'get' | 'put'
interface IRoutesKey {
    [key: string]: any
}

const routeExec = (routes: IRoutesKey, method: Tmethod, middleware: string[]) => {
    routes[method].forEach((r: IRoute) => {
        router[method](routes.prefix + r.path, (req: Request, res: Response) => {
            let service: IService
            try {
                service = require(servicePath + `/${method}` + r.service).default
            } catch (err) {
                return ApiResponse.error(req, res, 'Service Not Found', {}, 500, { type: "SERVICE_NOT_FOUND", detail: "service " + method + r.service + ' not found' })
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
    ApiResponse.error(req, res, "Service Not Found", {}, 404, {
        type: 'SERVICE_NOT_FOUND',
        detail: 'no service can handle this route, check router for detail'
    })
})
export default router