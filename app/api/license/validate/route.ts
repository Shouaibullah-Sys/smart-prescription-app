import { NextRequest, NextResponse } from "next/server";
import { licenseManager } from "@/lib/security/license-manager";
import { licenseStorage } from "@/lib/security/license-storage";

/**
 * License Validation API Endpoint
 * POST /api/license/validate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { licenseKey, storeLicense = false } = body;

    if (!licenseKey) {
      return NextResponse.json(
        {
          success: false,
          error: "License key is required",
        },
        { status: 400 }
      );
    }

    // Validate the license
    const validationResult = await licenseManager.validateLicenseKey(
      licenseKey
    );

    // If validation successful and storeLicense is true, store the license
    if (validationResult.isValid && storeLicense) {
      licenseStorage.storeLicense(licenseKey, validationResult);
    }

    return NextResponse.json({
      success: validationResult.isValid,
      data: {
        isValid: validationResult.isValid,
        license: validationResult.license
          ? {
              licenseId: validationResult.license.licenseId,
              type: validationResult.license.type,
              status: validationResult.license.status,
              features: validationResult.license.features,
              expiryDate: validationResult.license.expiryDate,
              daysRemaining: validationResult.daysRemaining,
            }
          : null,
        reason: validationResult.reason,
        isExpired: validationResult.isExpired,
        isTampered: validationResult.isTampered,
        features: validationResult.features,
      },
    });
  } catch (error) {
    console.error("License validation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during license validation",
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/license/validate
 * Check stored license status
 */
export async function GET() {
  try {
    const storedLicense = licenseStorage.retrieveLicense();

    if (!storedLicense) {
      return NextResponse.json({
        success: true,
        data: {
          hasStoredLicense: false,
          isValid: false,
          message: "No stored license found",
        },
      });
    }

    // Validate the stored license
    const validationResult = await licenseManager.validateLicenseKey(
      storedLicense.licenseKey
    );

    // Update storage with latest validation
    licenseStorage.updateValidationInfo(validationResult);

    return NextResponse.json({
      success: validationResult.isValid,
      data: {
        hasStoredLicense: true,
        isValid: validationResult.isValid,
        license: validationResult.license
          ? {
              licenseId: validationResult.license.licenseId,
              type: validationResult.license.type,
              status: validationResult.license.status,
              features: validationResult.license.features,
              expiryDate: validationResult.license.expiryDate,
              daysRemaining: validationResult.daysRemaining,
            }
          : null,
        reason: validationResult.reason,
        isExpired: validationResult.isExpired,
        isTampered: validationResult.isTampered,
        storageStats: licenseStorage.getStorageStats(),
      },
    });
  } catch (error) {
    console.error("License validation GET API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error during license validation",
      },
      { status: 500 }
    );
  }
}
