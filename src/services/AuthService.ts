// services/AuthService.ts
import JwtBody from "../models/jwt.payload.js";
import { JwtService } from "./jwtService.js";

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export class AuthService {

  static refreshToken(refreshToken: string): string | null {
    try {
      const decoded = JwtService.verifyRefreshToken(refreshToken) as JwtBody;
      // {
      //   id
      //   email
      //   name
      //   roles
      //   imageUrl,
      // }
      console.log("decoded: ",decoded);
      
      const payload: JwtBody = {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        roles: decoded.roles,
        imageUrl: decoded.imageUrl,
      };

      return JwtService.generateAccessToken(payload);
    } catch {
      return null;
    }
  }
}
