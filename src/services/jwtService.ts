import jwt, { JwtPayload, SignOptions, Secret } from "jsonwebtoken";
import ENV from "../env.js";
import JwtBody from "../models/jwt.payload.js";

export class JwtService {
  private static readonly ACCESS_SECRET: Secret = ENV.JWT_ACCESS_SECRET;
  private static readonly REFRESH_SECRET: Secret = ENV.JWT_REFRESH_SECRET;

  /**
   * Helper to safely create sign options
   */
  private static makeSignOptions(expiresIn: string): SignOptions {
    return { expiresIn } as SignOptions;
  }

  static generateAccessToken(payload: JwtBody): string {
    return jwt.sign(
      payload,
      this.ACCESS_SECRET,
      this.makeSignOptions(ENV.JWT_EXPIRES_IN)
    );
  }

  static generateRefreshToken(payload: JwtBody): string {
    return jwt.sign(
      payload,
      this.REFRESH_SECRET,
      this.makeSignOptions(ENV.JWT_REFRESH_EXPIRES_IN)
    );
  }

  static verifyAccessToken(token: string): JwtPayload | string {
    return jwt.verify(token, this.ACCESS_SECRET);
  }

  static verifyRefreshToken(token: string): JwtPayload | string {
    return jwt.verify(token, this.REFRESH_SECRET);
  }
}
