import { ApiException, IMiddleware } from '../../dist/index'
const jwt = require('jsonwebtoken')
const auth: IMiddleware = {
    /**
     * executed before service run
     * you can filter user input or make authorization here
     */
    before: (req, service, input, next) => {
        const token = req.headers.Authorization || req.headers.authorization;
        if (!token) {
            throw new ApiException("Token not found", {}, 401, { type: "TOKEN_NOT_FOUND", detail: "this request must include a JWT token in the header.Authorization" })
        }
        try {
            var claim = jwt.verify(token, process.env.APP_KEY);
            input.session.user_id = claim.user_id;
            input.session.api_key = claim.api_key;
        } catch (err) {
            throw new ApiException("Invalid Token", {}, 401, { type: "TOKEN_INVALID", detail: "your provided token is invalid or expired" })
        }
        next(input)
    },
    /**
     * executed after service run
     * there is no next method here, this is final method after service execution
     */
    after: (req, service, input) => {
    }
}

module.exports = auth