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
  const hashedPassword = bcrypt.hash(password, 10);

  const newUser = new UserModel({ username, password: hashedPassword, email });
  await newUser.save();

  const token = jwt.sign({ username, email }, process.env.JWT_SECRET_KEY);
  res.cookie("authToken", token, { maxAge: 86400 * 3 });

  res.status(201).json({
    created: true,
    message: "Account creation was successful",
    user: { ...newUser, password: null },
  });
});

router.post("/login", (req, res) => {
  res.send("Login request has been responded to.");
});

export default router;
