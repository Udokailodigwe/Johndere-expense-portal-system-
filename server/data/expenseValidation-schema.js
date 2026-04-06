import Joi from "joi";

// Common helpers
const objectId = Joi.string()
  .regex(/^[0-9a-fA-F]{24}$/)
  .message("Invalid ObjectId");

// Schemas
export const createExpenseSchema = Joi.object({
  amount: Joi.number().positive().required(),
  description: Joi.string().min(3).max(500).required(),
  category: Joi.string()
    .valid(
      "travel",
      "meals",
      "office_supplies",
      "equipment",
      "training",
      "other"
    )
    .optional(),
  expenseDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).optional(),
}).unknown(false);

export const getExpensesQuerySchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").optional(),
  category: Joi.string()
    .valid(
      "travel",
      "meals",
      "office_supplies",
      "equipment",
      "training",
      "other"
    )
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
}).unknown(false);

export const getAllEmployeeExpensesQuerySchema = Joi.object({
  status: Joi.string().valid("pending", "approved", "rejected").optional(),
  category: Joi.string()
    .valid(
      "travel",
      "meals",
      "office_supplies",
      "equipment",
      "training",
      "other"
    )
    .optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  userId: objectId.optional(), // Allow filtering by specific user
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
}).unknown(false);

export const getExpenseByIdSchema = Joi.object({
  id: objectId.required(),
}).unknown(false);

export const updateExpenseSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  description: Joi.string().min(3).max(500).optional(),
  category: Joi.string()
    .valid(
      "travel",
      "meals",
      "office_supplies",
      "equipment",
      "training",
      "other"
    )
    .optional(),
  expenseDate: Joi.date().iso().optional(),
  notes: Joi.string().max(1000).optional(),
})
  .min(1)
  .unknown(false);

export const approveExpenseSchema = Joi.object({
  status: Joi.string().valid("approved", "rejected").required(),
  rejectReason: Joi.when("status", {
    is: "rejected",
    then: Joi.string().max(200).required(),
    otherwise: Joi.forbidden(),
  }),
}).unknown(false);
