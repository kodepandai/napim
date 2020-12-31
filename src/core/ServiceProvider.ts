import path from "path";
import Log from "../utils/logger";
import { Validator } from "node-input-validator";
import { IService, IErrorData, ReqExtended } from "../utils/interface";
import { Tmethod } from "../utils/types";
import * as Console from "../utils/console";
import { parseError, send } from "../utils/helper";
import { ServerResponse as Response } from "http";

let db: any

export const registerDb = (injectedDB = null, beforeStart = () => { }) => {
  db = injectedDB
  if (!db) {
    try {
      //Check is using knex or not
      let DB = require('knex')
      let knexFile: any;
      try {
        knexFile = require(path.resolve(process.cwd(), "knexfile.js"));
      } catch (error) {
        Console.error("missing knexfile.js, run npx knex init to create it!");
        process.exit(1);
      }
      if (!Object.keys(knexFile).includes(process.env.DB_ENV || "development")) {
        Console.error(
          "invalid DB_ENV, available environment: " + Object.keys(knexFile)
        );
        process.exit(1);
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
    errorList = {},
    errorCode = 500,
    errorData = {
      type: "SERVER_ERROR",
      detail: "something wrong, check server log for more detail",
    }
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
    delete input.wild
    const validator = new Validator(
      input,
      service.rules,
      service.customMessages || undefined
    );

    const valid = await validator.check();
    if (!valid) {
      throw new ApiException("", validator.errors, 422, {
        type: "INVALID_REQUEST",
        detail: "Unprocessable Entity",
      });
    }
    var inputNew = await service.prepare(input, trx);
    const inputProcess = inputNew == null ? input : inputNew;
    return await service.process(inputProcess, input, trx, req, res);
  } catch (err) {
    throw err;
  } finally {
    if (process.env.IS_OFFLINE == 'true' && db?.destroy) {
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
      let err = new ApiException("invalid http response code", {}, 500, {
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
      let newErr = new ApiException("invalid http response code", {}, 500, {
        type: "INVALID_HTTP_CODE",
        detail:
          "you must return valid http code for error response, returned code is: " +
          err.errorCode,
      });
      return send(res, 500, parseError(req, err));
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
const ApiExec = async (
  service: IService,
  input: any,
  req: ReqExtended,
  res: Response,
) => {
  if (service.transaction === true && db?.transaction) { //TODO: suport mongo transaction
    await db.transaction(async (trx: any) => {
      const result = await ApiCall(service, input, trx, req, res);
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
    let inputData = { ...req.query, ...req.body, ...req.params }
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
      throw new ApiException("Method not allowed", {}, 405, {
        detail: "allowed method:  " + service.method.join(", "),
        type: "METHOD_NOT_ALLOWED",
      });
    }
  }
  await ApiService(service).run(req, res);
};

export {
  ApiCall,
  ApiException,
  ApiResponse,
  ApiService,
  db,
  serviceExec,
  Console,
  Log,
};
