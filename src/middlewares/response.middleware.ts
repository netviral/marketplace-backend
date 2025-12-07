/// <reference path="../types/express.d.ts" />
import { ApiResponse } from "../models/apiResponse.model.js";
import { Request, Response, NextFunction } from "express";

export const apiResponseMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.api = function <T>(response: ApiResponse<T>) {
    return res.status(response.code).json(response);
  };

  next();
};
