import mongoose from "mongoose";

const approvalSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Expense",
    required: true,
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["approved", "rejected"],
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  rejectReason: {
    type: String,
    maxlength: [200, "Rejection reason cannot exceed 200 characters"],
  },
});

approvalSchema.index({ expenseId: 1 });
approvalSchema.index({ managerId: 1 });

const Approval = mongoose.model("Approval", approvalSchema);
export default Approval;
