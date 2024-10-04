import express from "express";
import Redis from "ioredis";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server as WebSocketServer } from "socket.io";
var { KiteTicker, KiteConnect } = require("kiteconnect");

const port = process.env.PORT || 3001;
const app = express();
const httpServer = createServer(app);

const redisClient = new Redis("rediss://default:AeQcAAIjcDE0MjMyYTMzNDEwYzc0Y2ZiOWFkMzk1M2JlZTgwM2IwMHAxMA@helpful-polliwog-58396.upstash.io:6379");
app.use(express.json());
app.use(cookieParser());

// CORS stuff
const allowedOrigins = ['http://localhost:5173', 'https://www.oidelta.com', 'https://oidelta.com'];
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, userId, agentid, adminid, skey"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Handle Kite auth
app.get("/api/kite/auth", async (req, res) => {
  try {
    console.log(req.query);
    const request_token = req.query.request_token as string;
    const api_secret = "---your-api-secret---";
    const api_key = "---your-api-key---";

    const kc = new KiteConnect({ api_key });

    const sessionResp = await kc.generateSession(request_token, api_secret);
    console.log("Session response:", sessionResp);
    const access_token = sessionResp.access_token;

    await redisClient.set(`KITE_CONNECT_access_token`, access_token);

    initiateMarketFeed(api_key, access_token);

    res.send('Kite Authentication Successful');
  } catch (err) {
    console.error("Error in kite auth flow:", err);
    res.status(500).json({ message: 'Error occurred', error: err.message });
  }
});

function initiateMarketFeed(api_key: string, access_token: string) {
  const ticker = new KiteTicker({
    api_key,
    access_token
  });

  ticker.autoReconnect(true, 10, 5);
  ticker.connect();
  ticker.on("ticks", onTicks);
  ticker.on("connect", subscribe);

  ticker.on("noreconnect", function() {
    console.log("noreconnect");
  });

  ticker.on("reconnecting", function(reconnect_interval, reconnections) {
    console.log("Reconnecting: attempt - ", reconnections, " interval - ", reconnect_interval);
  });

  function onTicks(ticks: any) {
    // publish data to marketTkis channel in redis
    redisClient.publish("marketTicks", JSON.stringify(ticks));

    
  }

  function subscribe() {
    const items = [738561, 415745, 779521];
    ticker.subscribe(items);
    ticker.setMode(ticker.modeLTP, items);
  }
}
// Start the server
httpServer.listen(port, () => {
  console.log(`App is running at http://localhost:${port}`);
});
