// app/page.tsx
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard-client";
import { Prescription } from "@/types/prescription";
import { db } from "@/db/index";
import { prescriptions, medicines } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";

export default async function HomePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Fetch initial prescriptions on server side for better UX
  let initialPrescriptions: Prescription[] = [];

  try {
    // Get prescriptions for the user
    const prescriptionsData = await db
      .select({
        prescription: prescriptions,
        medicine: medicines,
      })
      .from(prescriptions)
      .where(eq(prescriptions.userId, userId))
      .leftJoin(medicines, eq(prescriptions.id, medicines.prescriptionId))
      .orderBy(desc(prescriptions.createdAt))
      .limit(50); // Limit initial load

    // Group prescriptions with their medicines
    const groupedPrescriptions = prescriptionsData.reduce((acc, row) => {
      const prescription = row.prescription;
      const medicine = row.medicine;

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

    initialPrescriptions = Object.values(groupedPrescriptions);
  } catch (error) {
    console.error("Error fetching initial prescriptions:", error);
    // Continue with empty array if fetch fails
  }

  return <DashboardClient initialPrescriptions={initialPrescriptions} />;
}
