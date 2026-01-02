// import { NextRequest, NextResponse } from "next/server";
// import { licenseManager, LicenseType } from "@/lib/security/license-manager";
// import { machineFingerprinting } from "@/lib/security/machine-fingerprint";

// /**
//  * License Generation API Endpoint
//  * POST /api/license/generate
//  *
//  * This endpoint should be protected and only accessible to authorized administrators
//  */
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const {
//       type,
//       userId,
//       organizationId,
//       duration,
//       features = [],
//       maxActivations = 1,
//       machineId,
//     } = body;

//     // Basic validation
//     if (!type || !Object.values(LicenseType).includes(type)) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Valid license type is required",
//         },
//         { status: 400 }
//       );
//     }

//     // Get machine fingerprint
//     let machineFingerprint: string;
//     if (machineId) {
//       // If specific machine ID provided, use it (for testing)
//       machineFingerprint = machineId;
//     } else {
//       // Use current machine fingerprint
//       const fingerprint =
//         await machineFingerprinting.generateMachineFingerprint();
//       machineFingerprint = fingerprint.fingerprint;
//     }

//     // Generate license key
//     const licenseKey = licenseManager.generateLicenseKey(
//       type as LicenseType,
//       machineFingerprint,
//       userId,
//       organizationId,
//       duration, // days for trial licenses
//       features,
//       maxActivations
//     );

//     // Get license info for response
//     const licenseInfo = licenseManager.getLicenseInfo(licenseKey);

//     return NextResponse.json({
//       success: true,
//       data: {
//         licenseKey,
//         licenseInfo: licenseInfo
//           ? {
//               licenseId: licenseInfo.licenseId,
//               type: licenseInfo.type,
//               machineFingerprint: licenseInfo.machineFingerprint,
//               issueDate: licenseInfo.issueDate,
//               expiryDate: licenseInfo.expiryDate,
//               maxActivations: licenseInfo.maxActivations,
//               features: licenseInfo.features,
//               status: licenseInfo.status,
//             }
//           : null,
//         trialPeriod: type === LicenseType.TRIAL && duration ? duration : null,
//         instructions: {
//           storage: "Store this license key securely",
//           activation:
//             "The license will be automatically activated on this machine",
//           backup: "Create a backup of this license key",
//         },
//       },
//     });
//   } catch (error) {
//     console.error("License generation API error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to generate license key",
//       },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * GET /api/license/generate
//  * Generate trial license for current machine
//  */
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const duration = parseInt(searchParams.get("duration") || "30");
//     const type = searchParams.get("type") || LicenseType.TRIAL;

//     if (!Object.values(LicenseType).includes(type as LicenseType)) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "Invalid license type",
//         },
//         { status: 400 }
//       );
//     }

//     // Generate machine fingerprint
//     const fingerprint =
//       await machineFingerprinting.generateMachineFingerprint();

//     // Generate trial license
//     const licenseKey = licenseManager.generateLicenseKey(
//       type as LicenseType,
//       fingerprint.fingerprint,
//       undefined,
//       undefined,
//       duration
//     );

//     return NextResponse.json({
//       success: true,
//       data: {
//         licenseKey,
//         type,
//         duration,
//         machineFingerprint: fingerprint.fingerprint,
//         instructions: "This is a trial license for testing purposes",
//       },
//     });
//   } catch (error) {
//     console.error("Trial license generation API error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to generate trial license",
//       },
//       { status: 500 }
//     );
//   }
// }
