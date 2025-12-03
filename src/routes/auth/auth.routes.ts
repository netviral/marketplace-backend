import express, { Request, Response } from "express";
import { AuthService } from "../../services/AuthService.js";
import { ApiResponse } from '../../models/apiResponse.js';

const router = express.Router();

router.use(express.json());

// Login endpoint
router.post("/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.api(ApiResponse.error(400, "Email and password are required."));
  }

  const result = AuthService.login(email, password);

  if (!result) {
    return res.api(ApiResponse.error(401, "Invalid credentials."));
  }

  return res.api(
    ApiResponse.success(200, "Login successful", {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })
  );
});

// Refresh endpoint
router.post("/refresh", (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.api(ApiResponse.error(400, "Missing refresh token."));
  }

  const newAccessToken = AuthService.refreshToken(refreshToken);

  if (!newAccessToken) {
    return res.api(ApiResponse.error(403, "Invalid or expired refresh token."));
  }

  return res.api(
    ApiResponse.success(202, "Token refreshed", {
      accessToken: newAccessToken,
    })
  );
});

export default router;
