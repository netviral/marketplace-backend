import express, { Request, Response } from "express";
import { AuthService } from "../../../services/AuthService.js";
import { ApiResponse } from '../../../models/apiResponse.js';

const router = express.Router();

router.use(express.json());

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
