import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../db/models/userModel.js";

const router = express.Router();

router.post("/create-account", async (req, res) => {
  // get the data from the request body
  const { username, email, password } = req.body;

  // check if the user exist or not
  const alreadyAUser = await UserModel.findOne({
    $or: [{ username }, { email }],
  });
  if (alreadyAUser) {
    res.status(409).json({
      created: false,
      message:
        "A user with credentials already exists, please try another username or email.",
    });
  }

  // no user exist so now we can create the user
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new UserModel({ username, password: hashedPassword, email });
  await newUser.save();

  const token = jwt.sign({ username, email }, process.env.JWT_SECRET_KEY);
  res.cookie("authToken", token, { maxAge: 86400 * 3, httpOnly: true });

  res.status(201).json({
    created: true,
    message: "Account creation was successful",
    user: { ...newUser._doc, password: null },
  });
});

// login endpoint
router.post("/login", async (req, res) => {
  const { username: usernameData, password: passwordData } = req.body;

  // check if user exist
  const user = await UserModel.findOne({ username: usernameData });
  if (!user) {
    return res.status(404).json({
      authenticated: false,
      message: "User not found",
    });
  }
  const { username, email, password } = user;

  const comparePassword = bcrypt.compareSync(passwordData, password);
  if (!comparePassword) {
    res.status(401).json({
      authenticated: false,
      message: "Invalid credentials provided",
    });
  }

  const token = jwt.sign({ username, email }, process.env.JWT_SECRET_KEY);

  res.cookie("authToken", token, { maxAge: 86400 * 3, httpOnly: true });
  res.status(200).json({
    authenticated: true,
    user: { ...user._doc, password: null },
  });
});

export default router;
