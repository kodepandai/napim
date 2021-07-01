import dotenv from 'dotenv'
dotenv.config()
import path from 'path'

const basePath: string = path.resolve(process.cwd())
const servicePath: string = path.resolve(basePath, (process.env.SERVICE_PATH || 'service'))
const routePath: string = path.resolve(basePath, (process.env.ROUTER || 'router.json'))
const logPath: string = path.resolve(basePath, (process.env.LOG_PATH || 'log'))
const middlewarePath: string = path.resolve(basePath, (process.env.MIDDLEWARE_PATH || 'middleware'))
export { basePath, servicePath, logPath, routePath, middlewarePath }