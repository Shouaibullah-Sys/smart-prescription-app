// import { NextRequest, NextResponse } from "next/server";
// import { licenseManager } from "@/lib/security/license-manager";
// import { licenseStorage } from "@/lib/security/license-storage";
// import { machineFingerprinting } from "@/lib/security/machine-fingerprint";

// /**
//  * License Activation API Endpoint
//  * POST /api/license/activate
//  */
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { licenseKey, userId, organizationId } = body;

//     if (!licenseKey) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "License key is required",
//         },
//         { status: 400 }
//       );
//     }

//     // Verify machine fingerprint before activation
//     const currentFingerprint =
//       await machineFingerprinting.generateMachineFingerprint();
//     // Activate the license
//     const activationResult = await licenseManager.activateLicense(licenseKey, {
//       licenseKey,
//       userId,
//       organizationId,
//     });

//     if (!activationResult.success) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: activationResult.message,
//         },
//         { status: 400 }
//       );
//     }

//     // Store the activated license
//     const validationResult = await licenseManager.validateLicenseKey(
//       licenseKey
//     );
//     if (validationResult.isValid) {
//       licenseStorage.storeLicense(licenseKey, validationResult);
//     }

//     return NextResponse.json({
//       success: true,
//       data: {
//         message: activationResult.message,
//         license: activationResult.license
//           ? {
//               licenseId: activationResult.license.licenseId,
//               type: activationResult.license.type,
//               status: activationResult.license.status,
//               features: activationResult.license.features,
//               currentActivations: activationResult.license.currentActivations,
//               maxActivations: activationResult.license.maxActivations,
//               expiryDate: activationResult.license.expiryDate,
//             }
//           : null,
//         machineFingerprint: currentFingerprint.fingerprint,
//         storageInfo: {
//           stored: true,
//           location: "Local secure storage",
//         },
//       },
//     });
//   } catch (error) {
//     console.error("License activation API error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to activate license",
//       },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * DELETE /api/license/activate
//  * Deactivate license on current machine
//  */
// export async function DELETE() {
//   try {
//     const storedLicense = licenseStorage.retrieveLicense();

//     if (!storedLicense) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: "No stored license found",
//         },
//         { status: 404 }
//       );
//     }

//     // Securely remove the license
//     licenseStorage.secureWipe();

//     return NextResponse.json({
//       success: true,
//       data: {
//         message: "License deactivated successfully",
//         deactivated: true,
//       },
//     });
//   } catch (error) {
//     console.error("License deactivation API error:", error);
//     return NextResponse.json(
//       {
//         success: false,
//         error: "Failed to deactivate license",
//       },
//       { status: 500 }
//     );
//   }
// }
