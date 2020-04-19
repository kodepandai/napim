import path from 'path'
import Log from '../utils/logger'
import { middlewarePath } from '../utils/path'
import { Validator } from 'node-input-validator'
import Knex from 'knex'
import { Response, Request } from 'express'
import { IService, IErrorData, IGmInstance } from '../utils/interface'
import { Tmethod } from '../utils/types'
import * as Console from '../utils/console'
let knexFile: any
try {
    knexFile = require(path.resolve(process.cwd(), 'knexfile.js'))
} catch (error) {
    Console.error('missing knexfile.js, run npx knex init to create it!')
    process.exit(1)
}
if (!Object.keys(knexFile).includes(process.env.DB_ENV || 'development')) {
    Console.error('invalid DB_ENV, available environment: ' + Object.keys(knexFile))
    process.exit(1)

}
const db = Knex(knexFile[process.env.DB_ENV || 'development']);
/**
 * create Exception Instance that will be thrown to client response
 */
class ApiException {
    errorMessage: string
    errorList: object | any[]
    errorCode: number
    errorData: IErrorData
    constructor(errorMessage = "", errorList = {}, errorCode = 500, errorData = { type: 'SERVER_ERROR', detail: "something wrong, check server log for more detail" }) {
        this.errorMessage = errorMessage;
        this.errorList = errorList;
        this.errorCode = errorCode;
        this.errorData = errorData
    }
}
/**
 * executing service without middleware, can be used for communicate between services
 */
const ApiCall = async (service: IService, input: any, trx: Knex.Transaction | Knex = db) => {

    try {
        const validator = new Validator(input, service.rules, service.customMessages || undefined);

        const valid = await validator.check();
        if (!valid) {
            throw new ApiException("", validator.errors, 422, {
                type: 'INVALID_REQUEST',
                detail: 'Unprocessable Entity'
            });
        }
        var inputNew = await service.prepare(input, trx);
        const inputProcess = (inputNew == null) ? input : inputNew;
        const result = await service.process(inputProcess, input, trx);
        return result
    } catch (err) {
        throw err
    }
}
/**
 * Create Http Response API
 */
var ApiResponse = {
    /**
     * response json success
     */
    success: (res: Response, data: object, code: number = 200) => {
        if (code >= 300) {
            throw new ApiException('invalid http code', {}, 500, { type: 'INVALID_HTTP_CODE', detail: 'you must return valid http code for success response, returned code from service is: ' + code })
        }
        return res.status(code).json(data);
    },
    /**
    * response json error
    */
    error: (req: Request, res: Response, errorMessage: string = "", errorList: object | any[] = {}, statusCode: number = 500, data: IErrorData = { type: 'SERVER_ERROR', detail: "something wrong" }) => {
        if (statusCode < 300) {
            throw new ApiException('invalid http code', {}, 500, { type: 'INVALID_HTTP_CODE', detail: 'you must return valid http code for error response, returned code from service is: ' + statusCode })
        }
        var result = {
            code: statusCode,
            message: errorMessage != "" ? errorMessage : "",
            ...data,
            errors: errorList,
            path: req.method + ':' + req.path
        }
        if (statusCode >= 500) {
            Log.error({ ...result }) //clone result sebelum dirubah
            if (process.env.DEBUG == 'false') {
                result.message = "Server Error"
                result.type = "SERVER_ERROR"
                result.detail = "something wrong"
            }
        }

        return res.status(statusCode).json(result);
    }
}
/**
 * Executing service
 */
const ApiExec = async (service: IService, input: any, req: Request, res: Response) => {
    try {
        if (service.transaction === true) {
            await db.transaction(async (trx: Knex.Transaction) => {
                const result = await ApiCall(service, input, trx)
                return ApiResponse.success(res, result, result ? (result.code || 200) : 200)
            })
        } else {
            const result = await ApiCall(service, input)
            return ApiResponse.success(res, result, result ? (result.code || 200) : 200)
        }
    } catch (err) {
        if (err instanceof ApiException) {
            return ApiResponse.error(req, res, err.errorMessage, err.errorList, err.errorCode, err.errorData);
        } else {
            //error dari server
            return ApiResponse.error(req, res, err.message);
        }
    }
}

const ApiService = (service: IService) => ({
    /** run service with middleware applied */
    run: async (req: Request, res: Response, method: Tmethod = 'get', globalMiddleware: string[] = []) => {
        let inputData = method == 'get' ? req.query : req.body

        // Global Middleware 
        try {
            var gmInstance = await beforeMiddlewareExec(req, service, inputData, globalMiddleware)
            await ApiExec(service, inputData, req, res);
            afterMiddlewareExec(req, service, inputData, gmInstance)
        } catch (err) {
            return ApiResponse.error(req, res, err.errorMessage, err.errorList, err.errorCode, err.errorData);
        }

    }
})

/** execute before middleware */
const beforeMiddlewareExec = async (req: Request, service: IService, inputData: any, globalMiddleware: any[]) => {
    let gmInstance: IGmInstance[] = []
    for (let i = 0; i < globalMiddleware.length; i++) {
        let gmName = globalMiddleware[i]
        try {
            let instance = require(middlewarePath + '/' + gmName)
            var gm = instance.default || instance
            gmInstance.push({ name: gmName, instance: gm })
        } catch (err) {
            throw new ApiException("Middleware not found", {
                middleware_path: middlewarePath + '/' + gmName
            }, 500, { type: "MIDDLEWARE_NOT_FOUND", detail: "module middleware with name " + gmName + " not found" })
        }
        try {
            await gm.before(req, service, inputData, (newInput: any) => {
                inputData = newInput
            })
        } catch (err) {
            if (err instanceof ApiException) {
                throw err
            }
            throw new ApiException(err.message, { middleware_path: middlewarePath + '/' + gmName }, 500, { detail: 'error when executing before middleware', type: 'MIDDLEWARE_BEFORE_FAIL' })
        }
    }
    return gmInstance
}

/** execute after middleware */
const afterMiddlewareExec = (req: Request, service: IService, inputData: any, gmInstance: IGmInstance[]) => {
    gmInstance.forEach(({ instance }) => {
        try {
            instance.after(req, service, inputData)
        } catch (err) {
            if (err instanceof ApiException) {
                return Log.error(err)
            }
            return Log.error({
                code: 500,
                type: 'MIDDLEWARE_AFTER_FAIL',
                detail: "error when executing after middleware",
                errors: {},
                path: req.path
            })

        }
    })
}
export { ApiCall, ApiException, ApiResponse, ApiService, db }