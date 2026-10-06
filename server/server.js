require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");
const { connectRedis } = require("./src/config/redis");

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();
  await connectRedis();

  app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error);
});
