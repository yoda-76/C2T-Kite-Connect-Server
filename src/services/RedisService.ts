import Redis from "ioredis";
import { AppConfig } from "../config/AppConfig";
import { MarketTick } from "../types/kite.types";

export class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(AppConfig.REDIS_URL);
  }

  async publishMarketTicks(ticks: MarketTick[]): Promise<void> {
    await this.client.publish("marketTicks", JSON.stringify(ticks));
  }
}