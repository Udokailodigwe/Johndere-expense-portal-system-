import { createSelector } from "@reduxjs/toolkit";

export const selectResolvedExpenses = createSelector(
  (state) => state.expense.expenses,
  (expenses) =>
    expenses.filter((e) => ["approved", "rejected"].includes(e.status))
);
