import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import UserModel from "../db/models/userModel.js";
import AWS from "../utils/mailer.js";

const router = express.Router();
const ses = new AWS.SES({ region: "us-east-2" });

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

router.post("/request-password-reset", async (req, res) => {
  const { email } = req.body;

  // check to see if an account with such email exist
  const account = await UserModel.findOne({ email });
  if (!account) {
    res.status(404).json({
      message: "Account with email does not exist",
    });
  }

  const resetToken = jwt.sign(
    { data: "Some data" },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: 3600,
    }
  );

  const params = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        html: {
          Data: `<h1>Click on link to reset email</h1>
          <a href="https://localhost:3000/password-reset/${resetToken}"`,
        },
      },
      Subject: {
        Data: "Reset your password",
      },
    },
    Source: "noreply@wordbatu.bleuape.com",
  };
  // send an email to the user.
  // generate a jwt token that expires in 5 minutes

  try {
    const sendEmailPromise = await ses.sendEmail(params).promise();

    console.log(sendEmailPromise);
    res.send("Email has been sent");
  } catch (error) {
    console.log(error);
    res.send("Something went wrong");
  }
  // res.send("Sending email with code");
});

// requesting a password reset
router.post("/reset-password", (req, res) => {
  const { email } = req.body;
});

export default router;
