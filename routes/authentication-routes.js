import express from "express";

const router = express.Router();

router.get("/create-account", (req, res) => {
  res.send("Yo what is good");
});

router.get("/login", (req, res) => {
  res.send("Login request has been responded to.");
});

export default router;
