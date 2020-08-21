import path from "path";
import Log from "../utils/logger";
import { Validator } from "node-input-validator";
import Knex from "knex";
import { Response, Request } from "express";
import { IService, IErrorData, ReqExtended } from "../utils/interface";
import { Tmethod } from "../utils/types";
import * as Console from "../utils/console";
import { parseError } from "../utils/helper";
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
const db = Knex(knexFile[process.env.DB_ENV || "development"]);
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
  trx: Knex.Transaction | Knex = db
) => {
  try {
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
    return await service.process(inputProcess, input, trx);
  } catch (err) {
    throw err;
  }
};
/**
 * Create Http Response API
 */
var ApiResponse = {
  /**
   * response json success
   */
  success: (req: Request, res: Response, data: object, code: number = 200) => {
    if (code >= 300) {
      let err = new ApiException("invalid http response code", {}, 500, {
        type: "INVALID_HTTP_CODE",
        detail:
          "you must return valid http code for success response, returned code is: " +
          code,
      });
      Log.error(parseError(req, err));
      return res.status(500).json(parseError(req, err));
    }
    return res.status(code).json(data);
  },
  /**
   * response json error
   */
  error: (req: Request, res: Response, err: ApiException) => {
    if (err.errorCode < 300) {
      let newErr = new ApiException("invalid http response code", {}, 500, {
        type: "INVALID_HTTP_CODE",
        detail:
          "you must return valid http code for error response, returned code is: " +
          err.errorCode,
      });
      Log.error(parseError(req, newErr));
      return res.status(500).json(parseError(req, err));
    }
    var result = parseError(req, err);
    if (err.errorCode >= 500) {
      if (process.env.DEBUG == "false") {
        result.message = "Server Error";
        result.type = "SERVER_ERROR";
        result.detail = "something wrong";
      }
    }

    return res.status(err.errorCode).json(result);
  },
};
/**
 * Executing service
 */
const ApiExec = async (
  service: IService,
  input: any,
  req: ReqExtended,
  res: Response
) => {
  if (service.transaction === true) {
    await db.transaction(async (trx: Knex.Transaction) => {
      const result = await ApiCall(service, input, trx);
      return ApiResponse.success(
        req,
        res,
        result,
        result ? result.code || 200 : 200
      );
    });
  } else {
    const result = await ApiCall(service, input);
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
  run: async (req: ReqExtended, res: Response, method: Tmethod = "get") => {
    let inputData = method == "get" ? req.query : req.body;
    if (req.file) {
      inputData.file = req.file;
    }
    if (req.session) {
      inputData.session = req.session;
    }
    await ApiExec(service, inputData, req, res);
  },
});

const serviceExec = async (
  req: ReqExtended,
  res: Response,
  method: Tmethod,
  service: IService
) => {
  if (service.method) {
    if (!service.method.includes(method)) {
      throw new ApiException("Method not allowed", {}, 405, {
        detail: "allowed method:  " + service.method.join(", "),
        type: "METHOD_NOT_ALLOWED",
      });
    }
  }
  if (method != "get") {
    req.body = { ...req.body, ...req.params };
  } else {
    req.query = { ...req.query, ...req.params };
  }
  await ApiService(service).run(req, res, method);
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
