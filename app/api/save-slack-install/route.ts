import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json(); // Assuming the body is JSON
    console.log("Body (parsed JSON):", requestBody);

    return NextResponse.json({
      message: "message received",
      body: requestBody,
    });
  } catch (error) {
    console.error("Error parsing request body:", error);
  }
}
