import express from "express";
import morgan from "morgan";
import compression from "compression";
import path from "path";
import { config } from "./config/app";
import { setupRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { userHeaderMiddleware } from "./middleware/userHeaders";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(compression());
app.use(morgan("common")); // for logging requests

app.use(userHeaderMiddleware);

const frontendDistPath = path.join(__dirname, "../../frontend/dist");
app.use(config.basePath, express.static(frontendDistPath));

app.use(`${config.basePath}/api`, setupRoutes());

app.get(`${config.basePath}/*`, (req, res) => {
  res.sendFile(path.join(frontendDistPath, "index.html"));
});

app.use("*", (req, res) => {
  res.status(404).json({ success: false, error: "Route not found", path: req.originalUrl });
});

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Server (🌍Environment: ${config.nodeEnv}) running on port ${PORT}`);
  console.log(`📱 App available at: http://localhost:${PORT}${config.basePath}/`);
  console.log(`🔧 API available at: http://localhost:${PORT}${config.basePath}/api`);
  console.log(`💾 Using mock CRUD: ${config.useMockCrud}`);
});

export default app;
