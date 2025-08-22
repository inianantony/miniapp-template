import { Router } from "express";
import userActivityRouter from "./userActivity";

export const setupRoutes = (): Router => {
  const router = Router();

  router.get("/health", (req, res) => {
    res.json({
      success: true,
      message: "API is running",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  router.get("/me", (req, res) => {
    res.json({
      success: true,
      data: req.user
    });
  });

  router.use("/user-activities", userActivityRouter);

  return router;
};
