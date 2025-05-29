import { NextResponse } from "next/server";
import {
  checkAndRenewCalendarWatches,
  cleanupExpiredWatches,
} from "@/app/actions/automations/calendar-watch-renewal";

// This endpoint will be called by QStash
export async function POST(request: Request) {
  try {
    // Run the renewal check
    await checkAndRenewCalendarWatches();

    // Clean up expired watches
    await cleanupExpiredWatches();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[qstash] Error in calendar watch renewal:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
