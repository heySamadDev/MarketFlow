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

const productService = {
  createProduct,
  getProducts,
};

export default productService;
