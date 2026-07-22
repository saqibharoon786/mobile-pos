import mongoose from "mongoose";

export const healthController = {
  check(_req, res) {
    const dbState = mongoose.connection.readyState;
    const dbStatus =
      dbState === 1 ? "connected" : dbState === 2 ? "connecting" : "disconnected";

    res.json({
      status: "ok",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  },
};
