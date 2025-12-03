// services/AuthService.ts
import { JwtService } from "./jwtService.js";

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: any;
}

export class AuthService {
  private static users = [
    { id: 1, email: "ibrahim@example.com", password: "12345" },
    { id: 2, email: "user2@example.com", password: "abcdef" },
  ];

  static login(email: string, password: string): LoginResult | null {
    const user = this.users.find((u) => u.email === email && u.password === password);
    if (!user) return null;

    const payload = { id: user.id, email: user.email };

    const accessToken = JwtService.generateAccessToken(payload);
    const refreshToken = JwtService.generateRefreshToken(payload);

    return { accessToken, refreshToken, user };
  }

  static refreshToken(refreshToken: string): string | null {
    try {
      const decoded = JwtService.verifyRefreshToken(refreshToken) as any;

      return JwtService.generateAccessToken({
        id: decoded.id,
        email: decoded.email,
      });
    } catch {
      return null;
    }
  }
}
