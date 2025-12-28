// Enhanced PDF generation debugging component
// components/pdf-debug-helper.tsx

import React from "react";

interface PDFDebugHelperProps {
  prescriptionId: string;
  onGeneratePDF: (prescriptionId: string) => Promise<void>;
}

export const PDFDebugHelper: React.FC<PDFDebugHelperProps> = ({
  prescriptionId,
  onGeneratePDF,
}) => {
  const [debugData, setDebugData] = React.useState<any>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGeneratePDF = async (prescriptionId: string) => {
    setIsGenerating(true);
    try {
      console.log("🔍 Starting PDF generation debugging...");

      // Fetch the prescription with detailed logging
      console.log("📡 Fetching prescription from API...");
      const response = await fetch(`/api/prescriptions/${prescriptionId}`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(`API Error: ${result.error}`);
      }

      const prescriptionData = result.data;

      // Enhanced debugging data collection
      const debugInfo = {
        apiResponse: {
          success: result.success,
          hasData: !!result.data,
          prescriptionId: prescriptionData?.id,
          prescriptionExists: !!prescriptionData,
        },
        prescription: {
          id: prescriptionData?.id,
          patientName: prescriptionData?.patientName,
          doctorName: prescriptionData?.doctorName,
          date: prescriptionData?.date,
          medicinesCount: prescriptionData?.medicines?.length || 0,
        },
        medicalExams: {
          exists: !!prescriptionData?.medicalExams,
          isArray: Array.isArray(prescriptionData?.medicalExams),
          type: typeof prescriptionData?.medicalExams,
          length: prescriptionData?.medicalExams?.length,
          value: prescriptionData?.medicalExams,
          isNull: prescriptionData?.medicalExams === null,
          isUndefined: prescriptionData?.medicalExams === undefined,
          isEmptyArray:
            Array.isArray(prescriptionData?.medicalExams) &&
            prescriptionData?.medicalExams?.length === 0,
        },
        medicines: {
          exists: !!prescriptionData?.medicines,
          isArray: Array.isArray(prescriptionData?.medicines),
          type: typeof prescriptionData?.medicines,
          length: prescriptionData?.medicines?.length,
          firstMedicine: prescriptionData?.medicines?.[0] || null,
        },
        otherFields: {
          allergies: {
            exists: !!prescriptionData?.allergies,
            isArray: Array.isArray(prescriptionData?.allergies),
            length: prescriptionData?.allergies?.length,
            value: prescriptionData?.allergies,
          },
          currentMedications: {
            exists: !!prescriptionData?.currentMedications,
            isArray: Array.isArray(prescriptionData?.currentMedications),
            length: prescriptionData?.currentMedications?.length,
            value: prescriptionData?.currentMedications,
          },
          vitalSigns: {
            pulseRate: prescriptionData?.pulseRate,
            bloodPressure: prescriptionData?.bloodPressure,
            temperature: prescriptionData?.temperature,
            heartRate: prescriptionData?.heartRate,
            respiratoryRate: prescriptionData?.respiratoryRate,
            oxygenSaturation: prescriptionData?.oxygenSaturation,
          },
        },
      };

      // Log detailed debugging information
      console.log("📊 Full Debug Information:", debugInfo);
      console.log("📋 Prescription Data:", prescriptionData);
      console.log("🔬 Medical Exams Analysis:", debugInfo.medicalExams);
      console.log("💊 Medicines Analysis:", debugInfo.medicines);
      console.log("⚕️ Other Fields Analysis:", debugInfo.otherFields);

      // Store debug data for display
      setDebugData(debugInfo);

      // Generate PDF
      console.log("📄 Starting PDF generation...");
      await onGeneratePDF(prescriptionId);
      console.log("✅ PDF generation completed");
    } catch (error) {
      console.error("❌ Error in PDF generation:", error);

      // Enhanced error logging
      const errorDebug = {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        prescriptionId,
        timestamp: new Date().toISOString(),
      };

      console.error("🐛 Error Debug Info:", errorDebug);
      setDebugData({ error: errorDebug });
    } finally {
      setIsGenerating(false);
    }
  };

  // Component for displaying debug information
  const DebugPanel = () => {
    if (!debugData) return null;

    if (debugData.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
          <h3 className="text-red-800 font-semibold mb-2">❌ Error Details</h3>
          <pre className="text-red-700 text-sm overflow-auto">
            {JSON.stringify(debugData.error, null, 2)}
          </pre>
        </div>
      );
    }

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
        <h3 className="text-blue-800 font-semibold mb-2">
          🔍 Debug Information
        </h3>

        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-blue-700">Medical Exams:</h4>
            <pre className="bg-white p-2 rounded border text-xs">
              {JSON.stringify(debugData.medicalExams, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-blue-700">Medicines:</h4>
            <pre className="bg-white p-2 rounded border text-xs">
              {JSON.stringify(debugData.medicines, null, 2)}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-blue-700">
              Prescription Summary:
            </h4>
            <pre className="bg-white p-2 rounded border text-xs">
              {JSON.stringify(debugData.prescription, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg p-4">
      <h3 className="text-lg font-semibold mb-4">📄 PDF Generation Debugger</h3>

      <button
        onClick={() => handleGeneratePDF(prescriptionId)}
        disabled={isGenerating}
        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded"
      >
        {isGenerating ? "⏳ Generating..." : "📄 Generate PDF (Debug)"}
      </button>

      <DebugPanel />
    </div>
  );
};

// Utility function for standalone debugging
export const debugPrescriptionData = async (prescriptionId: string) => {
  console.log("🔍 Starting standalone prescription debugging...");

  try {
    const response = await fetch(`/api/prescriptions/${prescriptionId}`);
    const result = await response.json();

    if (!result.success) {
      throw new Error(`API Error: ${result.error}`);
    }

    const data = result.data;

    console.log("📊 Complete Prescription Data Structure:");
    console.log("===========================================");
    console.log("Full Object:", data);
    console.log("");

    console.log("🔬 Field-by-Field Analysis:");
    console.log("============================");
    Object.keys(data).forEach((key) => {
      const value = data[key];
      const type = Array.isArray(value) ? "Array" : typeof value;
      const length = Array.isArray(value) ? ` (length: ${value.length})` : "";
      console.log(`${key}: ${type}${length}`, value);
    });

    console.log("");
    console.log("🎯 Key Fields Check:");
    console.log("====================");
    console.log("medicalExams exists:", !!data.medicalExams);
    console.log("medicalExams type:", typeof data.medicalExams);
    console.log("medicalExams is array:", Array.isArray(data.medicalExams));
    console.log("medicalExams length:", data.medicalExams?.length);
    console.log("medicalExams value:", data.medicalExams);

    console.log("");
    console.log("medicines exists:", !!data.medicines);
    console.log("medicines type:", typeof data.medicines);
    console.log("medicines is array:", Array.isArray(data.medicines));
    console.log("medicines length:", data.medicines?.length);

    return data;
  } catch (error) {
    console.error("❌ Debug error:", error);
    throw error;
  }
};
