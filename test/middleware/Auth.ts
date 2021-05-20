import { IMiddleware } from "../../dist/index";
const Auth: IMiddleware = async (req, res, next) => {
  console.log('mid auth');
  console.log(req.path);

  req.input.user = {
    name: 'jack sparrow',
    key: 'qwerty12345'
  }
  return next();
};

export default Auth;
