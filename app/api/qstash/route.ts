import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const requestUrl = request.url;
  const requestMethod = request.method;

  try {
    const requestBody = await request.json(); // Assuming the body is JSON
    console.log("URL:", requestUrl);
    console.log("Method:", requestMethod);
    console.log("Body (parsed JSON):", requestBody);
    return NextResponse.json({
      message: "message received",
      body: requestBody,
    });
  } catch (error) {
    console.error("Error parsing request body:", error);
  }
}
