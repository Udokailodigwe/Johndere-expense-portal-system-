import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import {
  registerEmployeeThunk,
  registerManagerThunk,
  activateAccountThunk,
  loginThunk,
  getCurrentUserThunk,
  logoutThunk,
} from "./userThunk";

const initialState = {
  user: null,
  isLoading: false,
  error: null,
};

export const registerEmployee = createAsyncThunk(
  "user/registerEmployee",
  async (user, thunkAPI) => {
    return await registerEmployeeThunk("/auth/register", user, thunkAPI);
  }
);

export const registerManager = createAsyncThunk(
  "user/registerManager",
  async (user, thunkAPI) => {
    return registerManagerThunk("/auth/register/manager", user, thunkAPI);
  }
);

export const activateAccount = createAsyncThunk(
  "user/activateAccount",
  async (user, thunkAPI) => {
    return activateAccountThunk("/auth/activate-account", user, thunkAPI);
  }
);

export const login = createAsyncThunk("user/login", async (user, thunkAPI) => {
  return loginThunk("/auth/login", user, thunkAPI);
});

export const getCurrentUser = createAsyncThunk(
  "user/getCurrentUser",
  async (_, thunkAPI) => {
    return getCurrentUserThunk("/auth/me", thunkAPI);
  }
);

export const logout = createAsyncThunk("user/logout", async (_, thunkAPI) => {
  return logoutThunk("/auth/logout", thunkAPI);
});

const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    clearTempUser: (state) => {
      state.user = null;
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    //registerEmployee
    builder
      .addCase(registerEmployee.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerEmployee.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.error = null;
        toast.success(`Welcome ${state.user.name}! Registration successful.`);
      })
      .addCase(registerEmployee.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload.message;
        toast.error(payload.message);
      });

    //registerManager
    builder
      .addCase(registerManager.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(registerManager.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.error = null;
        toast.success(`Welcome ${state.user.name}! Registration successful.`);
      })
      .addCase(registerManager.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload.message;
        toast.error(payload.message);
      });

    //activateAccount
    builder
      .addCase(activateAccount.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(activateAccount.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.user = payload.user;
        state.error = null;
        toast.success(`Account activated successfully.`);
      })
      .addCase(activateAccount.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload.message;
        toast.error(payload.message);
      });

    //login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.error = null;
        toast.success("Login successful!");
      })
      .addCase(login.rejected, (state, { payload }) => {
        state.isLoading = false;
        state.error = payload;
        toast.error(payload);
      })
      //getCurrentUser
      .addCase(getCurrentUser.fulfilled, (state, { payload }) => {
        state.user = payload.user;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, { payload }) => {
        state.user = null;
        state.error = payload;
      })
      //logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.error = null;
        toast.success("Logged out successfully");
      })
      .addCase(logout.rejected, (state, { payload }) => {
        state.user = null;
        state.error = null;
        toast.error(payload || "Logout failed");
      });
  },
});

export const { clearTempUser } = userSlice.actions;
export default userSlice.reducer;
