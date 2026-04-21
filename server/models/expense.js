import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Description must be at least 3 characters long"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      enum: [
        "travel",
        "meals",
        "office_supplies",
        "equipment",
        "training",
        "other",
      ],
      default: "other",
    },
    expenseDate: {
      type: Date,
      default: Date.now,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

expenseSchema.index({ userId: 1, status: 1 });
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ category: 1 });

expenseSchema.index({ userId: 1, isDeleted: 1 });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;
