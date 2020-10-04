import { IMiddleware } from "../../dist/index";
const Auth: IMiddleware = (req, res, next) => {
  req.input.user = {
    name: 'jack sparrow',
    key: 'qwerty12345'
  }
  return next();
};

export default Auth;
