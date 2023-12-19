import { Router } from "express";
import catchAsync from "../utils/catchAsync";
import validate from "../middlewares/validate";
import authenticate from "../middlewares/authenticate";
import roleValidation from "../validations/roleValidation";

const router = Router();

router.get(
  "/",
  authenticate("role:read"),
  validate(roleValidation.createRole),
  catchAsync()
);

export default router;
