import * as express from 'express';
import "express-serve-static-core";
import { ApiResponse } from "../models/apiResponse/apiResponse";

declare module "express-serve-static-core" {
  interface Response {
    api: <T>(response: ApiResponse<T>) => Response;
  }
}

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      user?: any;
    }
  }
}

