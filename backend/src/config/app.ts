import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8101", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  basePath: process.env.BASE_PATH || "/defaultbasepath/defaultapp/",
  useMockCrud: process.env.USE_MOCK_CRUD === "true",
  authServiceTokenEndpoint: process.env.AUTHSERVICE_TOKEN_ENDPOINT || "http://localhost:8086/miniappsdev/auth/token",
} as const;

console.log("📋 Configuration loaded:", {
  port: config.port,
  nodeEnv: config.nodeEnv,
  basePath: config.basePath,
});
