import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import UserService from "../services/UserService.js";
import JwtBody from "../models/jwt.payload.js";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL!;

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID!,
      clientSecret: GOOGLE_CLIENT_SECRET!,
      callbackURL: GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const imageUrl = profile._json.picture || "";

        if (!email) {
          return done(new Error("Google profile has no email"));
        }

        // 1. Check if user exists
        let user = await UserService.getUserByEmail(email);

        if (user) {
          // 2. Update existing user's display name and picture
          await UserService.updateUser(name, email, imageUrl, user.roles);
        } else {
          // 3. Create new user
          user = await UserService.registerUser(
            name,
            email,
            imageUrl,
            ["user"]
         );
        }

        const payload: JwtBody ={
          id: user.id,
          email: user.email,
          name: user.name,
          roles: user.roles,
          imageUrl: user.imageUrl,
        };

        // 4. Pass user to passport
        return done(null, payload);
      } catch (err) {
        console.error("Google OAuth error:", err);
        return done(err);
      }
    }
  )
);

// Required for sessions (even if you don’t use sessions, Passport expects it)
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

export default passport;
