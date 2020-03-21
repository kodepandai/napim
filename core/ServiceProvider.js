const jwt = require('jsonwebtoken')
class CoreException {
    constructor(errorMessage = "", errorList = {}, errorCode = 422) {
        this.errorMessage = errorMessage;
        this.errorList = errorList;
        this.errorCode = errorCode;
    }
}
//menjalankan service tanpa validasi token dan transaction check
//bisa digunakan untuk komunikasi antar service
const CallService = async function (service, input) {
    // const validator = new v(input, service.validation);

    // const matched = await validator.check();
    // if (!matched) {
    //     throw new CoreException("", validator.errors);
    // }
    var inputNew = await service.prepare(input);
    const inputProcess = (inputNew == null) ? input : inputNew;
    const result = await service.process(inputProcess, input);
    return result
}

var CoreResponse = {
    success: function (res, data) {

        var body = {
            success: true,
            data: data
        };
        var statusCode = 200;

        return res.status(statusCode).json(body);
    },
    error: function (res, errorMessage = "", errorList = {}, statusCode = 500) {
        var result = {
            success: false,
        }

        if (errorMessage !== "") {
            result.error_message = errorMessage
        }

        if (errorList !== {}) {
            result.error_list = errorList
        }

        return res.status(statusCode).json(result);
    }
}
//digunakan untuk menjalankan service dari check token, transaction hingga prosess
const ExecuteService = async function (service, input, res) {
    try {
        if (service.transaction === true) {
            // await db.raw("BEGIN")
        }

        const result = await CallService(service, input)
        if (service.transaction === true) {
            // await db.raw("COMMIT")
        }
        return CoreResponse.success(res, result)
    } catch (err) {
        if (service.transaction === true) {
            // await db.raw("ROLLBACK")
        }

        if (err instanceof CoreException) {
            return CoreResponse.error(res, err.errorMessage, err.errorList, err.errorCode);
        } else {
            //error dari server
            return CoreResponse.error(res, err.message);
        }
    }
}

const CoreService = function (service) {
    return {
        run: async function (res, req = {}, method = 'GET') {
            if (method != service.method) return CoreResponse.error(res, "Method Not Allowed", {}, 405)
            let input = service.method == 'POST' ? req.body : req.query
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
                    return CoreResponse.error(res, 'Token Invalid', {}, 403)
                }


                inputData.session = session;
                // return CoreResponse.error(res, "Access Denied", {}, 403)
            }
            return await ExecuteService(service, inputData, res);
        },
        call: async function (res, input) {
            return await CallService(service, input);
        }
    }
}
module.exports = { CallService, ExecuteService, CoreException, CoreResponse, CoreService }