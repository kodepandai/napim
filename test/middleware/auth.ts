import { IMiddleware, ApiResponse, ApiException } from "../../dist/index";
const jwt = require("jsonwebtoken");
const auth: IMiddleware = (req, res, next) => {
  const token = req.headers.Authorization || req.headers.authorization;
  if (!token) {
    throw new ApiException("Token not found", {}, 401, {
      type: "TOKEN_NOT_FOUND",
      detail:
        "this request must include a JWT token in the header.Authorization",
    });
  }
  try {
    var claim = jwt.verify(token, process.env.APP_KEY);
    req.session.user_id = claim.user_id;
    req.session.api_key = claim.api_key;
  } catch (err) {
    throw new ApiException("Invalid Token", {}, 401, {
      type: "TOKEN_INVALID",
      detail: "your provided token is invalid or expired",
    });
  }
  next();
};

export default auth;
