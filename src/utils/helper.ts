import { Request, Response } from "express";
import {
  ApiException,
  ApiResponse,
  Log,
  Console,
} from "../core/ServiceProvider";

export const parseError = (req: Request, err: ApiException) => ({
  code: err.errorCode || 500,
  message: err.errorMessage,
  ...err.errorData,
  errors: err.errorList,
  path: req.method + ":" + req.path,
});

export const handleError = (req: Request, res: Response, err: Error) => {
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
