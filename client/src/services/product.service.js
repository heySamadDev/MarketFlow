import api from "./api";

const createProduct = async (productData) => {
  const response = await api.post("/products", productData, {
    headers: {
      "Content-Type": undefined,
    },
  });

  return response.data;
};

const getProducts = async (params = {}) => {
  const response = await api.get("/products", { params });

  return response.data;
};

const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);

  return response.data;
};

const updateProduct = async (productId, productData) => {
  const response = await api.patch(`/products/${productId}`, productData);

  return response.data;
};

const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);

  return response.data;
};

const productService = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

export default productService;
