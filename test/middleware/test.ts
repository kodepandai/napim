import { IMiddleware } from "../../dist";

const test: IMiddleware = (req, res, next) => {
  console.log("mid test");
  req.session = { data: "tes session" };
  next();
};

export default test;
