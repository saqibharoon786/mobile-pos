import { connectDatabase } from "./database/connection.js";
import app from "./app.js";
import { config } from "./config/index.js";

async function start() {
  try {
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(`Charge Mart API running on http://localhost:${config.port}`);
      console.log(`Health check: http://localhost:${config.port}/api/health`);
      console.log(`Environment: ${config.nodeEnv}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `\nPort ${config.port} pehle se use ho raha hai (koi aur app chal rahi hai).\n` +
            `Fix: backend/.env mein PORT=5001 likhain, ya purani process band karain:\n` +
            `  netstat -ano | findstr :${config.port}\n` +
            `  taskkill /PID <pid> /F\n`,
        );
      } else {
        console.error("Server error:", err.message);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
