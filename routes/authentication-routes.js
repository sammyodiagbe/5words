import express from "express";

const router = express.Router();

router.post("/create-account", (req, res) => {
  res.send("Yo what is good");
});

router.post("/login", (req, res) => {
  res.send("Login request has been responded to.");
});

export default router;
