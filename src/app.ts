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

// CORS configuration - must be before other middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;

  // const allowedOrigins = ['http://localhost:3000', 'http://localhost:3001'];
  const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(",") || [];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

app.use(bodyParser.urlencoded({ extended: true })); // parses URL-encoded forms
app.use(apiResponseMiddleware); // important
app.use(express.json({ limit: '10mb' })); // built-in body parser for JSON with increased limit for images
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
app.use('/', AuthMiddleware.isCookieAuthenticated, mainRouter);

app.use((req: Request, res: Response) => {
  res.api(ApiResponse.error(404, "Resource not found"));
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
