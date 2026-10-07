const express = require("express");
const authRouter = require("./src/routes/auth.route");
const errorHandler = require("./src/middleware/error.middleware");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRouter);

app.use(errorHandler);

module.exports = app;