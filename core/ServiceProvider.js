const jwt = require('jsonwebtoken')
const Log = require('../utils/logger')
const { middlewarePath } = require('../utils/path')
const { Validator } = require('node-input-validator')
const Knex = require('knex')
const db = Knex({
    client: 'mysql',
    debug: true,
    connection: {
        database: 'napim',
        user: 'root',
        password: 'evtf78ds'
    },
    pool: {
        min: 2,
        max: 10
    }
});
class ApiException {
    /**
     * create Exception Instance that will be thrown to client response
     * @param {String} errorMessage 
     * @param {Object} errorList 
     * @param {Number} errorCode 
     * @param {Object} errorData 
     */
    constructor(errorMessage = "", errorList = {}, errorCode = 500, errorData = { type: 'SERVER_ERROR', detail: "something wrong, check server log for more detail" }) {
        this.errorMessage = errorMessage;
        this.errorList = errorList;
        this.errorCode = errorCode;
        this.errorData = errorData
    }
}
/**
 * executing service without middleware, can be used for communicate between services
 * @param {Object} service 
 * @param {*} input 
 * @param {*} trx 
 */
const ApiCall = async (service, input, trx = null) => {

    try {
        const validator = new Validator(input, service.rules);

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
 * @method success
 * @method error
 */
var ApiResponse = {
    /**
     * @param {Object} res
     * @param {Object} data
     */
    success: (res, data) => {
        var body = data
        var statusCode = 200;
        return res.status(statusCode).json(body);
    },
    /**
    * @param {Object} req
    * @param {Object} res
    * @param {String} errorMessage
    * @param {Object} errorList
    * @param {Number} errorCode
    * @param {Object} data
    */
    error: (req, res, errorMessage = "", errorList = {}, statusCode = 500, data = { type: 'SERVER_ERROR', detail: "something wrong" }) => {
        var result = {
            code: statusCode,
            type: data.type
        }
        if (errorMessage !== "") {
            result.message = errorMessage
        }
        result = {
            ...result,
            ...data
        }
        if (errorList !== []) {
            result.errors = errorList
        }
        result.path = req.method + ':' + req.path
        if (statusCode >= 500) {
            Log.error({ ...result }) //clone result sebelum dirubah
            if (process.env.DEBUG == 'false') {
                result.message = "Server Error"
                result.type = "SERVER_ERROR"
                result.detail = "something wrong"
                result.errors = {}
            }
        }

        return res.status(statusCode).json(result);
    }
}
/**
 * Executing service
 * @param {Object} service 
 * @param {*} input 
 * @param {Object} req 
 * @param {Object} res 
 */
const ApiExec = async (service, input, req, res) => {
    try {
        if (service.transaction === true) {
            await db.transaction(async trx => {
                const result = await ApiCall(service, input, trx)
                return ApiResponse.success(res, result)
            })
        } else {
            const result = await ApiCall(service, input)
            return ApiResponse.success(res, result)
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

const ApiService = (service) => ({
    run: async (req = {}, res, method = 'GET', globalMiddleware = []) => {
        let inputData = method == 'GET' ? req.query : req.body

        // Global Middleware 
        try {
            var gmInstance = beforeMiddlewareExec(req, service, inputData, globalMiddleware)
            await ApiExec(service, inputData, req, res);
            afterMiddlewareExec(req, service, inputData, gmInstance)
        } catch (err) {
            return ApiResponse.error(req, res, err.errorMessage, err.errorList, err.errorCode, err.errorData);
        }

    }
})

const beforeMiddlewareExec = (req, service, inputData, globalMiddleware) => {
    let gmInstance = []
    globalMiddleware.forEach((gmName) => {
        try {
            var gm = require(middlewarePath + '/' + gmName)
            gmInstance.push({ name: gmName, instance: gm })
        } catch (err) {
            throw new ApiException("Middleware not found", {
                middleware_path: middlewarePath + '/' + gmName
            }, 500, { type: "MIDDLEWARE_NOT_FOUND", detail: "module middleware with name " + gmName + " not found" })
        }
        try {
            gm.before(req, service, inputData, (newInput) => {
                inputData = newInput
            })
        } catch (err) {
            if (err instanceof ApiException) {
                throw err
            }
            throw new ApiException(err.message, { middleware_path: middlewarePath + '/' + gmName }, 500, { detail: 'error when executing before middleware', type: 'MIDDLEWARE_BEFORE_FAIL' })
        }

    })
    return gmInstance
}
const afterMiddlewareExec = (req, service, inputData, gmInstance) => {
    gmInstance.forEach(({ name, instance }) => {
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
module.exports = { ApiCall, ApiException, ApiResponse, ApiService, db }