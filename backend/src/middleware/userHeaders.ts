import { Request, Response, NextFunction } from "express";
import { User } from "@miniapp-template/shared";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Extracts user information from headers set by NGINX/AuthService upstream.
// In production: NGINX validates session and forwards user headers (X-User-Id, X-User-Email, X-User-Name)
// In development: Uses default values for local testing
// TODO: Extend to handle user roles/permissions from AuthService or user management system
export const userHeaderMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const userId = (req.headers["x-user-id"] as string) || "defaultuserid";
  const userEmail = (req.headers["x-user-email"] as string) || "defaultemail";
  const userName = (req.headers["x-user-name"] as string) || "defaultusername";

  req.user = { id: userId, email: userEmail, name: userName, roles: ["user"], permissions: ["read", "write"] };

  res.setHeader("X-User-Id", req.user.id);
  res.setHeader("X-User-Email", req.user.email);
  res.setHeader("X-User-Name", req.user.name);

  next();
};
