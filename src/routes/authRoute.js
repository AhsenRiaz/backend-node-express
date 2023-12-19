import { Router } from "express";
import authController from "../controllers/authController.js";
import authValidation from "../validations/authValidation.js";
import catchAsync from "../utils/catchAsync.js";
import validate from "../middlewares/validate.js";
import authenticate from "../middlewares/authenticate.js";

const router = Router();

router.post(
  "/signup",
  validate(authValidation.signup),
  catchAsync(authController.signup)
);

router.post(
  "/signin",
  validate(authValidation.signin),
  catchAsync(authController.signIn)
);

router.get("/current", authenticate(), catchAsync(authController.current));

router.get("/me", authenticate(), catchAsync(authController.getMe));

router.put(
  "/me",
  authenticate(),
  validate(authValidation.updateMe),
  catchAsync(authController.updateMe)
);

router.post(
  "/signout",
  validate(authValidation.signout),
  catchAsync(authController.signout)
);

router.post(
  "/refresh-tokens",
  validate(authValidation.refreshTokens),
  catchAsync(authController.refreshTokens)
);

router.post(
  "/send-verification-email",
  authenticate(),
  catchAsync(authController.sendVerificationEmail)
);

router.post(
  "/verify-email",
  validate(authValidation.verifyEmail),
  catchAsync(authController.verifyEmail)
);

router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  catchAsync(authController.forgotPassword)
);

router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  catchAsync(authController.resetPassword)
);

export default router;
