import express, {Request, Response, NextFunction} from 'express';
import userRouter from './routes/users/index.js';
import authRouter from "./routes/auth/api/bearer-token.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import bodyParser from "body-parser";
import { apiResponseMiddleware } from "./middlewares/apiResponse.middleware.js";
import passport from "./config/passport.js";
import googleBrowserAuthRouter from "./routes/auth/browser/google.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import { ApiResponse } from './models/apiResponse.js';


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
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());

// Google OAuth routes
app.use("/auth/browser",googleBrowserAuthRouter);

app.use("/auth", authRouter);

app.use('/users', AuthMiddleware.isJWTAuthenticated, userRouter);

app.use((req: Request, res: Response) => {
    res.api(ApiResponse.error(404, "Resource not found"));
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
