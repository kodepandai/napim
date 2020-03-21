const path = require('path')
const basePath = path.resolve(process.cwd())
const servicePath = basePath + (process.env.SERVICE_PATH || '/services')

module.exports = { basePath, servicePath }