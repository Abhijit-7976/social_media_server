require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postsRoute = require("./routes/posts");
const commentsRoute = require("./routes/comments");
const filesRoute = require("./routes/files");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();
mongoose.connect(process.env.MONGO_URL);

//middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan("common"));

//routes
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postsRoute);
app.use("/api/comments", commentsRoute);
app.use("/api/files", filesRoute);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(8800, () => {
  console.log("backend server is running on port 8800");
});
