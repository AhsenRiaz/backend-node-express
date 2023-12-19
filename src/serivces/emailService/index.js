import nodemailer from "nodemailer";
import logger from "../../config/logger.js";
import config from "../../config/config.js";
import template from "./template.js";

var transport = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "5995789dededae",
    pass: "4f1c3f9498fc7f",
  },
});

if (config.NODE_ENV !== "test") {
  transport
    .verify()
    .then(() => logger.info("Connected to email server"))
    .catch(() => logger.warn("Unable to connect to email server"));
}

export const sendEmail = async (to, subject, html) => {
  try {
    const msg = {
      from: `${config.APP_NAME} <${config.EMAIL_FROM}>`,
      to,
      subject,
      html,
    };
    const result = await transport.sendMail(msg);
  } catch (error) {
    throw new Error("email not sent");
  }
};

export const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset Password';
  const resetPasswordUrl = `${config.FRONTEND_URL}/reset-password?token=${token}`;
  const html = template.resetPassword(resetPasswordUrl, config.APP_NAME);
  await sendEmail(to, subject, html)

}

export const sendVerificationEmail = async (to, token) => {
  const subject = "Email Verification";
  const verificationEmailUrl = `${config.FRONTEND_URL}/verify-email?token=${token}`;
  const html = template.verifyEmail(verificationEmailUrl, config.APP_NAME);
  await sendEmail(to, subject, html);
};

export default {
  sendEmail,
  sendVerificationEmail,
  sendResetPasswordEmail,
};
