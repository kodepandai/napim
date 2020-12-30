import { IMiddleware } from "../../dist";

const Session: IMiddleware = async (req, res, next) => {
  console.log('mid session');
  req.input.session = { data: "tes session" }
  req.input.path = req.path
  next();
};

export default Session;
