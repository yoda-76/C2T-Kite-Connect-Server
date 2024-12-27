import { Request, Response } from "express";
import { KiteTickerService } from "../services/KiteTickerService";
import { KiteAuthRequest, KiteSubscribeRequest } from "../types/kite.types";

export class KiteController {
  private kiteTickerService: KiteTickerService;

  constructor(kiteTickerService: KiteTickerService) {
    this.kiteTickerService = kiteTickerService;
  }

  async handleAuth(req: Request<{}, {}, KiteAuthRequest>, res: Response): Promise<void> {
    try {
      const { key: apiKey, access_token: accessToken } = req.body;
      console.log('Access Token:', accessToken);

      this.kiteTickerService.initializeTickers(apiKey, accessToken);
      res.json({ 
        message: 'Kite Authentication Successful',
        status: this.kiteTickerService.getSubscriptionStatus()
      });
    } catch (err) {
      console.error("Error in kite auth flow:", err);
      res.status(500).json({ 
        message: 'Error occurred', 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    }
  }

  async handleSubscribe(req: Request<{}, {}, KiteSubscribeRequest>, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      
      if (!token) {
        res.status(400).json({ message: 'Token is required' });
        return;
      }

      const result = this.kiteTickerService.subscribeToken(Number(token));
      res.json({
        message: 'Token subscribed successfully',
        ...result,
        status: this.kiteTickerService.getSubscriptionStatus()
      });
    } catch (err) {
      console.error("Error in token subscription:", err);
      res.status(500).json({ 
        message: 'Error occurred', 
        error: err instanceof Error ? err.message : 'Unknown error' 
      });
    }
  }
}