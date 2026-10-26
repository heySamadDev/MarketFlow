import { useEffect, useState } from "react";
import productService from "../services/product.service";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  updateProduct,
  deleteProduct,
} from "../features/products/productThunks";
import { Link } from "react-router-dom";

const initialForm = {
  name: "",
  description: "",
  category: "",
  price: "",
  stock: "",
};

const categories = ["Electronics", "Clothing", "Home & Living"];
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function Products() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [formError, setFormError] = useState("");

  const [editingProduct, setEditingProduct] = useState(null);

  const [editForm, setEditForm] = useState(initialForm);
  const [editError, setEditError] = useState("");
  const [isEditSaving, setIsEditSaving] = useState(false);

  const [deletingProductId, setDeletingProductId] = useState(null);
  const [actionError, setActionError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 10;

  const dispatch = useDispatch();
  const {
    products,
    isLoading,
    error,
    pagination,
    stats,
    catalogTotalProducts,
  } = useSelector((state) => state.products);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
        search: debouncedSearch,
        ...(category !== "All categories" ? { category } : {}),
      }),
    );
  }, [dispatch, currentPage, debouncedSearch, category]);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  function openForm() {
    setFormError("");
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setFormError("");
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const allowedImageMimeTypes = ["image/png", "image/jpeg", "image/webp"];

  function handleImageSelection(event) {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!selectedFiles.length) return;
    const remainingSlots = MAX_IMAGES - images.length;

    if (remainingSlots <= 0) {
      setFormError(`You can select up to ${MAX_IMAGES} images.`);
      return;
    }

    const acceptedImages = [];
    const errors = [];
    for (const file of selectedFiles) {
      if (!allowedImageMimeTypes.includes(file.type)) {
        errors.push(
          `${file.name} has an unsupported image format. Use JPEG, PNG, or WebP.`,
        );
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        errors.push(`${file.name} exceeds the 5 MB limit.`);
        continue;
      }
      if (images.length + acceptedImages.length >= MAX_IMAGES) {
        errors.push(`You can select up to ${MAX_IMAGES} images.`);
        break;
      }
      acceptedImages.push({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      });
    }
    setImages((current) => [...current, ...acceptedImages]);
    setFormError(errors.join(" "));
  }

  function removeImage(indexToRemove) {
    setImages((current) => {
      const removedImage = current[indexToRemove];
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }
      return current.filter((_, index) => index !== indexToRemove);
    });

    setMainImageIndex((current) => {
      if (indexToRemove === current) return 0;
      if (indexToRemove < current) return current - 1;
      return current;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Please enter a product name.");
      return;
    }
    if (!form.description.trim()) {
      setFormError("Please enter a product description.");
      return;
    }
    if (!form.category) {
      setFormError("Please select a category.");
      return;
    }
    const price = Number(form.price);
    if (form.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
      setFormError("Price must be a valid number greater than zero.");
      return;
    }
    if (
      form.stock === "" ||
      !Number.isInteger(Number(form.stock)) ||
      Number(form.stock) < 0
    ) {
      setFormError("Stock must be a whole number of zero or more.");
      return;
    }
    if (images.length === 0) {
      setFormError("Please select at least one product image.");
      return;
    }

    const productData = new FormData();
    productData.append("name", form.name.trim());
    productData.append("description", form.description.trim());
    productData.append("category", form.category);
    productData.append("price", String(price));
    productData.append("stock", String(Number(form.stock)));
    images.forEach((image) => {
      productData.append("images", image.file);
    });

    try {
      await productService.createProduct(productData);
      setIsFormOpen(false);
      setForm(initialForm);
      setImages([]);
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        dispatch(
          fetchProducts({
            page: 1,
            limit: PRODUCTS_PER_PAGE,
            search: debouncedSearch,
            ...(category !== "All categories" ? { category } : {}),
          }),
        );
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Failed to create product. Please try again.",
      );
    }
  }

  function openEditForm(product) {
    setEditingProduct(product);
    setEditError("");

    setEditForm({
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: String(product.price),
      stock: String(product.stock),
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!editingProduct || isEditSaving) return;

    setEditError("");

    const price = Number(editForm.price);
    const stock = Number(editForm.stock);

    if (!editForm.name.trim() || !editForm.description.trim()) {
      setEditError("Name and description are required.");
      return;
    }

    if (!editForm.category) {
      setEditError("Please select a category.");
      return;
    }

    if (editForm.price.trim() === "" || !Number.isFinite(price) || price <= 0) {
      setEditError("Price must be greater than zero.");
      return;
    }

    if (editForm.stock.trim() === "" || !Number.isInteger(stock) || stock < 0) {
      setEditError("Stock must be a whole number of zero or more.");
      return;
    }

    setIsEditSaving(true);

    try {
      const result = await dispatch(
        updateProduct({
          productId: editingProduct._id,
          productData: {
            name: editForm.name.trim(),
            description: editForm.description.trim(),
            category: editForm.category,
            price,
            stock,
          },
        }),
      );

      if (updateProduct.fulfilled.match(result)) {
        setEditingProduct(null);
      } else {
        setEditError(result.payload || "Failed to update product.");
      }
    } finally {
      setIsEditSaving(false);
    }
  }

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`,
    );

    if (!confirmed || deletingProductId) return;

    setActionError("");
    setDeletingProductId(product._id);

    try {
      const result = await dispatch(deleteProduct(product._id));

      if (!deleteProduct.fulfilled.match(result)) {
        setActionError(result.payload || "Failed to delete product.");
      }
    } finally {
      setDeletingProductId(null);
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8 text-slate-900 sm:px-8 sm:py-10">
      <section className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
            Workspace / Products
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Products
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            Manage your catalog, keep product details organized, and track
            inventory from one place.
          </p>
        </div>
        <button
          type="button"
          onClick={openForm}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <span aria-hidden="true" className="text-lg leading-none">
            +
          </span>
          Add product
        </button>
      </section>
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["Total products", catalogTotalProducts, "Catalog overview"],
          [
            "In stock",
            stats.inStockProducts,
            "Products with available inventory",
          ],
          [
            "Low stock",
            stats.lowStockProducts,
            "Products with 1–5 items remaining",
          ],
        ].map(([title, value, description]) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-3 text-2xl font-bold">{value}</p>
            <p className="mt-2 text-xs text-slate-400">{description}</p>
          </div>
        ))}
      </section>
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:p-5">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search products</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            >
              ⌕
            </span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            />
          </label>
          <label>
            <span className="sr-only">Filter by category</span>
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-48"
            >
              <option>All categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>
        {actionError && (
          <p
            role="alert"
            className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {actionError}
          </p>
        )}
        {isLoading ? (
          <div className="px-5 py-16 text-center sm:px-8 sm:py-20">
            <p className="text-sm text-slate-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="px-5 py-16 text-center sm:px-8 sm:py-20">
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  fetchProducts({
                    page: currentPage,
                    limit: PRODUCTS_PER_PAGE,
                    search: debouncedSearch,
                    ...(category !== "All categories" ? { category } : {}),
                  }),
                )
              }
              className="mt-4 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="px-5 py-16 text-center sm:px-8 sm:py-20">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
              ▦
            </div>
            <h2 className="mt-5 text-lg font-semibold">
              {catalogTotalProducts === 0
                ? "Your catalog starts here"
                : "No products found"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {catalogTotalProducts === 0
                ? "Your products will appear here once you add them. Start building your catalog to keep your store organized."
                : "Try a different search term or category filter."}
            </p>
            {catalogTotalProducts === 0 && (
              <button
                type="button"
                onClick={openForm}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                + Add your first product
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
            {products.map((product) => {
              const mainImage =
                product.images?.find((image) => image.isMain) ||
                product.images?.[0];

              return (
                <article
                  key={product._id}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:shadow-sm"
                >
                  <Link to={`/products/${product._id}`} className="block">
                    {mainImage ? (
                      <img
                        src={mainImage.url}
                        alt={product.name}
                        className="h-48 w-full bg-slate-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-400">
                        No image available
                      </div>
                    )}

                    <div className="space-y-2 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                        {product.category}
                      </p>

                      <h2 className="text-base font-semibold text-slate-900">
                        {product.name}
                      </h2>

                      <p className="line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <p className="font-bold text-slate-900">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </p>

                        <p
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.stock === 0
                              ? "bg-red-50 text-red-600"
                              : product.stock <= 5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : `${product.stock} in stock`}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="flex gap-2 border-t border-slate-100 p-3">
                    <button
                      type="button"
                      onClick={() => openEditForm(product)}
                      className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(product)}
                      disabled={deletingProductId === product._id}
                      className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingProductId === product._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          Page {pagination.page} of {pagination.totalPages || 1}
          {" · "}
          {pagination.totalProducts} total products
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => page - 1)}
            disabled={currentPage <= 1 || isLoading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Previous
          </button>

          <span className="text-sm font-medium text-slate-600">
            {pagination.page} / {pagination.totalPages || 1}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((page) => page + 1)}
            disabled={currentPage >= pagination.totalPages || isLoading}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 py-8 backdrop-blur-sm sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-product-title"
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <h2
                  id="add-product-title"
                  className="text-xl font-bold tracking-tight"
                >
                  Add a new product
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the details and add up to {MAX_IMAGES} images.
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="rounded-lg p-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
              <div>
                <label
                  htmlFor="product-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product name
                </label>
                <input
                  id="product-name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="e.g. Wireless headphones"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="product-description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Description
                </label>
                <textarea
                  id="product-description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={2000}
                  placeholder="Describe the product, its features, and benefits..."
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="product-category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Category
                </label>
                <select
                  id="product-category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  required
                >
                  <option value="">Choose a category</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="product-price"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Price (₹)
                  </label>
                  <input
                    id="product-price"
                    name="price"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="1499.00"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="product-stock"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Stock quantity
                  </label>
                  <input
                    id="product-stock"
                    name="stock"
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={handleChange}
                    placeholder="25"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    required
                  />
                </div>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label
                    htmlFor="product-images"
                    className="block text-sm font-semibold"
                  >
                    Product images
                  </label>
                  <span className="text-xs text-slate-400">
                    {images.length}/{MAX_IMAGES} selected
                  </span>
                </div>
                <label
                  htmlFor="product-images"
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 px-5 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 ${
                    images.length >= MAX_IMAGES
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                >
                  <span className="text-3xl text-indigo-600">⇧</span>
                  <span className="mt-2 text-sm font-semibold">
                    Click to select images
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WebP · Up to 5 MB per image
                  </span>
                </label>
                <input
                  id="product-images"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={images.length >= MAX_IMAGES}
                  onChange={handleImageSelection}
                  className="sr-only"
                />
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {images.map((image, index) => (
                      <div
                        key={image.id}
                        className={`overflow-hidden rounded-xl border ${
                          index === mainImageIndex
                            ? "border-indigo-500 ring-2 ring-indigo-100"
                            : "border-slate-200"
                        }`}
                      >
                        <div className="relative aspect-square bg-slate-100">
                          <img
                            src={image.preview}
                            alt={`Product preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            aria-label={`Remove image ${index + 1}`}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-lg text-slate-700 shadow hover:bg-red-50 hover:text-red-600"
                          >
                            ×
                          </button>
                          {index === mainImageIndex && (
                            <span className="absolute bottom-2 left-2 rounded-md bg-indigo-600 px-2 py-1 text-xs font-semibold text-white">
                              Main image
                            </span>
                          )}
                        </div>
                        <div className="p-2">
                          <button
                            type="button"
                            onClick={() => setMainImageIndex(index)}
                            className="w-full rounded-lg px-2 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 disabled:cursor-default disabled:text-slate-400"
                            disabled={index === mainImageIndex}
                          >
                            {index === mainImageIndex
                              ? "Selected as main"
                              : "Set as main image"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formError && (
                <p
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl px-4 py-3 text-sm ${
                    formError.startsWith("Form validated") ||
                    formError.startsWith("Product created successfully")
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {formError}
                </p>
              )}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Validate product
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 py-8 backdrop-blur-sm sm:items-center"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isEditSaving) {
              setEditingProduct(null);
              setEditError("");
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-product-title"
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-5 sm:px-7">
              <div>
                <h2
                  id="edit-product-title"
                  className="text-xl font-bold tracking-tight"
                >
                  Edit product
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Update your product details and inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setEditError("");
                }}
                disabled={isEditSaving}
                aria-label="Close edit form"
                className="rounded-lg p-2 text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-5 p-5 sm:p-7">
              <div>
                <label
                  htmlFor="edit-product-name"
                  className="mb-2 block text-sm font-semibold"
                >
                  Product name
                </label>
                <input
                  id="edit-product-name"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  maxLength={120}
                  required
                  disabled={isEditSaving}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-description"
                  className="mb-2 block text-sm font-semibold"
                >
                  Description
                </label>
                <textarea
                  id="edit-product-description"
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  rows={4}
                  maxLength={2000}
                  required
                  disabled={isEditSaving}
                  className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-product-category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Category
                </label>
                <select
                  id="edit-product-category"
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                  disabled={isEditSaving}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">Select a category</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="edit-product-price"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Price (₹)
                  </label>
                  <input
                    id="edit-product-price"
                    name="price"
                    type="number"
                    value={editForm.price}
                    onChange={handleEditChange}
                    min="0.01"
                    step="0.01"
                    required
                    disabled={isEditSaving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="edit-product-stock"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Stock quantity
                  </label>
                  <input
                    id="edit-product-stock"
                    name="stock"
                    type="number"
                    value={editForm.stock}
                    onChange={handleEditChange}
                    min="0"
                    step="1"
                    required
                    disabled={isEditSaving}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {editError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                  {editError}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setEditError("");
                  }}
                  disabled={isEditSaving}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isEditSaving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isEditSaving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
