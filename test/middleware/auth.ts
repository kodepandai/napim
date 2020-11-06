import { IMiddleware } from "../../dist/index";
const Auth: IMiddleware = (req, res, next) => {
  console.log('mid auth');
  req.input.user = {
    name: 'jack sparrow',
    key: 'qwerty12345'
  }
  return next();
};

export default Auth;
