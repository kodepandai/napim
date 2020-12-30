import { Request, Next as NextFunction } from 'polka'
import { Tmethod } from "./types";
import { ServerResponse as Response } from 'http';
export interface IKeyVal {
  [key: string]: any;
}
export interface IRoutes {
  tag?: string,
  prefix: string,
  post?: IRoute[];
  get?: IRoute[];
  delete?: IRoute[];
  put?: IRoute[];
  patch?: IRoute[];
  middleware: string[];
}
export interface IRoute {
  path: string;
  service: string;
}
export interface IService {
  method?: Tmethod[];
  transaction: boolean;
  middleware?: IMiddleware[],
  prepare: (input: any | any[], trx: any) => any;
  process: (
    input: any,
    originalInput: any,
    trx: any,
    req: Request,
    res: Response

  ) => any;
  rules: object;
  customMessages?: object | undefined;
}
export interface IErrorData {
  type: string;
  detail: string;
}
export interface ReqExtended extends Request {
  body?: any
  input?: any
}
export interface IMiddleware {
  (req: ReqExtended, res: Response, next: NextFunction): Promise<void>
  default?: (req: ReqExtended, res: Response, next: NextFunction) => Promise<void>
}
export interface IGmInstance {
  name: string;
  instance: IMiddleware;
}
