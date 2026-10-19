const express = require("express");
const authRouter = require("./src/routes/auth.route");
const errorHandler = require("./src/middleware/error.middleware");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { validateOrigin } = require("./src/middleware/csrf.middleware");
const productRouter = require("./src/routes/product.route");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use(validateOrigin);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);

app.use(errorHandler);

module.exports = app;
