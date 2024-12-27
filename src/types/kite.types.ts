export interface KiteAuthRequest {
  key: string;
  access_token: string;
}

export interface KiteSubscribeRequest {
  token: number;
}

export interface SubscriptionStatus {
  tickerIndex: number;
  subscribedTokens: number;
}

export interface SubscriptionResult {
  success: boolean;
  tickerIndex: number;
  subscriptionCount: number;
  status: SubscriptionStatus[];
}

export interface MarketTick {
  instrument_token: number;
  last_price: number;
  [key: string]: any;
}