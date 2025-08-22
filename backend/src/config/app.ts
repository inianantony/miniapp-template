import dotenv from "dotenv";
import path from "path";

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8101", 10),
  nodeEnv: process.env.NODE_ENV || "development",

  appName: process.env.APP_NAME || "defaultapp",
  basePath: process.env.BASE_PATH || "/defaultbasepath/defaultapp/",

  corsOrigin: process.env.CORS_ORIGIN || "http://crossorgin:5173",

  useMockCrud: process.env.USE_MOCK_CRUD === "true",
  databasePath: process.env.DATABASE_PATH || "./data/mock.db",

  companyApiBaseUrl: process.env.COMPANY_API_BASE_URL || "https://api.company.com",
  companyApiTimeout: parseInt(process.env.COMPANY_API_TIMEOUT || "30000", 10),

  authServiceTokenEndpoint: process.env.AUTHSERVICE_TOKEN_ENDPOINT || "http://defaulttokenendpoint:defaultport/defaultbasepath/auth/token",

  jwtSecret: process.env.JWT_SECRET || "your-secret-key-change-in-production",

  enableRateLimit: process.env.ENABLE_RATE_LIMIT === "true",
  enableLogging: process.env.ENABLE_LOGGING !== "false",
} as const;

if (config.nodeEnv === "production" && config.jwtSecret === "your-secret-key-change-in-production") {
  throw new Error("JWT_SECRET must be set in production");
}

console.log("📋 Configuration loaded:", {
  port: config.port,
  nodeEnv: config.nodeEnv,
  basePath: config.basePath,
  useMockCrud: config.useMockCrud,
});
