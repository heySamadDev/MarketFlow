const { SESSION_TTL } = require("./env");

const cookieConfig = {
  httpOnly: true,
  secure: false,
  sameSite: "lax",
  maxAge: SESSION_TTL * 1000,
};

module.exports = cookieConfig