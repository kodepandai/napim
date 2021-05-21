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
let log: Logger
log = {
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
const getLogger = async () => {
  if (fs.existsSync(Path.logPath) && process.env.LOG != "false") {
    const pkg = await import("simple-node-logger")
    const logger = pkg.default || pkg
    log = logger.createRollingFileLogger(opts);
  }
  return log
}

export const Log: Logger = {
  debug: (data) => {
    getLogger().then(logger => {
      logger.debug(data)
    })
  },
  fatal: (data) => {
    getLogger().then(logger => {
      logger.fatal(data)
    })
  },
  warn: (data) => {
    getLogger().then(logger => {
      logger.warn(data)
    })
  },
  info: (data) => {
    getLogger().then(logger => {
      logger.info(data)
    })
  },
  trace: (data) => {
    getLogger().then(logger => {
      logger.trace(data)
    })
  },
  error: (data) => {
    getLogger().then(logger => {
      logger.error(data)
    })
  }
}