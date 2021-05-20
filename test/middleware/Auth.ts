import { IMiddleware } from "../../dist/utils/interface";

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
