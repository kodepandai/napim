import Path from "./path";
import fs from 'fs'

const opts = {
  logDirectory: Path.logPath, // NOTE: folder must exist and be writable...
  fileNamePattern: "<DATE>.log",
  dateFormat: "YYYY.MM.DD",
};
export interface Logger {
  trace: (data: any) => void;
  debug: (data: any) => void;
  error: (data: any) => void;
  warn: (data: any) => void;
  fatal: (data: any) => void;
  info: (data: any) => void;
}
let log: Logger = {
  trace: (data) => {
    console.trace(data);
  },
  debug: (data) => {
    console.debug(data);
  },
  error: (data) => {
    console.error(data);
  },
  warn: (data) => {
    console.warn(data);
  },
  fatal: (data) => {
    console.error(data)
  },
  info: (data) => {
    console.info(data)
  }
}
if (fs.existsSync(Path.logPath) && process.env.LOG != "false") {
  log = require("simple-node-Log").createRollingFileLogger(opts);
}

export const Log = log