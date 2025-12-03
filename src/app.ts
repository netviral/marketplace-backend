import path from "path";

import express, {Request, Response, NextFunction} from 'express';
import userRouter from './routes/users/index.js';
import authRouter from "./routes/auth/auth.routes.js";
import { AuthMiddleware } from "./middlewares/auth.middleware.js";
import bodyParser from "body-parser";
import { apiResponseMiddleware } from "./middlewares/apiResponse.middleware.js";

const app = express();

app.use(bodyParser.urlencoded({ extended: true })); // parses URL-encoded forms
app.use(apiResponseMiddleware); // important
app.use(express.json()); // built-in body parser for JSON
app.use("/auth", authRouter);

app.use('/users', AuthMiddleware.authenticateJWT, userRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});
