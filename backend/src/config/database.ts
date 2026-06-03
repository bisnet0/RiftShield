import mongoose from "mongoose";

export async function connectDatabase() {
  let uri = process.env.DATABASE_URL || "mongodb://localhost:27017/riftshield";

  if (!process.env.DATABASE_URL || uri.includes("localhost") || uri.includes("127.0.0.1")) {
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const mongod = await MongoMemoryServer.create();
    uri = mongod.getUri();
    console.log("🧪 Usando MongoDB em memória");
  }

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("📦 Conectado ao MongoDB");
}

export function getDatabaseUri() {
  return uri;
}
