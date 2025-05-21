import { NextResponse } from "next/server";
import db from "@/app/db";
import { onboarding } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  try {
    const { companyName, slug } = await request.json();

    if (!companyName || !slug) {
      return NextResponse.json(
        { error: "Company name and slug are required" },
        { status: 400 }
      );
    }

    // Find the onboarding record by slug
    const onboardingRecord = await db.query.onboarding.findFirst({
      where: eq(onboarding.slug, slug),
    });

    if (!onboardingRecord) {
      return NextResponse.json(
        { error: "Invalid onboarding link" },
        { status: 404 }
      );
    }

    if (onboardingRecord.status !== "pending") {
      return NextResponse.json(
        { error: "This onboarding link has already been used" },
        { status: 400 }
      );
    }

    // Update the onboarding record
    // await db
    //   .update(onboarding)
    //   .set({
    //     status: "completed",
    //     companyName,
    //     completedAt: new Date(),
    //   })
    //   .where(eq(onboarding.slug, slug));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error submitting onboarding form:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
