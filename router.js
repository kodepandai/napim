const express = require('express')
const router = express.Router()
const { servicePath, routePath } = require('./utils/path')
const { ApiService, ApiResponse } = require('./core/ServiceProvider')

const routeExec = (routes, method) => {
    routes[method].forEach((r) => {
        router[method](routes.prefix + r.path, (req, res) => {
            try {
                const service = require(servicePath + `/${method}` + r.service)
                if (method != 'get') {
                    req.body = { ...req.body, ...req.params }
                } else {
                    req.query = { ...req.query, ...req.params }
                }
                return ApiService(service).run(res, req, method.toUpperCase())
            } catch (error) {
                return ApiResponse.error(req, res, 'Service Not Found', {}, 500, "SERVICE_NOT_FOUND", "service " + r.service + ' not found')
            }
        })
    })
}

const routers = require(routePath)
routers.forEach((routes) => {
    if (routes.get) {
        routeExec(routes, 'get')
    }
    if (routes.post) {
        routeExec(routes, 'post')
    }
    if (routes.put) {
        routeExec(routes, 'put')
    }
    if (routes.delete) {
        routeExec(routes, 'delete')
    }
})

router.get('/', function (req, res) {
    res.status(200).send('Node API Maker running beautifully')
})
module.exports = router