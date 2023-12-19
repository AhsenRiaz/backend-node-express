import { Router } from "express";
import authRoute from "./authRoute.js";

const router = Router();

router.use('/auth', authRoute);

export default router;
