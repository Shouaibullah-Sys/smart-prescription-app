// app/api/autocomplete/medicines/route.ts

import { NextRequest, NextResponse } from "next/server";
import { aiMedicationService } from "@/services/aiMedicationService";
import { medicationDB } from "@/services/medicationDatabaseService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, context, limit = 10 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "متن جستجو الزامی است" },
        { status: 400 }
      );
    }

    // Use AI service for intelligent suggestions
    const suggestions = await aiMedicationService.smartAutocomplete(
      text,
      context
    );

    // Format response
    const formatted = suggestions.slice(0, limit).map((suggestion) => ({
      name: suggestion.medication.name,
      generic_name: suggestion.medication.generic_name || "",
      category: suggestion.medication.category.join(", "),
      dosage_form: suggestion.medication.dosage_forms?.[0] || "Tablet",
      strength: suggestion.medication.strengths?.[0] || "Unknown",
      confidence: suggestion.confidence,
      reasoning: suggestion.reasoning,
      dosage_suggestion: suggestion.dosage_suggestion,
      frequency_suggestion: suggestion.frequency_suggestion,
      precautions: suggestion.precautions,
      alternatives: suggestion.alternatives?.map((alt) => ({
        name: alt.name,
        generic_name: alt.generic_name || "",
        reason: "جایگزین مناسب",
      })),
    }));

    return NextResponse.json({
      suggestions: formatted,
      query: text,
      total: suggestions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Autocomplete error:", error);

    // Fallback to local database
    try {
      const body = await request.clone().json();
      const text = body.text || "";
      const suggestions = medicationDB.getSuggestions(text);

      return NextResponse.json({
        suggestions: suggestions.slice(0, 10),
        query: text,
        total: suggestions.length,
        fallback: true,
        timestamp: new Date().toISOString(),
      });
    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: "خطا در پردازش درخواست",
          suggestions: [],
          fallback: true,
        },
        { status: 500 }
      );
    }
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query) {
    return NextResponse.json(
      { error: "پارامتر q الزامی است" },
      { status: 400 }
    );
  }

  const suggestions = medicationDB.getSuggestions(query);

  // Filter by category if provided
  const filtered = category
    ? suggestions.filter((s) =>
        s.category?.toLowerCase().includes(category.toLowerCase())
      )
    : suggestions;

  return NextResponse.json({
    suggestions: filtered.slice(0, limit),
    query,
    category,
    total: filtered.length,
    timestamp: new Date().toISOString(),
  });
}
