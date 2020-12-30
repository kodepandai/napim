import { IMiddleware } from "../../dist";

const Upload: IMiddleware = async (req, res, next) => {
  console.log("mid upload");
  next();
};

export default Upload;
