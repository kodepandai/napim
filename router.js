const express = require('express')
const router = express.Router()
const { servicePath, routePath } = require('./utils/path')
const { ApiService, ApiResponse, ApiException } = require('./core/ServiceProvider')

const routeExec = (routes, method, middleware) => {
    routes[method].forEach((r) => {
        router[method](routes.prefix + r.path, (req, res) => {
            let service = null
            try {
                service = require(servicePath + `/${method}` + r.service)
            } catch (err) {
                return ApiResponse.error(req, res, 'Service Not Found', {}, 500, { type: "SERVICE_NOT_FOUND", detail: "service " + method + r.service + ' not found' })
            }
            try {
                if (method != 'get') {
                    req.body = { ...req.body, ...req.params }
                } else {
                    req.query = { ...req.query, ...req.params }
                }
                return ApiService(service).run(res, req, method.toUpperCase(), middleware)
            } catch (err) {
                return ApiResponse.error(req, res, err.message)
            }
        })
    })
}

const routers = require(routePath)
routers.forEach((routes) => {
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

router.get('/', function (req, res) {
    res.status(200).send('Node API Maker running beautifully')
})
module.exports = router