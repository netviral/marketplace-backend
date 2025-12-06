import express from 'express';
import BrowserRouter from "./browser/index.js";
import ApiRouter from "./api/bearer-token.js";


const router = express.Router({ mergeParams: true });

router.use("/browser", BrowserRouter);

router.use("/api", ApiRouter);
export default router;