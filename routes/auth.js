const router = require("express").Router();
const User = require("../models/User");
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", verifyToken, async (req, res) => {
  try {
    const foundUser = await User.findOne({ username: req.body.username });
    if (foundUser) return res.status(409).json("user already exist");

    //create new user
    const newUser = new User({
      ...req.body,
      //hash password with argon2id
      password: await argon2.hash(req.body.password, { hashLength: 40 }),
    });

    //save user and return response
    const result = await newUser.save();
    const { password, createdAt, updatedAt, ...other } = result._doc;
    console.log(other._id);
    const token = jwt.sign({ userId: other._id }, process.env.SECERET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });

    res
      .cookie("accessToken", token, { httpOnly: true })
      .status(200)
      .json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// LOGIN
router.post("/login", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("user not found");

    const validPassword = await argon2.verify(user.password, req.body.password);
    if (!validPassword) return res.status(404).json("wrong password");

    // console.log(user._doc._id);
    const userId = user._doc._id;
    const { password, createdAt, updatedAt, ...other } = user._doc;
    const token = jwt.sign({ userId }, process.env.SECERET_KEY, {
      expiresIn: process.env.JWT_EXPIRE_TIME,
    });
    res
      .cookie("accessToken", token, { httpOnly: true })
      .status(200)
      .json(other);
  } catch (err) {
    res.status(500).json(err);
  }
});

// VERIFY
router.post("/verify", verifyToken, (req, res) => {
  res.status(403).json("un-authorized");
});

// VERIFY MIDDLEWARE
async function verifyToken(req, res, next) {
  const accessToken = req.cookies.accessToken;
  // console.log(accessToken);

  if (!accessToken) return next();

  try {
    const { userId } = jwt.verify(accessToken, process.env.SECERET_KEY);
    const user = await User.findById(userId);
    const { password, createdAt, updatedAt, ...other } = user._doc;
    res.status(200).json(other);
  } catch (err) {
    return next();
  }
}

// LOGOUT
router.post("/logout", async (req, res) => {
  res
    .clearCookie("accessToken", {
      secure: true,
      sameSite: "none",
    })
    .status(200)
    .json("User has been logged out.");
});

module.exports = router;
