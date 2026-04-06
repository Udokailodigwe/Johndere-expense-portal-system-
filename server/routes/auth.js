import express from "express";
import {
  login,
  logout,
  getCurrentUser,
  activateAccount,
  register,
} from "../controllers/auth.js";
import { validate } from "../middleware/validate-request.js";
import {
  registerValidationSchema,
  loginValidationSchema,
  activateAccountSchema,
} from "../data/userValidation-schema.js";
import {
  requireRole,
  authenticate,
  setManagerRoute,
  setEmployeeRoute,
  setBootstrapRoute,
} from "../middleware/auth.js";

const router = express.Router();

// Bootstrap route to create first manager
router.post(
  "/bootstrap",
  setBootstrapRoute,
  validate(registerValidationSchema),
  register
);

// employee regirstration route
router.post(
  "/register",
  setEmployeeRoute,
  validate(registerValidationSchema),
  register
);

router.post(
  "/register/manager",
  authenticate,
  requireRole("manager"),
  setManagerRoute,
  validate(registerValidationSchema),
  register
);

router.post("/login", validate(loginValidationSchema), login);

router.get("/me", authenticate, getCurrentUser);

router.post("/logout", logout);

router.post(
  "/activate-account",
  validate(activateAccountSchema),
  activateAccount
);

export default router;
