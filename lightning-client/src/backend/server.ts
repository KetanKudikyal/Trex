import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { WebSocketServer } from "ws";
// import { ethers } from "ethers"; // Not used in this file
import { LightningService } from "./services/LightningService.js";
import { OracleService } from "./services/OracleService.js";
import { SwapService } from "./services/SwapService.js";
import { lightningRoutes } from "./routes/lightning.js";
import { swapRoutes } from "./routes/swap.js";
import { oracleRoutes } from "./routes/oracle.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const WS_PORT = parseInt(process.env.WS_PORT || "3002");

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const lightningService = new LightningService();
const oracleService = new OracleService();
const swapService = new SwapService(lightningService, oracleService);

// Routes
app.use("/api/lightning", lightningRoutes(lightningService));
app.use("/api/swap", swapRoutes(swapService));
app.use("/api/oracle", oracleRoutes(oracleService));

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: {
      lightning: lightningService.isConnected(),
      oracle: oracleService.isConnected(),
      swap: swapService.isReady(),
    },
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
);

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Lightning Client Backend running on port ${PORT}`);
  console.log(
    `📡 Health check available at http://localhost:${PORT}/api/health`
  );
});

// WebSocket server for real-time updates
const wss = new WebSocketServer({ port: WS_PORT });
console.log(`🔌 WebSocket server running on port ${WS_PORT}`);

// WebSocket connection handling
wss.on("connection", (ws) => {
  console.log("New WebSocket connection established");

  ws.on("message", async (message) => {
    try {
      const data = JSON.parse(message.toString());

      switch (data.type) {
        case "subscribe_payment":
          // Subscribe to payment updates
          swapService.subscribeToPayment(data.paymentHash, ws);
          break;

        case "subscribe_swap":
          // Subscribe to swap updates
          swapService.subscribeToSwap(data.swapId, ws);
          break;

        default:
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unknown message type",
            })
          );
      }
    } catch (error) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message format",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    swapService.unsubscribe(ws);
  });
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down gracefully...");

  server.close(() => {
    console.log("HTTP server closed");
  });

  wss.close(() => {
    console.log("WebSocket server closed");
  });

  process.exit(0);
});

export { app, server, wss };
