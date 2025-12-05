import express, {Request, Response, NextFunction} from 'express';
import userRouter from './routes/users/index.js';
import authRouter from "./routes/auth/auth.routes.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import bodyParser from "body-parser";
import { apiResponseMiddleware } from "./middlewares/apiResponse.middleware.js";
import passport from "./config/passport.js";
import googleAuthRouter from "./routes/auth/google.js";
import session from "express-session";

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); // parses URL-encoded forms
app.use(apiResponseMiddleware); // important
app.use(express.json()); // built-in body parser for JSON
// Required for passport (even if using JWT)
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Google OAuth routes
app.use("/auth",googleAuthRouter);

app.use("/auth", authRouter);

app.use('/users', AuthMiddleware.isJWTAuthenticated, userRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
