import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { getExpenses } from "../features/expense/expenseSlice";
import { setFormValues } from "../features/expense/expenseSlice";

export const useEditExpenseForm = (expenseId, expenses) => {
  const dispatch = useDispatch();
  const isEditMode = Boolean(expenseId);
  const expenseData = isEditMode
    ? expenses.find((expense) => expense._id === expenseId)
    : null;

  useEffect(() => {
    if (isEditMode && expenses.length === 0) {
      dispatch(getExpenses());
    }
  }, [isEditMode, expenses.length, dispatch]);

  useEffect(() => {
    if (isEditMode && expenseData) {
      dispatch(setFormValues(expenseData));
    }
  }, [isEditMode, expenseData, dispatch]);

  return { isEditMode, expenseData };
};
