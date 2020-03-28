const { ApiException } = require('../../index')
const auth = {
    before: (req, service, input, next) => {
        const token = req.headers.Authorization || req.headers.authorization;
        if (!token) {
            throw new ApiException("Token not found", {}, 403, { type: "TOKEN_NOT_FOUND", detail: "this request must include a JWT token in the header.Authorization" })
        }
        try {
            var claim = jwt.verify(token, process.env.APP_KEY);
            input.session.user_id = claim.user_id;
            input.session.api_key = claim.api_key;
        } catch (err) {
            throw new ApiException("Invalid Token", {}, 403, { type: "TOKEN_INVALID", detail: "your provided token is invalid or expired" })
        }
        next(input)
    },
    after: (req, service) => {

    }
}

module.exports = auth