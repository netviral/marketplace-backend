/// <reference path="../types/express.d.ts" />
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../models/apiResponse.model.js";

export default function ensureGoogleRedirect(req: Request, res: Response, next: NextFunction) {
  const { code } = req.query;

  // Google OAuth ALWAYS sends both:
  // - code (auth code)
  if (!code) {
    return res.api(
      ApiResponse.error(
        403,
        "Invalid OAuth callback source",
        "OAUTH_INVALID_CALLBACK"
      )
    );
  }

  return next();
}