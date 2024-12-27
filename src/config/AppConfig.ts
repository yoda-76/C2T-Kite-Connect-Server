export class AppConfig {
  static readonly PORT: number = Number(process.env.PORT) || 3001;
  static readonly REDIS_URL: string = "redis://127.0.0.1:6379";
  static readonly ALLOWED_ORIGINS: string[] = ['http://localhost:5173', 'https://www.oidelta.com', 'https://oidelta.com'];
  static readonly MAX_TOKENS_PER_TICKER: number = 1000;
  static readonly TICKER_COUNT: number = 3;
}