import { createAsyncThunk } from "@reduxjs/toolkit";
import authService from "../../services/auth.service";

export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      return await authService.register(userData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  },
);

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    }
  },
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.getCurrentUser();
    } catch (error) {
      if (error.response?.status === 401) {
        return rejectWithValue("Not authenticated");
      }

      return rejectWithValue(
        error.response?.data?.message || "Unable to verify your session.",
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      return await authService.logout();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Logout failed. Please try again.",
      );
    }
  },
);
