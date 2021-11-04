import { Request, NextHandler } from 'polka'
import { Tmethod } from "./types";
import { ServerResponse as Response } from 'http';
import { MessagesContract, ValidationRuleArrayStringNotationContract, ValidationRulesContract, ValidationRuleStringNotationContract } from 'node-input-validator/esm/contracts';
type TRules = ValidationRuleArrayStringNotationContract | ValidationRulesContract | ValidationRuleStringNotationContract
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
  rules: TRules|((input:any)=>TRules);
  customMessages?: MessagesContract | undefined;
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
  (req: ReqExtended, res: Response, next: NextHandler): Promise<void>
  default?: (req: ReqExtended, res: Response, next: NextHandler) => Promise<void>
}
export interface IGmInstance {
  name: string;
  instance: IMiddleware;
}
