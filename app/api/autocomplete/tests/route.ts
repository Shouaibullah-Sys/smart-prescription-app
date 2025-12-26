// app/api/autocomplete/tests/route.ts

import { NextRequest, NextResponse } from "next/server";
import { testDB } from "@/services/testDatabaseService";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, limit = 10 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "متن جستجو الزامی است" },
        { status: 400 }
      );
    }

    // Get suggestions from local database
    const suggestions = testDB.getSuggestions(text);

    // Format response
    const formatted = suggestions.slice(0, limit).map((suggestion) => ({
      id: suggestion.id,
      name: suggestion.name,
      category: suggestion.category,
      type: suggestion.type,
      preparation: suggestion.preparation || [],
      fasting_required: suggestion.fasting_required || false,
    }));

    return NextResponse.json({
      suggestions: formatted,
      query: text,
      total: suggestions.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Test autocomplete error:", error);

    return NextResponse.json(
      {
        error: "خطا در پردازش درخواست",
        suggestions: [],
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (!query) {
    return NextResponse.json(
      { error: "پارامتر q الزامی است" },
      { status: 400 }
    );
  }

  const suggestions = testDB.getSuggestions(query);

  // Filter by category if provided
  let filtered = suggestions;
  if (category) {
    filtered = filtered.filter((s) =>
      s.category?.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Filter by type if provided
  if (type) {
    filtered = filtered.filter((s) =>
      s.type?.toLowerCase().includes(type.toLowerCase())
    );
  }

  return NextResponse.json({
    suggestions: filtered.slice(0, limit),
    query,
    category,
    type,
    total: filtered.length,
    timestamp: new Date().toISOString(),
  });
}
