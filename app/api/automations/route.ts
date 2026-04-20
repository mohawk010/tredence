import { NextResponse } from "next/server";
import { MOCK_AUTOMATIONS } from "@/lib/mockData";

export async function GET() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  return NextResponse.json(MOCK_AUTOMATIONS);
}
