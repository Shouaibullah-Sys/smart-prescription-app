import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, and, or, like } from "drizzle-orm";
import {
  prescriptions,
  medicines,
  prescriptionsRelations,
  medicinesRelations,
  type Prescription,
  type NewPrescription,
  type Medicine,
  type NewMedicine,
} from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be a Neon postgres connection string");
}

// Enhanced connection configuration with timeout and retry logic
const createConnection = () => {
  const connectionString = process.env.DATABASE_URL!;

  // Parse the connection string to add connection parameters
  const url = new URL(connectionString);

  // Add connection timeout and retry parameters
  url.searchParams.set("connection_timeout", "10"); // 10 seconds
  url.searchParams.set("pool_timeout", "30"); // 30 seconds
  url.searchParams.set("statement_timeout", "60"); // 60 seconds
  url.searchParams.set("idle_timeout", "300"); // 5 minutes

  return neon(url.toString());
};

let sql = createConnection();

export const db = drizzle(sql, {
  schema: {
    prescriptions,
    medicines,
    prescriptionsRelations,
    medicinesRelations,
  },
});

// Connection health check
export const checkDatabaseConnection = async () => {
  try {
    const result = await sql`SELECT 1 as health_check`;
    return { healthy: true, result };
  } catch (error) {
    console.error("Database connection failed:", error);
    // Try to recreate connection
    try {
      sql = createConnection();
      const result = await sql`SELECT 1 as health_check`;
      return { healthy: true, result, reconnected: true };
    } catch (retryError) {
      console.error("Database reconnection failed:", retryError);
      return { healthy: false, error: retryError };
    }
  }
};

// Enhanced query function with retry logic
export const dbQuery = async <T>(
  queryFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error: any) {
      lastError = error;

      // If it's a connection error, try to reconnect
      if (
        error?.cause?.code === "ETIMEDOUT" ||
        error?.message?.includes("fetch failed")
      ) {
        console.warn(
          `Database query attempt ${attempt} failed, retrying...`,
          error.message
        );

        if (attempt < maxRetries) {
          // Recreate connection before retry
          try {
            sql = createConnection();
          } catch (reconnectError) {
            console.error("Failed to recreate connection:", reconnectError);
          }

          // Wait before retry (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, attempt - 1) * 1000)
          );
          continue;
        }
      }

      // For non-timeout errors, don't retry
      throw error;
    }
  }

  throw lastError;
};

export type { Prescription, NewPrescription, Medicine, NewMedicine };
export { prescriptions, medicines };

export const dbUtils = {
  async getPrescriptionsWithMedicines(userId: string, limit = 50) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(prescriptions.createdAt)
      .limit(limit);

    const grouped = result.reduce((acc, row) => {
      const prescription = row.prescriptions;
      const medicine = row.medicines;

      if (!acc[prescription.id]) {
        acc[prescription.id] = {
          ...prescription,
          medicines: [],
        };
      }

      if (medicine) {
        acc[prescription.id].medicines.push(medicine);
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  },

  async getPrescriptionWithMedicines(prescriptionId: string) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(eq(prescriptions.id, prescriptionId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId));

    if (result.length === 0) return null;

    const prescription = {
      ...result[0].prescriptions,
      medicines: result
        .filter((row) => row.medicines)
        .map((row) => row.medicines),
    };

    return prescription;
  },

  async searchPrescriptions(userId: string, searchTerm: string) {
    const result = await db
      .select()
      .from(prescriptions)
      .where(
        and(
          eq(prescriptions.userId, userId),
          or(like(prescriptions.patientName, `%${searchTerm}%`))
        )
      )
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(prescriptions.createdAt);

    const grouped = result.reduce((acc, row) => {
      const prescription = row.prescriptions;
      const medicine = row.medicines;

      if (!acc[prescription.id]) {
        acc[prescription.id] = {
          ...prescription,
          medicines: [],
        };
      }

      if (medicine) {
        acc[prescription.id].medicines.push(medicine);
      }

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  },
};
