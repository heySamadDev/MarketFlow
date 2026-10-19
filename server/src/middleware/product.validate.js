const allowedCategories = ["Electronics", "Clothing", "Home & Living"];

const validateProduct = (req, res, next) => {
  const { name, description, category, price, stock } = req.body;

  if (typeof name !== "string" || !name.trim() || name.trim().length > 120) {
    return res.status(400).json({
      success: false,
      message:
        "Product name must be a non-empty string with at most 120 characters.",
    });
  }

  if (
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 2000
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Description must be a non-empty string with at most 2000 characters.",
    });
  }

  if (typeof category !== "string" || !allowedCategories.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid product category.",
    });
  }

  if (
    price === undefined ||
    price === null ||
    (typeof price === "string" && !price.trim()) ||
    !Number.isFinite(Number(price)) ||
    Number(price) < 0.01
  ) {
    return res.status(400).json({
      success: false,
      message: "Price must be a valid number greater than or equal to 0.01.",
    });
  }

  if (
    stock === undefined ||
    stock === null ||
    (typeof stock === "string" && !stock.trim()) ||
    !Number.isFinite(Number(stock)) ||
    !Number.isInteger(Number(stock)) ||
    Number(stock) < 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Stock must be a non-negative whole number.",
    });
  }

  req.body.name = name.trim();
  req.body.description = description.trim();
  req.body.price = Number(price);
  req.body.stock = Number(stock);

  next();
};

module.exports = validateProduct;
