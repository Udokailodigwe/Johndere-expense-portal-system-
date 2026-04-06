import express from "express";
import {
  createExpense,
  getExpenses,
  getAllEmployeeExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.js";
import { validate } from "../middleware/validate-request.js";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createExpenseSchema,
  getExpensesQuerySchema,
  getAllEmployeeExpensesQuerySchema,
  updateExpenseSchema,
  getExpenseByIdSchema,
} from "../data/expenseValidation-schema.js";

const router = express.Router();

router.post("/", authenticate, validate(createExpenseSchema), createExpense);

router.get(
  "/",
  authenticate,
  validate(getExpensesQuerySchema, "query"),
  getExpenses
);

// Manager-only route to get all expenses from all employees
router.get(
  "/all",
  authenticate,
  requireRole("manager"),
  validate(getAllEmployeeExpensesQuerySchema, "query"),
  getAllEmployeeExpenses
);

router.get(
  "/:id",
  authenticate,
  validate(getExpenseByIdSchema),
  getExpenseById
);

router.put("/:id", authenticate, validate(updateExpenseSchema), updateExpense);

router.delete("/:id", authenticate, deleteExpense);

export default router;
