const jwt = require('jsonwebtoken')
const log = require('../utils/logger')
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
    constructor(errorMessage = "", errorList = {}, errorCode = 422, errorData = { type: 'SERVER_ERROR', detail: "something wrong, check server log for more detail" }) {
        this.errorMessage = errorMessage;
        this.errorList = errorList;
        this.errorCode = errorCode;
        this.errorData = errorData
    }
}
//menjalankan service tanpa validasi token dan transaction check
//bisa digunakan untuk komunikasi antar service
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

var ApiResponse = {
    success: (res, data) => {
        var body = data
        var statusCode = 200;
        return res.status(statusCode).json(body);
    },
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
            log.error({ ...result }) //clone result sebelum dirubah
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
//digunakan untuk menjalankan service dari check token, transaction hingga prosess
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
    run: async (res, req = {}, method = 'GET', globalMiddleware = []) => {
        let inputData = method == 'GET' ? req.query : req.body
        // var inputData = input

        var session = {
            datetime: new Date,
            user_id: -1,
            // api_token: null
        }

        // var token = null

        // if (service.auth) {
        //     try {
        //         var claim = jwt.verify(token, process.env.JWT_SECRET);
        //         // console.log(claim)
        //         // const result = await db.raw("SELECT 1 FROM api_token WHERE api_token=? AND user_id=?", [claim.api_token, claim.user_id]);

        //         // if (result.rows.length > 0) {
        //         if (token) {
        //             session.user_id = claim.user_id;
        //             session.key = claim.key;
        //             // session.user_id = 1;
        //             // session.api_token = token;
        //         }
        //     } catch (err) {
        //         return ApiResponse.error(res, 'Token Invalid', {}, 403)
        //     }


        //     inputData.session = session;
        //     // return ApiResponse.error(res, "Access Denied", {}, 403)
        // }
        // Global Middleware 
        let pass = true
        globalMiddleware.forEach((gmName) => {
            let gm = null
            try {
                gm = require(middlewarePath + '/' + gmName)
            } catch (err) {
                pass = false
                return ApiResponse.error(req, res, "Middleware not found", {
                    middleware_path: middlewarePath + '/' + gmName
                }, 500, { type: "MIDDLEWARE_NOT_FOUND", detail: "module middleware with name " + gmName + " not found" })
            }
            try {
                //before midlleware
                gm.before(req, service, inputData, (newInput) => {
                    inputData = newInput
                })


            } catch (err) {
                pass = false
                if (err instanceof ApiException) {
                    return ApiResponse.error(req, res, err.errorMessage, err.errorList, err.errorCode, err.errorData);
                }
                return ApiResponse.error(req, res, err.message, { middleware_path: middlewarePath + '/' + gmName }, 500, { detail: 'error when executing middleware' })
            }

        })
        if (pass) {
            return await ApiExec(service, inputData, req, res);
        }
    },
    call: async (input) => {
        return await ApiCall(service, input);
    }
})
module.exports = { ApiCall, ApiExec, ApiException, ApiResponse, ApiService, db }