import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  approveExpenseThunk,
  employeeApprovalsThunk,
  getAllApprovalsThunk,
} from "./approvalThunk";
import toast from "react-hot-toast";

const initialRejectState = {
  rejectReason: "",
  selectedExpense: null,
  isRejectModalOpen: false,
};

const initialState = {
  isLoading: false,
  error: null,
  pendingExpenses: [],
  resolvedExpenses: [],
  allApprovals: [],
  ...initialRejectState,
};

export const approveExpense = createAsyncThunk(
  "approval/approveExpense",
  async (approval, thunkAPI) => {
    const { id, ...approvalData } = approval;
    return await approveExpenseThunk(
      `/approvals/${id}`,
      approvalData,
      thunkAPI
    );
  }
);

export const employeeApprovals = createAsyncThunk(
  "approval/employeeApprovals",
  async (_, thunkAPI) => {
    return await employeeApprovalsThunk("/approvals/", thunkAPI);
  }
);

export const getAllApprovals = createAsyncThunk(
  "approval/getAllApprovals",
  async (_, thunkAPI) => {
    return await getAllApprovalsThunk("/approvals/all", thunkAPI);
  }
);

const approvalSlice = createSlice({
  name: "approval",
  initialState,
  reducers: {
    setRejectReason: (state, action) => {
      state.rejectReason = action.payload;
    },
    setSelectedExpense: (state, action) => {
      state.selectedExpense = action.payload;
    },
    setRejectModalOpen: (state, action) => {
      state.isRejectModalOpen = action.payload;
    },
    clearRejectData: (state) => {
      state.rejectReason = "";
      state.selectedExpense = null;
      state.isRejectModalOpen = false;
    },
    setPendingExpenses: (state, action) => {
      state.pendingExpenses = action.payload;
    },
  },
  extraReducers: (builder) => {
    //approveExpense
    builder
      .addCase(approveExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(approveExpense.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        const { expense } = payload;
        state.pendingExpenses = state.pendingExpenses.filter(
          (pendingExpense) => pendingExpense._id !== expense._id
        );

        toast.success("Expense approved successfully");
      })
      .addCase(approveExpense.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      });

    //employeeApprovals
    builder
      .addCase(employeeApprovals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(employeeApprovals.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.resolvedExpenses = payload;
      })
      .addCase(employeeApprovals.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      });

    //getAllApprovals
    builder
      .addCase(getAllApprovals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllApprovals.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        state.allApprovals = payload;
      })
      .addCase(getAllApprovals.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      });
  },
});

export const {
  setRejectReason,
  setSelectedExpense,
  setRejectModalOpen,
  clearRejectData,
  setPendingExpenses,
} = approvalSlice.actions;

export default approvalSlice.reducer;
