import { NextResponse } from "next/server";
import {
  checkAndRenewCalendarWatches,
  cleanupExpiredWatches,
} from "@/app/actions/automations/calendar-watch-renewal";

// This endpoint will be called by QStash
///TODO: TEST THIS
export async function POST(request: Request) {
  console.log("[calendar-watch] Starting calendar watch renewal process");

  try {
    const body = await request.json();
    console.log("[calendar-watch] Received request body:", body);

    // Run the renewal check
    console.log("[calendar-watch] Starting calendar watch renewal check");
    const renewalResult = await checkAndRenewCalendarWatches();
    console.log("[calendar-watch] Completed calendar watch renewal check");

    // Clean up expired watches
    console.log("[calendar-watch] Starting expired watches cleanup");
    const cleanupResult = await cleanupExpiredWatches();
    console.log("[calendar-watch] Completed expired watches cleanup");

    return NextResponse.json({
      success: true,
      renewalResult,
      cleanupResult,
    });
  } catch (error: any) {
    console.error("[calendar-watch] Error in calendar watch renewal:", error);

    // Return a more detailed error response
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
