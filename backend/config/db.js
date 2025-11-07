import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let memoryServer; // keep reference to stop it gracefully

const connectDB = async () => {
  const uriFromEnv = process.env.MONGO_URI;

  // 1) Try regular MongoDB if MONGO_URI is provided
  if (uriFromEnv) {
    try {
      await mongoose.connect(uriFromEnv);
      console.log("✅ MongoDB Connected");
      return;
    } catch (err) {
      console.error("❌ Failed to connect to Mongo at MONGO_URI:", err.message);
    }
  }

  // 2) Fallback to in-memory Mongo for local dev when Docker/DB isn't available
  try {
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();
    await mongoose.connect(memUri);
    console.log("🧪 Using in-memory MongoDB (mongodb-memory-server)");

    // Graceful shutdown
    const shutdown = async () => {
      try {
        await mongoose.disconnect();
        if (memoryServer) await memoryServer.stop();
        process.exit(0);
      } catch {
        process.exit(1);
      }
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  } catch (err) {
    console.error("❌ Could not start in-memory MongoDB:", err.message);
    process.exit(1);
  }
};

export default connectDB;