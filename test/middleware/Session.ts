import { IMiddleware } from "../../dist";

const Session: IMiddleware = (req, res, next) => {
  console.log('mid session');
  req.input.session = { data: "tes session" }
  next();
};

export default Session;
