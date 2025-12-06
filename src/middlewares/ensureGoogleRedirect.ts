import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../models/apiResponse.js";

export default function ensureGoogleRedirect(req: Request, res: Response, next: NextFunction) {
  const { code, state } = req.query;

  // Google OAuth ALWAYS sends both:
  // - code (auth code)
  // - state (CSRF token)
  if (!code || !state) {
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