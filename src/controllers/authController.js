import APIError from "../utils/apiError.js";
import httpStatus from "http-status";
import config from "../config/config.js";
import User from "../models/userModel.js";
import Role from "../models/roleModel.js";
import Token from "../models/tokenModel.js";
import { generateAuthTokens } from "../serivces/tokenService.js";
import tokenService from "../serivces/tokenService.js";
import { Types } from "mongoose";
import emailService from "../serivces/emailService/index.js";

const signup = async (req, res) => {
  const role = await Role.getRoleByName("User");
  req.body.roles = [role.id];
  const user = await User.createUser(req.body);
  const tokens = await generateAuthTokens(user);

  return res.json({
    success: true,
    data: {
      user,
      tokens,
    },
  });
};

export const signIn = async (req, res) => {
  const user = await User.getUserByUserName(req.body.userName);
  if (!user || !(await user.isPasswordMatch(req.body.password))) {
    throw new APIError(
      "Incorrect username or password",
      httpStatus.BAD_REQUEST
    );
  }

  const tokens = await tokenService.generateAuthTokens(user);

  return res.json({
    success: true,
    data: { user, tokens },
  });
};

export const current = async (req, res) => {
  const user = await User.getUserById(req.user.id);
  if (!user) {
    throw new APIError("User not found", httpStatus.NOT_FOUND);
  }

  return res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    userName: user.userName,
    avatar: user.avatarUrl,
  });
};

export const getMe = async (req, res) => {
  const user = await User.getUserById(req.user.id);
  if (!user) {
    "User not found", httpStatus.NOT_FOUND;
  }

  return res.json({
    success: true,
    data: user,
  });
};

export const updateMe = async (req, res) => {
  const user = await User.updateUserById(req.user.id, req.body);
  return res.json({
    success: true,
    data: user,
  });
};

export const signout = async (req, res) => {
  await Token.revokeToken(req.body.refreshToken, config.TOKEN_TYPES.REFRESH);

  return res.json({
    success: true,
    data: "Signout success",
  });
};

export const refreshTokens = async (req, res) => {
  const refreshTokenDoc = await tokenService.verifyToken(
    req.body.refreshToken,
    config.TOKEN_TYPES.REFRESH
  );

  const user = await User.getUserById(refreshTokenDoc.user);

  if (!user) {
    throw new Error();
  }

  await refreshTokenDoc.deleteOne();

  const tokens = await tokenService.generateAuthTokens(user);

  return res.json({
    success: true,
    data: {
      tokens,
    },
  });
};

export const sendVerificationEmail = async (req, res) => {
  const user = await User.getUserByEmail(req.user.email);
  if (user.confirmed) {
    throw new APIError("Email already verified", httpStatus.BAD_REQUEST);
  }

  const verifyEmailToken = await tokenService.generateVerifyEmailToken(
    req.user
  );
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  return res.json({
    success: true,
    data: "Send verification email success",
  });
};

export const verifyEmail = async (req, res) => {
  const verifyEmailTokenDoc = await tokenService.verifyToken(
    req.query.token,
    config.TOKEN_TYPES.VERIFY_EMAIL
  );

  const user = await User.getUserById(verifyEmailTokenDoc.user);
  if (!user) {
    throw new Error();
  }

  await Token.deleteMany({
    user: user.id,
    type: config.TOKEN_TYPES.VERIFY_EMAIL,
  });
  await User.updateUserById(user.id, { confirmed: true });

  return res.json({
    success: true,
    data: "Verify email success",
  });
};

export const forgotPassword = async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  return res.json({
    success: true,
    data: "Send forgot password email success",
  });
};

export const resetPassword = async (req, res) => {
  const resetPasswordToken = await tokenService.verifyToken(
    req.query.token,
    config.TOKEN_TYPES.RESET_PASSWORD
  );
  const user = await User.getUserById(resetPasswordToken.user);
  if (!user) {
    throw new Error();
  }

  await Token.deleteMany({
    user: user.id,
    type: config.TOKEN_TYPES.RESET_PASSWORD,
  });
  await User.updateUserById(user.id, req.body.password);
  return res.json({
    success: true,
    data: "Reset password success",
  });
};

export default {
  signup,
  signIn,
  current,
  getMe,
  updateMe,
  signout,
  refreshTokens,
  sendVerificationEmail,
  verifyEmail,
  resetPassword,
  forgotPassword,
};
