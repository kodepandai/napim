import { logPath } from "./path";

const opts = {
  logDirectory: logPath, // NOTE: folder must exist and be writable...
  fileNamePattern: "<DATE>.log",
  dateFormat: "YYYY.MM.DD",
};
declare interface Logger {
  trace: (data: any) => void;
  debug: (data: any) => void;
  error: (data: any) => void;
  warn: (data: any) => void;
  fatal: (data: any) => void;
  info: (data: any) => void;
}
const log: Logger = require("simple-node-logger").createRollingFileLogger(opts);
export default log;
