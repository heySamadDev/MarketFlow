import { createSlice } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  fetchCurrentUser,
  logoutUser,
} from "./authThunks";

const initialState = {
  user: null,
  isAuthenticated: false,
  status: "idle",
  error: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload || "Registration failed. Please try again.";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.data;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Login failed. Please try again.";
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload.data;
        state.isAuthenticated = true;
        state.initialized = true;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.initialized = true;

        if (action.payload === "Not authenticated") {
          state.user = null;
          state.isAuthenticated = false;
          state.error = null;
          return;
        }

        state.error = action.payload || "Unable to verify your session.";
      })
      .addCase(logoutUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.status = "idle";
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Logout failed. Please try again.";
      });
  },
});

export const { clearAuthError } = authSlice.actions;

export default authSlice.reducer;
