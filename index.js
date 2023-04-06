import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import authRouter from "./routes/authentication-routes";

const app = express();
const port = process.env.PORT || 8080;
const baseUrl = "/api/5words/v1";

// configurations
app.use(cors());
app.use(bodyParser.json());

// connecting the routes
app.use(`${baseUrl}/auth`, authRouter);
// connect to mongodb

mongoose
  .connect("mongodb://localhost:27017", {})
  .then(() => {
    app.listen(port, () => {
      console.log("Listening on port ", port);
    });
  })
  .catch((error) => console.log(error));
