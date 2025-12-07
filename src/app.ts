/// <reference path="./types/express.d.ts" />
import express, { Request, Response, NextFunction } from 'express';
import mainRouter from './routes/index.js';
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import bodyParser from "body-parser";
import { apiResponseMiddleware } from "./middlewares/response.middleware.js";
import passport from "./config/passport.js";
import AuthRouter from "./routes/auth/index.js";
import session from "express-session";
import cookieParser from "cookie-parser";
import { ApiResponse } from './models/apiResponse.model.js';


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

app.use("/auth", AuthRouter);

// allow API access to all routes with bearer token auth, prefixed with /api
app.use('/api', AuthMiddleware.isBearerAuthenticated, mainRouter);

// allow browser access to same routes with cookie auth
app.use('/', mainRouter);

app.use((req: Request, res: Response) => {
  res.api(ApiResponse.error(404, "Resource not found"));
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
