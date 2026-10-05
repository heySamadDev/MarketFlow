require("dotenv").config();
const app = require("./app");
const connectDB = require("./src/config/db");

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is listening on PORT: ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Database connection failed:", error);
});
