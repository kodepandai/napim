import { Request, Response, NextFunction, request } from "express";
import { Tmethod } from "./types";
export interface IKeyVal {
  [key: string]: any;
}
export interface IRoutes {
  post?: object[];
  get?: object[];
  delete?: object[];
  put?: object[];
  middleware: string[];
}
export interface IRoute {
  path: string;
  service: string;
}
export interface IService {
  method?: Tmethod[];
  transaction: boolean;
  auth?: boolean;
  prepare: (input: any | any[], method: Tmethod, trx: any) => any;
  process: (
    input: any,
    originalInput: any,
    method: Tmethod,
    trx: any
  ) => any;
  rules: object;
  customMessages?: object | undefined;
}
export interface IErrorData {
  type: string;
  detail: string;
}
export interface ReqExtended extends Request {
  input?: any
}
export interface IMiddleware {
  (req: ReqExtended, res: Response, next: NextFunction): void;
}
export interface IGmInstance {
  name: string;
  instance: IMiddleware;
}
