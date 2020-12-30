import {
  ApiException,
  ApiResponse,
  Log,
  Console,
} from "../core/ServiceProvider";
import { IKeyVal, ReqExtended } from './interface';
import { STATUS_CODES, ServerResponse as Response } from 'http';

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