import moment from "moment";
import config from "../config/config.js";
import APIError from "../utils/apiError.js";
import User from "../models/userModel.js";
import Token from "../models/tokenModel.js";
import httpStatus from "http-status";
import crypto from "crypto";
import jwtService from "./jwtService.js";

export const generateRandomToken = async (tokenType, length = 66) => {
  if (tokenType === "resetPassword" || "verifyEmail" ) {
    const resetPasswordToken = crypto.randomBytes(length).toString("hex");
    console.log("resetToken", resetPasswordToken);
    return resetPasswordToken;
  } else {
    let randomToken = crypto.randomBytes(length).toString("base64");
    return randomToken;
  }
};

export const verifyToken = async (token, type) => {
  const tokenDoc = await Token.findOne({ token, type, blacklisted: false });
  console.log("tokenDoc", tokenDoc)
  if (!tokenDoc) {
    throw new APIError("Token not found", httpStatus.UNAUTHORIZED);
  }

  if (moment(tokenDoc.expiresAt).format() < moment().format()) {
    throw new APIError("Token has expired", httpStatus.UNAUTHORIZED);
  }
  return tokenDoc;
};

export const generateAuthTokens = async (user) => {
  const accessTokenExpires = moment().add(
    config.JWT_ACCESS_TOKEN_EXPIRATION_MINUTES,
    "minutes"
  );
  const accessToken = await jwtService.sign(
    user.id,
    accessTokenExpires,
    config.JWT_SECRET
  );

  const refreshTokenExpires = moment().add(
    config.REFRESH_TOKEN_EXPIRATION_DAYS,
    "days"
  );

  const refreshToken = await generateRandomToken();
  const token = await Token.saveToken(
    refreshToken,
    user.id,
    refreshTokenExpires.format(),
    config.TOKEN_TYPES.REFRESH
  );


  return {
    accessToken: {
      token: accessToken,
      expires: accessTokenExpires.format(),
    },
    refreshToken: {
      token: refreshToken,
      expires: refreshTokenExpires.format(),
    },
  };
};

export const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(
    config.VERIFY_EMAIL_TOKEN_EXPIRATION_MINUTES,
    "minutes"
  );
  const verifyEmailToken = await generateRandomToken(config.TOKEN_TYPES.VERIFY_EMAIL);
  await Token.saveToken(
    verifyEmailToken,
    user.id,
    expires,
    config.TOKEN_TYPES.VERIFY_EMAIL
  );
  return verifyEmailToken;
};

export const generateResetPasswordToken = async (email) => {
  const user = await User.getUserByEmail(email);
  if (!user) {
    throw new APIError("No user found with this email", httpStatus.NOT_FOUND);
  }

  const expires = moment().add(
    config.RESET_PASSWORD_TOKEN_EXPIRATION_MINUTES,
    "minutes"
  );
  const resetPasswordToken = await generateRandomToken(
    config.TOKEN_TYPES.RESET_PASSWORD
  );
  await Token.saveToken(
    resetPasswordToken,
    user.id,
    expires,
    config.TOKEN_TYPES.RESET_PASSWORD
  );
  return resetPasswordToken;
};

export default {
  generateRandomToken,
  generateAuthTokens,
  generateVerifyEmailToken,
  generateResetPasswordToken,
  verifyToken,
};
