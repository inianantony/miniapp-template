import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    base: env.VITE_BASE_PATH || "/defaultbasepath/defaultapp/",
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: mode === "development",
    },
    server: {
      port: 5173,
      // No proxy needed - backend serves the built frontend
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@shared": path.resolve(__dirname, "../shared/src"),
      },
    },
    define: {
      global: "globalThis",
    },
  };
});
