const express = require('express')
const router = express.Router()
const { servicePath } = require('./utils/path')
const { CoreService, CoreResponse } = require('./core/ServiceProvider')

router.get('/api/v1/:module/:service_name', async function (req, res) {
    try {
        const service = require(servicePath + '/' + req.params.module + '/' + req.params.service_name)
        return CoreService(service).run(res, req, 'GET')
    } catch (error) {
        return CoreResponse.error(res, 'Service Not Found', {}, 404)
    }
})
router.post('/api/v1/:module/:service_name', async function (req, res) {

    try {
        const service = require(servicePath + '/' + req.params.module + '/' + req.params.service_name)
        return CoreService(service).run(res, req, 'POST')
    } catch (error) {
        return CoreResponse.error(res, 'Service Not Found', {}, 404)
    }
})
router.get('/', function (req, res) {
    res.status(200).send('Core API running beautifully')
})
module.exports = router