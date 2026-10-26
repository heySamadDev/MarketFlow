import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../features/products/productThunks";

export function ProductDetails() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const [activeImage, setActiveImage] = useState(0);

  const { selectedProduct, isDetailsLoading, detailsError } = useSelector(
    (state) => state.products,
  );

  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [productId, dispatch]);

  useEffect(() => {
    setActiveImage(0);
  }, [productId]);

  if (isDetailsLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading product details...
        </div>
      </div>
    );
  }

  if (detailsError) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-red-600">{detailsError}</p>
        <Link
          to="/products"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to products
        </Link>
      </div>
    );
  }

  if (!selectedProduct || selectedProduct._id !== productId) {
    return (
      <div className="space-y-4 p-6">
        <p className="text-sm text-slate-500">Product not found.</p>
        <Link
          to="/products"
          className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const product = selectedProduct;
  const images = product.images || [];
  const mainImage = images.find((image) => image.isMain) || images[0];

  const stockStatus =
    product.stock === 0
      ? {
          label: "Out of stock",
          className: "bg-red-50 text-red-700",
        }
      : product.stock <= 5
        ? {
            label: "Low stock",
            className: "bg-amber-50 text-amber-700",
          }
        : {
            label: "In stock",
            className: "bg-emerald-50 text-emerald-700",
          };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Link
        to="/products"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600"
      >
        <span aria-hidden="true">←</span>
        Back to products
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="grid gap-0 lg:grid-cols-2">
          <section className="border-b border-slate-200 bg-slate-50 p-4 sm:p-6 lg:border-b-0 lg:border-r">
            <div className="flex aspect-square max-h-[560px] items-center justify-center overflow-hidden rounded-xl bg-white">
              {mainImage ? (
                <img
                  src={images[activeImage]?.url || mainImage.url}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  No image available
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="mt-4 flex flex-wrap gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.publicId || image.url}
                    type="button"
                    onClick={() => setActiveImage(index)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={activeImage === index}
                    className={`h-16 w-16 overflow-hidden rounded-lg border-2 bg-white transition sm:h-20 sm:w-20 ${
                      activeImage === index
                        ? "border-indigo-600"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-6 p-5 sm:p-8 lg:p-10">
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                {product.category}
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {product.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${stockStatus.className}`}
                >
                  {stockStatus.label}
                </span>
                <span className="text-sm text-slate-500">
                  {product.stock} units available
                </span>
              </div>
            </div>

            <div className="border-y border-slate-200 py-5">
              <p className="text-sm text-slate-500">Selling price</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                ₹{Number(product.price).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-900">
                Description
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                {product.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Category</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {product.category}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Stock quantity</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {product.stock} units
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-5">
              <p className="text-xs text-slate-400">Product ID</p>
              <p className="mt-1 break-all font-mono text-xs text-slate-500">
                {product._id}
              </p>
            </div>

            <Link
              to="/products"
              className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Return to products
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
