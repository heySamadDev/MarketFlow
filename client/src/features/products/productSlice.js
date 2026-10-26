import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProducts,
  fetchProductById,
  updateProduct,
  deleteProduct,
} from "./productThunks";

const initialState = {
  products: [],
  isLoading: false,
  error: null,

  selectedProduct: null,
  isDetailsLoading: false,
  detailsError: null,

  pagination: {
    page: 1,
    limit: 10,
    totalProducts: 0,
    totalPages: 0,
  },

  stats: {
    inStockProducts: 0,
    lowStockProducts: 0,
  },
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data.products;
        state.pagination = action.payload.data.pagination;
        state.stats = action.payload.data.stats;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch products";
      })
      .addCase(fetchProductById.pending, (state) => {
        state.isDetailsLoading = true;
        state.detailsError = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.isDetailsLoading = false;
        state.selectedProduct = action.payload.data;
        state.detailsError = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.isDetailsLoading = false;
        state.detailsError = action.payload || "Failed to fetch product.";
      })
      .addCase(updateProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload.data;

        state.products = state.products.map((product) =>
          product._id === updatedProduct._id
            ? {
                ...product,
                ...updatedProduct,
              }
            : product,
        );

        if (state.selectedProduct?._id === updatedProduct._id) {
          state.selectedProduct = {
            ...state.selectedProduct,
            ...updatedProduct,
          };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload || "Failed to update product";
      })
      .addCase(deleteProduct.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const deletedProductId = action.payload;

        state.products = state.products.filter(
          (product) => product._id !== deletedProductId,
        );

        if (state.selectedProduct?._id === deletedProductId) {
          state.selectedProduct = null;
        }
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload || "Failed to delete product";
      });
  },
});

export default productSlice.reducer;
