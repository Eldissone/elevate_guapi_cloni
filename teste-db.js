import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

(async () => {
  try {
    console.log("Conectando...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Mongo conectado com sucesso!");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erro ao conectar:", e);
    process.exit(1);
  }
})();
