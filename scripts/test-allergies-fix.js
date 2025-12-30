// scripts/test-allergies-fix.js
const { createClient } = require("@neondatabase/serverless");
require("dotenv").config();

async function testAllergiesFix() {
  const neon = createClient(process.env.DATABASE_URL);

  try {
    console.log("🧪 Testing allergies fix...");

    // Connect to the database
    await neon.connect();
    console.log("✅ Connected to database");

    // Check column types first
    const columnCheck = await neon.execute(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'prescriptions' 
      AND column_name IN ('allergies', 'current_medications')
      ORDER BY column_name
    `);

    console.log("Current column types:");
    columnCheck.rows.forEach((row) => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });

    // Test inserting a prescription with string allergies
    console.log("🔄 Testing insert with string allergies...");

    const testPrescriptionId = `test_${Date.now()}`;
    const testData = {
      id: testPrescriptionId,
      user_id: "test_user",
      patient_name: "Test Patient",
      patient_age: "30",
      patient_gender: "Male",
      patient_phone: "1234567890",
      allergies: "Diagnosis", // This was causing the error
      current_medications: "Metafine",
      doctor_name: "Dr. Test",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const insertQuery = `
      INSERT INTO prescriptions (
        id, user_id, patient_name, patient_age, patient_gender, patient_phone,
        allergies, current_medications, doctor_name, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;

    await neon.execute(insertQuery, [
      testData.id,
      testData.user_id,
      testData.patient_name,
      testData.patient_age,
      testData.patient_gender,
      testData.patient_phone,
      testData.allergies,
      testData.current_medications,
      testData.doctor_name,
      testData.created_at,
      testData.updated_at,
    ]);

    console.log("✅ Insert test successful!");

    // Verify the data was inserted correctly
    const verifyResult = await neon.execute(
      `
      SELECT id, allergies, current_medications 
      FROM prescriptions 
      WHERE id = $1
    `,
      [testPrescriptionId]
    );

    if (verifyResult.rows.length > 0) {
      const row = verifyResult.rows[0];
      console.log("✅ Data verification successful:");
      console.log(`  ID: ${row.id}`);
      console.log(`  Allergies: "${row.allergies}"`);
      console.log(`  Current Medications: "${row.current_medications}"`);
    }

    // Clean up test data
    await neon.execute("DELETE FROM prescriptions WHERE id = $1", [
      testPrescriptionId,
    ]);
    console.log("🧹 Test data cleaned up");

    console.log("🎉 All tests passed! The fix is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await neon.end();
    console.log("🔌 Database connection closed");
  }
}

// Run the test
testAllergiesFix()
  .then(() => {
    console.log("Test script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Test script failed:", error);
    process.exit(1);
  });
