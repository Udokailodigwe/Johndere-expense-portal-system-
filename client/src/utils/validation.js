import { z } from "zod";
import toast from "react-hot-toast";

// Define the expense form schema using Zod
export const expenseFormSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  description: z
    .string()
    .min(1, "Description is required")
    .min(3, "Description must be at least 3 characters")
    .max(500, "Description must be less than 500 characters"),
  category: z.string().optional(),
  expenseDate: z.string().optional(),
  notes: z
    .string()
    .max(1000, "Notes must be less than 1000 characters")
    .optional(),
});

// Validation function using Zod
export const validateExpenseForm = (formData) => {
  try {
    expenseFormSchema.parse(formData);
    return true;
  } catch (error) {
    if (
      error instanceof z.ZodError &&
      error.errors &&
      error.errors.length > 0
    ) {
      const firstError = error.errors[0];
      toast.error(firstError.message);
    } else {
      toast.error("Validation failed");
    }
    return false;
  }
};
