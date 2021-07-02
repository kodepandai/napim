import path from "path";
import { Log } from "../utils/Log";
import niv from "node-input-validator/cjs/index.js"
const {Validator, extend: extendRule, Messages: {addCustomMessages, extend: extendMessages}} = niv
import { IKeyVal, IService, IErrorData, ReqExtended } from "../utils/interface";

import { Tmethod } from "../utils/types";
import Console from "../utils/console";
import { STATUS_CODES, ServerResponse as Response } from 'http';

// HELPERS
export const parseError = (req: ReqExtended, err: ApiException) => ({
  code: err.errorCode || 500,
  message: err.errorMessage,
  ...err.errorData,
  errors: err.errorList,
  path: req.method + ":" + req.path,
});

export const handleError = (req: ReqExtended, res: Response, err: any) => {
  if (err instanceof ApiException) {
    if (err.errorCode >= 500) {
      Log.error(parseError(req, err));
    }
    return ApiResponse.error(req, res, err);
  }
  Log.fatal(err.stack);
  Console.error(err.message);
  let fatalErr = new ApiException(err.message);
  return ApiResponse.error(req, res, fatalErr);
};

const TYPE = 'content-type';
const OSTREAM = 'application/octet-stream';

export const send = (res: Response, code = 200, data: any = '', headers: IKeyVal = {}) => {
  let k, obj: any = {};
  for (k in headers) {
    obj[k.toLowerCase()] = headers[k];
  }

  let type = obj[TYPE] || res.getHeader(TYPE);

  if (!!data && typeof data.pipe === 'function') {
    res.setHeader(TYPE, type || OSTREAM);
    return data.pipe(res);
  }

  if (data instanceof Buffer) {
    type = type || OSTREAM; // prefer given
  } else if (typeof data === 'object') {
    data = JSON.stringify(data);
    type = type || 'application/json;charset=utf-8';
  } else {
    data = data || STATUS_CODES[code];
  }

  obj[TYPE] = type || 'text/html;charset=utf-8';
  obj['content-length'] = Buffer.byteLength(data);

  res.writeHead(code, obj);
  res.end(data);
}

// MAIN LOGIC GOES HERE
let db: any
export const registerDb = async (injectedDB = null, beforeStart = () => { }) => {
  db = injectedDB
  if (!db) {
    try {
      //Check is using knex or not
      const pkgKnex = await import('knex')
      const DB = pkgKnex.default || pkgKnex
      let knexFile: any;
      try {
        const pkgKnexFile = await import(path.resolve(process.cwd(), "knexfile.js"));
        knexFile = pkgKnexFile.default || pkgKnexFile
      } catch (error) {
        Console.error(error)
      }
      if (!Object.keys(knexFile).includes(process.env.DB_ENV || "development")) {
        Console.error(
          "invalid DB_ENV, available environment: " + Object.keys(knexFile)
        );
      }
      db = DB(knexFile[process.env.DB_ENV || "development"]);
    } catch (e) {
      //pass    
    }
  }
  beforeStart()
  db = db
}

/**
* create Exception Instance that will be thrown to client response
*/
class ApiException {
  errorMessage: string;
  errorList: object | any[];
  errorCode: number;
  errorData: IErrorData;
  constructor(
    errorMessage = "",
    errorCode = 500,
    errorData = {
      type: "SERVER_ERROR",
      detail: "something wrong, check server log for more detail",
    },
    errorList = {},
  ) {
    this.errorMessage = errorMessage;
    this.errorList = errorList;
    this.errorCode = errorCode;
    this.errorData = errorData;
  }
}
/**
 * executing service without middleware, can be used for communicate between services
 */
const ApiCall = async (
  service: IService,
  input: any,
  trx: any = db,
  req: ReqExtended,
  res: Response
) => {
  try {
    const validator = new Validator(
      input,
      service.rules,
      service.customMessages || undefined
    );

    const valid = await validator.validate();
    if (!valid) {
      throw new ApiException("Unprocessable Entity", 422, {
        type: 'UNPROCESSABLE_ENTITY',
        detail: 'your input is not valid'
      }, validator.errors);
    }
    var inputNew = await service.prepare(input, trx);
    const inputProcess = inputNew == null ? input : inputNew;
    return await service.process(inputProcess, input, trx, req, res);
  } catch (err) {
    throw err;
  } finally {
    if (process.env.DB_DESTROY == 'true' && db?.destroy) {
      db.destroy();
    }
  }
};
/**
 * Create Http Response API
 */
var ApiResponse = {
  /**
   * response json success
   */
  success: (req: ReqExtended, res: Response, data: object, code: number = 200) => {
    if (code >= 300) {
      let err = new ApiException("invalid http response code", 500, {
        type: "INVALID_HTTP_CODE",
        detail:
          "you must return valid http code for success response, returned code is: " +
          code,
      });
      Log.error(parseError(req, err));
      return send(res, 500, parseError(req, err));
    }
    return send(res, code, data);
  },
  /**
   * response json error
   */
  error: (req: ReqExtended, res: Response, err: ApiException) => {
    if (err.errorCode < 300) {
      let newErr = new ApiException("invalid http response code", 500, {
        type: "INVALID_HTTP_CODE",
        detail:
          "you must return valid http code for error response, returned code is: " +
          err.errorCode,
      });
      return send(res, 500, parseError(req, newErr));
    }
    var result = parseError(req, err);
    if (err.errorCode >= 500) {
      if (process.env.DEBUG == "false") {
        result.message = "Server Error";
        result.type = "SERVER_ERROR";
        result.detail = "something wrong";
      }
    }
    return send(res, err.errorCode, result);
  },
};
/**
 * Executing service
 */
let trx:any = null
const ApiExec = async (
  service: IService,
  input: any,
  req: ReqExtended,
  res: Response,
) => {
  if (service.transaction === true && db?.transaction) { //TODO: suport mongo transaction
    await db.transaction(async (_trx: any) => {
      trx = _trx
      const result = await ApiCall(service, input, _trx, req, res);
      return ApiResponse.success(
        req,
        res,
        result,
        result ? result.code || 200 : 200
      );
    });
  } else {
    const result = await ApiCall(service, input, db, req, res);
    return ApiResponse.success(
      req,
      res,
      result,
      result ? result.code || 200 : 200
    );
  }
};

const ApiService = (service: IService) => ({
  /** run service */
  run: async (req: ReqExtended, res: Response) => {
    const query = typeof req.query == 'object' ? req.query : {}
    let inputData = { ...query, ...req.body, ...req.params }
    if (req.input) {
      inputData = { ...inputData, ...req.input }
    }
    await ApiExec(service, inputData, req, res);
  },
});

const serviceExec = async (
  req: ReqExtended,
  res: Response,
  service: IService
) => {
  let method = req.method?.toLowerCase() as Tmethod
  if (service.method) {
    if (!service.method.includes(method)) {
      throw new ApiException("Method not allowed", 405, {
        detail: "allowed method:  " + service.method.join(", "),
        type: "METHOD_NOT_ALLOWED",
      });
    }
  }
  await ApiService(service).run(req, res);
};
const getDB = ()=>(trx??db)

export {
  ApiCall,
  ApiException,
  ApiResponse,
  ApiService,
  getDB,
  serviceExec,
  Console,
  Log,
  extendRule,
  addCustomMessages,
  extendMessages
};
