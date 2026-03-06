import { initDb } from "./db";

async function main() {
  console.log("🔄 Running database migration...");
  await initDb();
  console.log("✅ Database migration complete — all tables are ready.");
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
