import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./features/user/userSlice";
import expenseSlice from "./features/expense/expenseSlice";
import approvalSlice from "./features/approval/approvalSlice";

export const store = configureStore({
  reducer: {
    user: userSlice,
    expense: expenseSlice,
    approval: approvalSlice,
  },

  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       ignoredActions: ["persist/PERSIST"],
  //     },
  //   }),
});
