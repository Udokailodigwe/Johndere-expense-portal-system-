import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
import { sendEmail } from "../utils/sendEmail.js";
import { welcomeTempPasswordEmail } from "../utils/emailTemplate.js";

const isProduction = process.env.NODE_ENV === "production";
/** SameSite=None requires Secure; browsers drop the cookie if Secure is false. Use lax on http (local dev). */
const tokenCookieOptions = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

export const register = async (req, res) => {
  const { name, email } = req.body;
  const tempPassword = Math.random().toString(36).slice(-8);

  if (!name || !email) {
    throw new BadRequestError("name and email are required");
  }

  // Check if email is already registered
  const existingUser = await User.findOne({
    email: String(email).toLowerCase().trim(),
  });
  if (existingUser) {
    throw new BadRequestError("Email already registered");
  }

  const role = req.isManagerRoute ? "manager" : "employee";

  const user = await User.create({
    name,
    email,
    password: tempPassword,
    role,
  });

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const activateUrl = `${baseUrl.replace(/\/$/, "")}/activate-account`;
  const hasEmailCreds =
    Boolean(process.env.EMAIL_USER?.trim()) &&
    Boolean(process.env.EMAIL_PASSWORD?.trim());

  if (hasEmailCreds) {
    const { html, text } = welcomeTempPasswordEmail({
      name: user.name,
      tempPassword,
      activateUrl,
    });
    const mailed = await sendEmail({
      to: user.email,
      subject: "Welcome — activate your Expense Portal account",
      text,
      html,
    });
    if (!mailed.success) {
      console.error("Signup email failed:", mailed.error);
      console.log(`Temporal password for ${email} is: ${tempPassword}`);
    }
  } else {
    console.log(`Temporal password for ${email} is: ${tempPassword}`);
  }

  return res.status(StatusCodes.CREATED).json({
    message: "User registered successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
    },
    tempPassword: tempPassword,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError("Please provide required credentials");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("User not found");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Password is incorrect");
  }

  if (!user.active) {
    return res.status(403).json({
      message:
        "You must set your personal password before login. Use activate-account link to set your password",
    });
  }

  const token = user.createJWT();

  res.cookie("token", token, tokenCookieOptions);

  res.status(StatusCodes.CREATED).json({
    message: "Login successful",
  });
};

export const getCurrentUser = async (req, res) => {
  const user = req.user;

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      approvals: user.approvals,
    },
  });
};

export const logout = async (req, res) => {
  res.clearCookie("token", { ...tokenCookieOptions, maxAge: 0 });

  res.status(StatusCodes.OK).json({
    message: "Logged out successfully",
  });
};

export const activateAccount = async (req, res) => {
  const { email, code, password } = req.body;
  if (!email || !code || !password) {
    throw new BadRequestError("Please provide required credentials");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthenticatedError("User not found");
  }

  // Verify the current password (temporary password)
  const isCodeCorrect = await user.comparePassword(code);
  if (!isCodeCorrect) {
    throw new UnauthenticatedError("Invalid one-time password");
  }

  // Only allow password reset for inactive users (those with temp passwords)
  if (user.active) {
    throw new BadRequestError(
      "Account is already activated. Use change password instead.",
    );
  }

  user.password = password;
  user.active = true;
  await user.save();
  const token = user.createJWT();

  return res.status(StatusCodes.OK).json({
    message: "Password updated, account activated",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      token,
    },
  });
};
