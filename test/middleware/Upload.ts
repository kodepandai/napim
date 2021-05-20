import { IMiddleware } from "../../dist/utils/interface";

const Upload: IMiddleware = async (req, res, next) => {
  console.log("mid upload");
  next();
};

export default Upload;
