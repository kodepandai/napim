import { IMiddleware } from "../../dist";

const Session: IMiddleware = (req, res, next) => {
  req.input.session = { data: "tes session" }

  next();
};

export default Session;
