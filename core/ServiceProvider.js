const jwt = require('jsonwebtoken')
const log = require('../utils/logger')
const { Validator } = require('node-input-validator')
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
const ApiCall = async (service, input) => {
    try {
        const validator = new Validator(input, service.rules);

        const valid = await validator.check();
        if (!valid) {
            throw new ApiException("", validator.errors, 422, {
                type: 'INVALID_REQUEST',
                detail: 'Unprocessable Entity'
            });
        }
        var inputNew = await service.prepare(input);
        const inputProcess = (inputNew == null) ? input : inputNew;
        const result = await service.process(inputProcess, input);
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
        result.path = req.path
        if (statusCode >= 500) {
            if (process.env.DEBUG) {
                log.error(result)
                return res.status(statusCode).json(result);
            }
            result.message = "Server Error"
            return res.status(statusCode).json(result);
        } else {
            return res.status(statusCode).json(result);
        }
    }
}
//digunakan untuk menjalankan service dari check token, transaction hingga prosess
const ApiExec = async (service, input, req, res) => {
    try {
        if (service.transaction === true) {
            // await db.raw("BEGIN")
        }

        const result = await ApiCall(service, input)
        if (service.transaction === true) {
            // await db.raw("COMMIT")
        }
        return ApiResponse.success(res, result)
    } catch (err) {
        if (service.transaction === true) {
            // await db.raw("ROLLBACK")
        }

        if (err instanceof ApiException) {
            return ApiResponse.error(req, res, err.errorMessage, err.errorList, err.errorCode, err.errorData);
        } else {
            //error dari server
            return ApiResponse.error(req, res, err.message);
        }
    }
}

const ApiService = (service) => ({
    run: async (res, req = {}, method = 'GET') => {
        let input = method == 'GET' ? req.query : req.body
        var inputData = input

        var session = {
            datetime: new Date,
            user_id: -1,
            // api_token: null
        }

        // var token = null

        if (service.auth) {
            try {
                var claim = jwt.verify(token, process.env.JWT_SECRET);
                // console.log(claim)
                // const result = await db.raw("SELECT 1 FROM api_token WHERE api_token=? AND user_id=?", [claim.api_token, claim.user_id]);

                // if (result.rows.length > 0) {
                if (token) {
                    session.user_id = claim.user_id;
                    session.key = claim.key;
                    // session.user_id = 1;
                    // session.api_token = token;
                }
            } catch (err) {
                return ApiResponse.error(res, 'Token Invalid', {}, 403)
            }


            inputData.session = session;
            // return ApiResponse.error(res, "Access Denied", {}, 403)
        }
        return await ApiExec(service, inputData, req, res);
    },
    call: async (input) => {
        return await ApiCall(service, input);
    }
})
module.exports = { ApiCall, ApiExec, ApiException, ApiResponse, ApiService }