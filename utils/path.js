const path = require('path')
const basePath = path.resolve(process.cwd())
const servicePath = basePath + (process.env.SERVICE_PATH || '/services')
const routePath = basePath + (process.env.ROUTER || '/router.json')
const logPath = basePath + (process.env.LOG_PATH || '/log')
const middlewarePath = basePath + (process.env.MIDDLEWARE_PATH || '/middleware')

module.exports = { basePath, servicePath, logPath, routePath, middlewarePath }