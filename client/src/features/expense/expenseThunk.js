import customFetch from "../../utils/axios";
import { clearFormData, getExpenses } from "./expenseSlice";

export const createExpenseThunk = async (url, expense, thunkAPI) => {
  try {
    const resp = await customFetch.post(url, expense);
    thunkAPI.dispatch(clearFormData());
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Expense creation failed"
    );
  }
};

export const getExpensesThunk = async (url, thunkAPI) => {
  try {
    const queryParams = thunkAPI.arg || {};
    const queryString = new URLSearchParams(
      Object.entries(queryParams).filter(
        ([_, value]) => value !== "" && value != null
      )
    ).toString();

    const finalUrl = queryString ? `${url}?${queryString}` : url;
    const resp = await customFetch.get(finalUrl);
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Expense fetching failed"
    );
  }
};

export const editExpenseThunk = async (url, expense, thunkAPI) => {
  try {
    const resp = await customFetch.put(url, expense);
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Expense editing failed"
    );
  }
};

export const deleteExpenseThunk = async (url, thunkAPI) => {
  try {
    const resp = await customFetch.delete(url);
    thunkAPI.dispatch(getExpenses());
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Expense deletion failed"
    );
  }
};

export const getAllEmployeeExpensesThunk = async (url, thunkAPI) => {
  try {
    const resp = await customFetch.get(url);
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Expense fetching failed"
    );
  }
};
