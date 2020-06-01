import { IMiddleware } from "../../dist";

const test: IMiddleware = (req, res, next) => {
  next();
};

export default test;
