import express, { Express, Router, RequestHandler } from "express";
import { exp_app } from ".";
import data from "./routes/data"
import setup from "./routes/setup"

const router = Router();

exp_app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
exp_app.use(express.urlencoded({ extended: true }) as RequestHandler);

router.use("/data", data);

router.use("/setup", setup);

router.get("/", express.static("../frontend/dist"), (req, res) => {});

export default router;