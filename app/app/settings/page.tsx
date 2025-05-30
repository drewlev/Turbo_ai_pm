"use server";

import FirefliesSettings from "@/app/app/settings/_components/fireflies-settings";
import {
  getFirefliesWebhookUrl,
  hasFirefliesApiKey,
} from "@/app/actions/fireflies";
import CalendarEventKeywordsSettings from "./_components/keywords";
import { getTrackingKeywords } from "@/app/actions/settings/calendar-event-tracking";

export default async function SettingsPage() {
  const webhookId = await getFirefliesWebhookUrl();
  const hasKey = await hasFirefliesApiKey();
  const initialKeywords = await getTrackingKeywords();

  return (
    <div className="p-4 bg-[var(--background-dark)] h-screen">
      <h1 className="text-2xl font-bold mb-4 text-[var(--text-primary)]">
        Settings
      </h1>

      <div className="space-y-4">
        <FirefliesSettings webhookId={webhookId} hasKey={hasKey} />
        <CalendarEventKeywordsSettings initialKeywords={initialKeywords} />
      </div>
    </div>
  );
}
