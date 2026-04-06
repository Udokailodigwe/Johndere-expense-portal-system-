import express from "express";
import {
  getAllApprovals,
  getEmployeeApprovals,
  approveExpense,
} from "../controllers/approval.js";
import { validate } from "../middleware/validate-request.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import { approveExpenseSchema } from "../data/expenseValidation-schema.js";

const router = express.Router();

// Get manager's approval history
router.get("/all", authenticate, requireRole("manager"), getAllApprovals);

// Get employee's approved expenses history
router.get(
  "/",
  authenticate,
  // requireRole(["employee", "manager"]),
  getEmployeeApprovals
);

// Approve/reject expense (manager only)
router.put(
  "/:id",
  authenticate,
  requireRole("manager"),
  validate(approveExpenseSchema),
  approveExpense
);

export default router;
