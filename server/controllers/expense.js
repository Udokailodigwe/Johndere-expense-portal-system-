import Expense from "../models/expense.js";
import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { pickFields, parseDate } from "../utils/utility.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  expenseSubmittedTemplate,
  expenseCreatedConfirmationTemplate,
} from "../utils/emailTemplate.js";

export const createExpense = async (req, res) => {
  req.body.userId = req.user.userId;
  const expense = await Expense.create(req.body);

  const employee = await User.findById(req.user.userId).select("name email");
  const manager = await User.findOne({ role: "manager" }).select("name email");

  try {
    await sendEmail({
      to: employee.email,
      subject: "Expense Submitted Successfully",
      html: expenseCreatedConfirmationTemplate(employee, expense),
    });

    if (manager) {
      await sendEmail({
        to: manager.email,
        subject: `New Expense Submission from ${employee.name}`,
        html: expenseSubmittedTemplate(manager, employee, expense),
      });
    }
  } catch (error) {
    console.log("Email notification failed:", error);
  }

  res.status(StatusCodes.CREATED).json({
    message: "Expense submitted successfully",
    expense,
  });
};

export const getExpenses = async (req, res) => {
  // Use validated query data if available, otherwise fall back to req.query
  const queryData = req.validatedQuery || req.query;
  const {
    status,
    category,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = queryData;

  const query = {
    userId: req.user.userId,
    isDeleted: false, // Exclude soft-deleted expenses
  };

  if (status) query.status = status;
  if (category) query.category = category;

  // Date range filter
  if (startDate || endDate) {
    query.expenseDate = {};
    if (startDate) query.expenseDate.$gte = new Date(startDate);
    if (endDate) query.expenseDate.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [expenses, totalExpenses] = await Promise.all([
    Expense.find(query)
      .populate("userId", "name email")
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Expense.countDocuments(query),
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalExpenses / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.status(StatusCodes.OK).json({
    message: "Expenses retrieved successfully",
    totalExpenses,
    expenses,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit),
      totalItems: totalExpenses,
    },
  });
};

export const getAllEmployeeExpenses = async (req, res) => {
  // Use validated query data if available, otherwise fall back to req.query
  const queryData = req.validatedQuery || req.query;
  const {
    status,
    category,
    startDate,
    endDate,
    userId,
    page = 1,
    limit = 10,
  } = queryData;

  const query = {
    isDeleted: false, // Exclude soft-deleted expenses
  };

  if (userId) query.userId = userId;

  if (status) query.status = status;
  if (category) query.category = category;

  if (startDate || endDate) {
    query.expenseDate = {};
    if (startDate) query.expenseDate.$gte = new Date(startDate);
    if (endDate) query.expenseDate.$lte = new Date(endDate);
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [expenses, totalExpenses] = await Promise.all([
    Expense.find(query)
      .populate("userId", "name email")
      .sort({ expenseDate: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Expense.countDocuments(query),
  ]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalExpenses / parseInt(limit));
  const hasNextPage = parseInt(page) < totalPages;
  const hasPrevPage = parseInt(page) > 1;

  res.status(StatusCodes.OK).json({
    message: "All employee expenses retrieved successfully",
    totalExpenses,
    expenses,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      hasNextPage,
      hasPrevPage,
      limit: parseInt(limit),
      totalItems: totalExpenses,
    },
  });
};

export const getExpenseById = async (req, res) => {
  const { id } = req.params;
  const expense = await Expense.findById(id).populate("userId", "name email");

  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  res.status(StatusCodes.OK).json({ expense });
};

export const updateExpense = async (req, res) => {
  const { id } = req.params;

  const existingExpense = await Expense.findOne({
    _id: id,
    userId: req.user.userId,
  });

  if (!existingExpense) {
    throw new NotFoundError("Expense not found");
  }

  if (existingExpense.status !== "pending") {
    throw new BadRequestError("Cannot edit expense that is not pending");
  }

  // Define allowed fields for update
  const allowedFields = [
    "amount",
    "description",
    "category",
    "expenseDate",
    "notes",
  ];

  // Pick only allowed fields from request body using utility function
  const updateData = pickFields(req.body, allowedFields);

  // Handle special transformations using utility function
  if (updateData.expenseDate) {
    updateData.expenseDate = parseDate(updateData.expenseDate) || new Date();
  }

  const expense = await Expense.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(StatusCodes.OK).json({
    message: "Expense updated successfully",
    expense,
  });
};

export const deleteExpense = async (req, res) => {
  const { id } = req.params;

  // Soft delete the expense
  const expense = await Expense.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true }
  );

  if (!expense) {
    throw new NotFoundError("Expense not found");
  }

  res.status(StatusCodes.OK).json({
    message: "Expense deleted successfully",
    expenseId: id,
  });
};
