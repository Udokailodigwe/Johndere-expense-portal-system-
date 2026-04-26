import mongoose from "mongoose";
import Expense from "../models/expense.js";
import Approval from "../models/approval.js";
import User from "../models/user.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import { sendEmail } from "../utils/sendEmail.js";
import { expenseStatusUpdateTemplate } from "../utils/emailTemplate.js";

// Get all approvals
export const getAllApprovals = async (req, res) => {
  const approvals = await Approval.find({})
    .populate({
      path: "expenseId",
      select: "amount description category expenseDate userId",
      populate: {
        path: "userId",
        select: "name email role",
      },
    })
    .populate({
      path: "managerId",
      select: "name email role",
    })
    .sort({ date: -1 });

  // approvals stats
  const numOfTreatedExpenses = approvals.length;
  const approvedCount = approvals.filter(
    (approval) => approval.status === "approved",
  ).length;
  const rejectedCount = approvals.filter(
    (approval) => approval.status === "rejected",
  ).length;

  res.status(StatusCodes.OK).json({
    message: "All approvals retrieved successfully",
    statistics: {
      numOfTreatedExpenses,
      approvedCount,
      rejectedCount,
    },
    approvals: approvals,
  });
};

// Get employee's approved expenses history
export const getEmployeeApprovals = async (req, res) => {
  const userId = req.user.userId;

  // Find all approvals for expenses created by this employee
  const approvals = await Approval.find({
    expenseId: { $exists: true },
  })
    .populate({
      path: "expenseId",
      match: { userId: new mongoose.Types.ObjectId(userId) },
      select: "amount description category expenseDate notes status",
    })
    .populate({
      path: "managerId",
      select: "name email role",
    });

  // Filter out null expenseId (expenses that don't belong to this user)
  const validApprovals = approvals.filter(
    (approval) => approval.expenseId !== null,
  );

  // Calculate statistics
  const numOfTreatedExpenses = validApprovals.length;
  const approvedCount = validApprovals.filter(
    (approval) => approval.status === "approved",
  ).length;
  const rejectedCount = validApprovals.filter(
    (approval) => approval.status === "rejected",
  ).length;

  // Get employee info
  const employee = await User.findById(userId).select("name email role");

  res.status(StatusCodes.OK).json({
    message: "Resolved expenses",
    employee: {
      name: employee.name,
      email: employee.email,
      role: employee.role,
    },
    statistics: {
      numOfTreatedExpenses,
      approvedCount,
      rejectedCount,
    },
    approvals: validApprovals,
  });
};

// Approve expense (manager only)
// export const approveExpense = async (req, res) => {
//   const { id } = req.params;
//   const { status, rejectReason } = req.body;

//   if (!["approved", "rejected"].includes(status)) {
//     throw new BadRequestError("Status must be 'approved' or 'rejected'");
//   }

//   if (status === "rejected" && !rejectReason) {
//     throw new BadRequestError("rejectReason is required when rejecting");
//   }

//   const expense = await Expense.findById(id);
//   if (!expense) {
//     throw new NotFoundError("Expense not found");
//   }

//   // guard state transitions
//   if (expense.status !== "pending") {
//     throw new BadRequestError(
//       `Cannot change status from '${expense.status}' to '${status}'`
//     );
//   }

//   const approvalData = {
//     expenseId: id,
//     managerId: req.user.userId,
//     status,
//     ...(status === "rejected" && { rejectReason }),
//   };

//   const approval = await Approval.create(approvalData);

//   const update = {
//     $set: { status },
//   };

//   const updatedExpense = await Expense.findByIdAndUpdate(id, update, {
//     new: true,
//   });

//   await User.findByIdAndUpdate(req.user.userId, {
//     $push: { approvals: approval._id },
//   });

//   if (!updatedExpense) {
//     throw new NotFoundError("Expense not found");
//   }

//   const employee = await User.findById(expense.userId).select("name email");
//   const manager = await User.findById(req.user.userId).select("name email");

//   try {
//     await sendEmail({
//       to: employee.email,
//       subject: `Expense ${status === "approved" ? "Approved" : "Rejected"}`,
//       html: expenseStatusUpdateTemplate(
//         employee,
//         updatedExpense,
//         manager,
//         status,
//         rejectReason
//       ),
//     });
//   } catch (error) {
//     console.log("Email notification failed:", error);
//   }

//   res.status(StatusCodes.OK).json({
//     message: `Expense ${status} successfully`,
//     expense: updatedExpense,
//   });
// };

//----Approval expense( managers  only)---
export const approveExpense = async (req, res) => {
  const { id } = req.params;
  const { status, rejectReason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new BadRequestError("Status must be 'approved' or 'rejected'");
  }

  if (status === "rejected" && !rejectReason) {
    throw new BadRequestError("rejectReason is required when rejecting");
  }

  // atomic check + update (prevents race condition under load)
  const updatedExpense = await Expense.findOneAndUpdate(
    { _id: id, status: "pending" }, // only update if still pending
    { $set: { status } },
    { new: true },
  );

  if (!updatedExpense) {
    throw new BadRequestError("Expense already processed or does not exist");
  }

  // create approval record
  const approval = await Approval.create({
    expenseId: id,
    managerId: req.user.userId,
    status,
    ...(status === "rejected" && { rejectReason }),
  });

  // update manager approvals (non-blocking candidate, but cheap enough)
  await User.findByIdAndUpdate(req.user.userId, {
    $push: { approvals: approval._id },
  });

  //  respond immediately (critical for performance)
  res.status(StatusCodes.OK).json({
    message: `Expense ${status} successfully`,
    expense: updatedExpense,
  });

  // async side effects (non-blocking)
  setImmediate(async () => {
    try {
      const [employee, manager] = await Promise.all([
        User.findById(updatedExpense.userId).select("name email"),
        User.findById(req.user.userId).select("name email"),
      ]);

      await sendEmail({
        to: employee.email,
        subject: `Expense ${status === "approved" ? "Approved" : "Rejected"}`,
        html: expenseStatusUpdateTemplate(
          employee,
          updatedExpense,
          manager,
          status,
          rejectReason,
        ),
      });
    } catch (error) {
      console.log("Email notification failed:", error);
    }
  });
};
