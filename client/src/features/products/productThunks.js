import { createAsyncThunk } from "@reduxjs/toolkit";
import productService from "../../services/product.service";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params = {}, thunkAPI) => {
    try {
      return await productService.getProducts(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);
