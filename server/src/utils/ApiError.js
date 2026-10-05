class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);

    this.name = "ApiError";
    this.success = false;
    this.statusCode = statusCode;
  }
}

module.exports = ApiError;
