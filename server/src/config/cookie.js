const { SESSION_TTL } = require("./env");

const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: SESSION_TTL * 1000,
};

module.exports = cookieConfig;
