import path from 'path'

const basePath: string = path.resolve(process.cwd())
const servicePath: string = basePath + (process.env.SERVICE_PATH || '/services')
const routePath: string = basePath + (process.env.ROUTER || '/router.json')
const logPath: string = basePath + (process.env.LOG_PATH || '/log')
const middlewarePath: string = basePath + (process.env.MIDDLEWARE_PATH || '/middleware')

export { basePath, servicePath, logPath, routePath, middlewarePath }