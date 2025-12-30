// TypeScript script to run the allergies migration
import { db, dbQuery } from "../db/index";

async function runMigration() {
  try {
    console.log("🚀 Running allergies migration...");

    // Convert allergies column
    console.log("📋 Converting allergies column to text...");
    await dbQuery(async () => {
      await db.execute(`
        ALTER TABLE prescriptions 
        ALTER COLUMN allergies TYPE text;
      `);
    });
    console.log("✅ allergies column converted to text");

    // Convert currentMedications column
    console.log("📋 Converting currentMedications column to text...");
    await dbQuery(async () => {
      await db.execute(`
        ALTER TABLE prescriptions 
        ALTER COLUMN current_medications TYPE text;
      `);
    });
    console.log("✅ currentMedications column converted to text");

    console.log("🎉 Migration completed successfully!");
    console.log(
      "🔄 Please restart your development server to see the changes."
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    console.log("\n🔧 If this fails, you can run this SQL manually:");
    console.log("ALTER TABLE prescriptions ALTER COLUMN allergies TYPE text;");
    console.log(
      "ALTER TABLE prescriptions ALTER COLUMN current_medications TYPE text;"
    );
  }
}

runMigration();
