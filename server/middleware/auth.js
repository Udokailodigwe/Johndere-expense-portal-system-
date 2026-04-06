import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import User from "../models/user.js";
import { UnauthenticatedError } from "../errors/index.js";

export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from HTTP-only cookie first
    let token = req.cookies.token;

    // Fallback to Authorization header for backward compatibility
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      throw new UnauthenticatedError("Authentication required");
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.userId).select("-password");

    if (!user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        error: "Invalid token. User not found.",
      });
    }
    req.user = {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    // JWT-specific error handling
    if (error.name === "JsonWebTokenError") {
      throw new UnauthenticatedError("Invalid authentication token");
    }

    if (error.name === "TokenExpiredError") {
      throw new UnauthenticatedError(
        "Authentication token expired. Please login again"
      );
    }

    if (error.name === "NotBeforeError") {
      throw new UnauthenticatedError("Authentication token not yet valid");
    }

    // Re-throw our custom errors
    if (error instanceof UnauthenticatedError) {
      throw error;
    }
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You are not authorized to access this resource",
      });
    }
    next();
  };
};

export const setManagerRoute = (req, res, next) => {
  req.isManagerRoute = true;
  next();
};

export const setEmployeeRoute = (req, res, next) => {
  req.isManagerRoute = false;
  next();
};

// Bootstrap route to create first manager
export const setBootstrapRoute = (req, res, next) => {
  req.isManagerRoute = true;
  next();
};
