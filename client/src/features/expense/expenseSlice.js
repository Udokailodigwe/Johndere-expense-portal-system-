import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import {
  createExpenseThunk,
  getExpensesThunk,
  editExpenseThunk,
  deleteExpenseThunk,
  getAllEmployeeExpensesThunk,
} from "./expenseThunk";

const initialState = {
  formData: {
    amount: "",
    description: "",
    category: "",
    expenseDate: "",
    notes: "",
  },
  isLoading: false,
  error: null,
  expenses: [],
  allEmployeeExpenses: [],
  totalExpenses: 0,
  searchParams: {
    search: "",
    status: "",
    category: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  },
  pagination: null,
};

// Async thunks
export const createExpense = createAsyncThunk(
  "expense/createExpense",
  async (expenseData, thunkAPI) => {
    return await createExpenseThunk("/expenses", expenseData, thunkAPI);
  }
);

export const getExpenses = createAsyncThunk(
  "expense/getExpenses",
  async (queryParams, thunkAPI) => {
    return await getExpensesThunk("/expenses", {
      ...thunkAPI,
      arg: queryParams,
    });
  }
);

export const editExpense = createAsyncThunk(
  "expense/editExpense",
  async (expenseData, thunkAPI) => {
    const { id, ...updateData } = expenseData;
    return await editExpenseThunk(`/expenses/${id}`, updateData, thunkAPI);
  }
);

export const deleteExpense = createAsyncThunk(
  "expense/deleteExpense",
  async (id, thunkAPI) => {
    return await deleteExpenseThunk(`/expenses/${id}`, thunkAPI);
  }
);

export const getAllEmployeeExpenses = createAsyncThunk(
  "expense/getAllEmployeeExpenses",
  async (thunkAPI) => {
    return await getAllEmployeeExpensesThunk("/expenses/all", thunkAPI);
  }
);

const expenseSlice = createSlice({
  name: "expense",
  initialState,

  reducers: {
    handleInputValue: (state, { payload: { name, value } }) => {
      state.formData[name] = value;
    },

    clearFormData: () => {
      return { ...initialState };
    },

    setFormValues: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },

    handleSearchChange: (state, { payload: { name, value } }) => {
      state.searchParams[name] = value;
    },

    clearSearchParams: (state) => {
      state.searchParams = {
        status: "",
        category: "",
        startDate: "",
        endDate: "",
        page: 1,
        limit: 10,
      };
    },
  },

  extraReducers: (builder) => {
    // Create expense
    builder
      .addCase(createExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createExpense.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        toast.success("Expense created successfully");
      })
      .addCase(createExpense.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      });

    // Get expenses
    builder
      .addCase(getExpenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getExpenses.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.expenses = payload.expenses;
        state.totalExpenses = payload.totalExpenses;
        state.pagination = payload.pagination;
        state.error = null;
      })
      .addCase(getExpenses.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      });

    // Edit expense
    builder
      .addCase(editExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(editExpense.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        toast.success("Expense edited successfully");
      })
      .addCase(editExpense.rejected, (state, { payload }) => {
        state.isLoading = false;
        console.log(state.error);
        toast.error(payload);
      });

    // Delete expense
    builder
      .addCase(deleteExpense.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteExpense.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        // soft delete the expense
        state.expenses = state.expenses.filter(
          (expense) => expense._id !== payload.expenseId
        );
        state.totalExpenses = state.expenses.length;
        toast.success("Expense deleted successfully");
      })
      .addCase(deleteExpense.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      });

    // Get all employee expenses
    builder
      .addCase(getAllEmployeeExpenses.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllEmployeeExpenses.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.allEmployeeExpenses = payload.expenses;
        state.pagination = payload.pagination;
        state.error = null;
      })
      .addCase(getAllEmployeeExpenses.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      });
  },
});

export const {
  handleInputValue,
  clearFormData,
  setFormValues,
  handleSearchChange,
  clearSearchParams,
} = expenseSlice.actions;

export default expenseSlice.reducer;
