import express, { Express } from "express";
import cookieParser from "cookie-parser";
import { createServer, Server } from "node:http";
import { CorsMiddleware } from "./middleware/CorsMiddleware";
import { KiteController } from "./controllers/KiteController";
import { RedisService } from "./services/RedisService";
import { KiteTickerService } from "./services/KiteTickerService";
import { AppConfig } from "./config/AppConfig";

export class App {
  private app: Express;
  private httpServer: Server;
  private redisService: RedisService;
  private kiteTickerService: KiteTickerService;
  private kiteController: KiteController;

  constructor() {
    this.app = express();
    this.httpServer = createServer(this.app);
    this.setupMiddleware();
    this.setupServices();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(CorsMiddleware.handle);
  }

  private setupServices(): void {
    this.redisService = new RedisService();
    this.kiteTickerService = new KiteTickerService(this.redisService);
    this.kiteController = new KiteController(this.kiteTickerService);
  }

  private setupRoutes(): void {
    this.app.post("/api/kite/auth", (req, res) => 
      this.kiteController.handleAuth(req, res)
    );
    this.app.post("/subscribe-token", (req, res) => 
      this.kiteController.handleSubscribe(req, res)
    );
  }

  start(): void {
    this.httpServer.listen(AppConfig.PORT, () => {
      console.log(`App is running at http://localhost:${AppConfig.PORT}`);
    });
  }
}