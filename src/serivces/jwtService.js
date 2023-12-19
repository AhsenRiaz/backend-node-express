import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import moment from "moment";
import APIError from "../utils/apiError.js";

const sign = async (userId, expires, secret) => {
  try {
    const payload = {
      sub: userId,
      iat: moment.unix().seconds(),
      exp: expires.unix(),
    };

    return jwt.sign(payload, secret);
  } catch (error) {
    throw new APIError(error.message, httpStatus.UNAUTHORIZED);
  }
};


export default {sign}