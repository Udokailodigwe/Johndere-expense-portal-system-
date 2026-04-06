import customFetch from "../../utils/axios";

export const approveExpenseThunk = async (url, approval, thunkAPI) => {
  try {
    const resp = await customFetch.put(url, approval);

    return resp.data;
  } catch (error) {
    console.log(error);
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Approval failed"
    );
  }
};

export const employeeApprovalsThunk = async (url, thunkAPI) => {
  try {
    const resp = await customFetch.get(url);
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Retrieving Approvals failed"
    );
  }
};

export const getAllApprovalsThunk = async (url, thunkAPI) => {
  try {
    const resp = await customFetch.get(url);
    return resp.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.msg || "Retrieving Approvals failed"
    );
  }
};
