import mongoose from "mongoose";

export async function connectDatabase() {
  const uri = process.env.DATABASE_URL || "mongodb://localhost:27017/riftshield";

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("📦 Conectado ao MongoDB");
}
