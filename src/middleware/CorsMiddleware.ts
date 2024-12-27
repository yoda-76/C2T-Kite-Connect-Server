import { Request, Response, NextFunction } from "express";
import { AppConfig } from "../config/AppConfig";

export class CorsMiddleware {
  static handle(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;
    if (origin && AppConfig.ALLOWED_ORIGINS.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, userId, agentid, adminid, skey"
    );
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Credentials", "true");

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  }
}