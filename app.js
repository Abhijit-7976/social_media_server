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
app.use(cors({ origin: process.env.ALLOWED_SITE_URL, credentials: true }));
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

const PORT = process.env.PORT || 8800;

app.listen(PORT, () => {
  console.log("backend server is running on port " + PORT);
});
