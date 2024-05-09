const app = require("./app");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const AppError = require("./utils/appError");

const DB = process.env.DATABASE_URL.replace(
  "<PASSWORD>",
  process.env.DB_PASSWORD
);

mongoose
  .connect(DB, {
    dbName: process.env.DB_NAME,
  })
  .then(() => {
    console.log("Database Connection Successful...");
  })
  .catch((err) => {
    throw new AppError(err.message);
  });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is runnig on port ${port} ......`);
});
