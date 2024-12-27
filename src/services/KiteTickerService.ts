import { KiteTicker } from "kiteconnect";
import { RedisService } from "./RedisService";
import { AppConfig } from "../config/AppConfig";
import { MarketTick, SubscriptionStatus } from "../types/kite.types";

export class KiteTickerService {
  private tickers: any[];
  private tickerSubscriptions: Map<number, Set<number>>;
  private currentTickerIndex: number;
  private redisService: RedisService;

  constructor(redisService: RedisService) {
    this.redisService = redisService;
    this.tickers = [];
    this.tickerSubscriptions = new Map();
    this.currentTickerIndex = 0;
  }

  initializeTickers(apiKey: string, accessToken: string): void {
    for (let i = 0; i < AppConfig.TICKER_COUNT; i++) {
      console.log("ticker initialization started",i);

      const ticker = this.createTicker(apiKey, accessToken);
      this.tickers.push(ticker);
      this.tickerSubscriptions.set(i, new Set());
      console.log("ticker initialized",i);
    }
  }

  private createTicker(apiKey: string, accessToken: string): any {
    const ticker = new KiteTicker({
      api_key: apiKey,
      access_token: accessToken
    });

    ticker.autoReconnect(true, 10, 5);
    ticker.connect();
    
    ticker.on("ticks", (ticks: any[]) => this.onTicks(ticks));
    this.setupTickerEvents(ticker);

    return ticker;
  }

  private onTicks(ticks: any[]): void {
    // console.log("tick data",ticks)
    this.redisService.publishMarketTicks(ticks);
  }

  subscribeToken(token: number): { 
    success: boolean; 
    tickerIndex: number; 
    subscriptionCount: number; 
  } {
    if (!this.tickers.length) {
      throw new Error("Tickers not initialized");
    }

    const tickerIndex = this.findTickerForSubscription();
    const ticker = this.tickers[tickerIndex];
    const subscriptions = this.tickerSubscriptions.get(tickerIndex);

    if (!subscriptions) {
      throw new Error(`No subscription set found for ticker ${tickerIndex}`);
    }

    if (!subscriptions.has(token)) {
      subscriptions.add(token);
      ticker.subscribe([token]);
      ticker.setMode(ticker.modeLTP, [token]);
    }

    return {
      success: true,
      tickerIndex,
      subscriptionCount: subscriptions.size
    };
  }

  private findTickerForSubscription(): number {
    let selectedIndex = this.currentTickerIndex;
    const currentSubscriptions = this.tickerSubscriptions.get(this.currentTickerIndex);

    if (currentSubscriptions && currentSubscriptions.size >= AppConfig.MAX_TOKENS_PER_TICKER) {
      this.currentTickerIndex = (this.currentTickerIndex + 1) % this.tickers.length;
      selectedIndex = this.currentTickerIndex;
    }

    return selectedIndex;
  }

  private setupTickerEvents(ticker: any): void {
    ticker.on("noreconnect", () => {
      console.log("noreconnect");
    });

    ticker.on("reconnecting", (reconnectInterval: number, reconnections: number) => {
      console.log("Reconnecting: attempt - ", reconnections, " interval - ", reconnectInterval);
    });
  }

  getSubscriptionStatus(): SubscriptionStatus[] {
    const status: SubscriptionStatus[] = [];
    for (let i = 0; i < this.tickers.length; i++) {
      const subscriptions = this.tickerSubscriptions.get(i);
      status.push({
        tickerIndex: i,
        subscribedTokens: subscriptions?.size || 0
      });
    }
    return status;
  }
}