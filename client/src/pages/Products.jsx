import { useEffect, useState } from "react";

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
  const [category, setCategory] = useState("All categories");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [formError, setFormError] = useState("");

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
      if (!file.type.startsWith("image/")) {
        errors.push(`${file.name} is not an image.`);
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

  function handleSubmit(event) {
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

    if (form.price === "" || Number(form.price) <= 0) {
      setFormError("Price must be greater than zero.");
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

    const productDraft = {
      ...form,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      images: images.map((image, index) => ({
        file: image.file,
        isMain: index === mainImageIndex,
      })),
    };

    // UI-only for now. We'll connect this form to the backend later.
    console.log("Product draft:", productDraft);
    setFormError(
      "Form validated successfully. Product saving will be added with backend integration.",
    );
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
          ["Total products", "—", "Catalog overview"],
          ["In stock", "—", "Inventory overview"],
          ["Low stock", "—", "Inventory alerts"],
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
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 sm:w-48"
            >
              <option>All categories</option>
              {categories.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="px-5 py-16 text-center sm:px-8 sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl text-indigo-600">
            ▦
          </div>
          <h2 className="mt-5 text-lg font-semibold">
            Your catalog starts here
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your products will appear here once you add them. Start building
            your catalog to keep your store organized.
          </p>
          <button
            type="button"
            onClick={openForm}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            + Add your first product
          </button>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-slate-400">
        Product counts and catalog data will appear here when backend
        integration is implemented.
      </p>

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
                  accept="image/*"
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
                    formError.startsWith("Form validated")
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
    </main>
  );
}
