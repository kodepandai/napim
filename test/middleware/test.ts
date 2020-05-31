import { Request, Response, NextFunction } from "express";
import { IMiddleware } from "../../dist";

const test: IMiddleware = (req: Request, res: Response, next: NextFunction) => {
  next();
};

export default test;
