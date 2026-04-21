import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
import { sendEmail } from "../utils/sendEmail.js";
import { welcomeTempPasswordEmail } from "../utils/emailTemplate.js";

const isProduction = process.env.NODE_ENV === "production";

const tokenCookieOptions = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  path: "/",
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const normalizeEmail = (email) => String(email).toLowerCase().trim();

export const register = async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new BadRequestError("name and email are required");
  }

  const normalizedEmail = normalizeEmail(email);
  const tempPassword = Math.random().toString(36).slice(-8);
  const role = req.isManagerRoute ? "manager" : "employee";

  let user;

  try {
    user = await User.create({
      name,
      email: normalizedEmail,
      password: tempPassword,
      role,
    });
  } catch (err) {
    if (err.code === 11000) {
      throw new BadRequestError("Email already registered");
    }
    throw err;
  }

  const baseUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const activateUrl = `${baseUrl.replace(/\/$/, "")}/activate-account`;

  const hasEmailCreds = process.env.EMAIL_USER && process.env.EMAIL_PASSWORD;

  if (hasEmailCreds) {
    const { html, text } = welcomeTempPasswordEmail({
      name: user.name,
      tempPassword,
      activateUrl,
    });

    sendEmail({
      to: user.email,
      subject: "Activate your account",
      text,
      html,
    }).catch((err) => {
      console.error("Email failed:", err);
    });
  } else {
    console.log(`Temp password for ${email}: ${tempPassword}`);
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
    tempPassword,
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide credentials");
  }

  const user = await User.findOne({
    email: normalizeEmail(email),
  }).select("+password");

  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  if (!user.active) {
    return res.status(StatusCodes.FORBIDDEN).json({
      message: "Activate your account before login",
    });
  }

  const token = user.createJWT();

  res.cookie("token", token, tokenCookieOptions);

  return res.status(StatusCodes.OK).json({
    message: "Login successful",
  });
};

export const getCurrentUser = async (req, res) => {
  const { name, email, role, active, approvals } = req.user;

  return res.status(StatusCodes.OK).json({
    user: { name, email, role, active, approvals },
  });
};

export const logout = async (req, res) => {
  res.clearCookie("token", { ...tokenCookieOptions, maxAge: 0 });

  return res.status(StatusCodes.OK).json({
    message: "Logged out successfully",
  });
};

export const activateAccount = async (req, res) => {
  const { email, code, password } = req.body;

  if (!email || !code || !password) {
    throw new BadRequestError("Missing required fields");
  }

  const user = await User.findOne({
    email: normalizeEmail(email),
  }).select("+password");

  if (!user) {
    throw new UnauthenticatedError("User not found");
  }

  if (user.active) {
    throw new BadRequestError("Account already activated");
  }

  const isCodeCorrect = await user.comparePassword(code);
  if (!isCodeCorrect) {
    throw new UnauthenticatedError("Invalid activation code");
  }

  user.password = password;
  user.active = true;

  await user.save();

  const token = user.createJWT();

  return res.status(StatusCodes.OK).json({
    message: "Account activated",
    user: {
      name: user.name,
      email: user.email,
      role: user.role,
      active: user.active,
      token,
    },
  });
};
