"use client";
import {
  watchCalendar,
  stopWatchingCalendar,
} from "@/app/actions/google-calendar";
import { useAuth, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [watchDetails, setWatchDetails] = useState<{
    channelId: string;
    resourceId: string;
  } | null>(null);
  const [manualChannelId, setManualChannelId] = useState("");
  const [manualResourceId, setManualResourceId] = useState("");

  useEffect(() => {
    // Check if user is watching calendar
    if (user?.publicMetadata?.calendarChannelId) {
      setWatchDetails({
        channelId: user.publicMetadata.calendarChannelId as string,
        resourceId: user.publicMetadata.calendarResourceId as string,
      });
      setManualChannelId(user.publicMetadata.calendarChannelId as string);
      setManualResourceId(user.publicMetadata.calendarResourceId as string);
    }
  }, [user]);

  const handleWatchCalendar = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await watchCalendar();
      setSuccess("Successfully set up calendar notifications!");
      console.log("Calendar watch response:", response);
      setWatchDetails({
        channelId: response.channelId,
        resourceId: response.resourceId,
      });
      setManualChannelId(response.channelId);
      setManualResourceId(response.resourceId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set up calendar notifications"
      );
      console.error("Calendar watch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopWatching = async () => {
    if (!watchDetails) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await stopWatchingCalendar(
        watchDetails.channelId,
        watchDetails.resourceId
      );
      setSuccess("Successfully stopped calendar notifications!");
      setWatchDetails(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to stop calendar notifications"
      );
      console.error("Stop calendar watch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualStop = async () => {
    if (!manualChannelId || !manualResourceId) {
      setError("Please enter both Channel ID and Resource ID");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await stopWatchingCalendar(manualChannelId, manualResourceId);
      setSuccess("Successfully stopped calendar notifications!");
      setWatchDetails(null);
      setManualChannelId("");
      setManualResourceId("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to stop calendar notifications"
      );
      console.error("Stop calendar watch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSignedIn) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p>Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">
            Google Calendar Integration
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            {watchDetails
              ? "Calendar notifications are currently active"
              : "Set up notifications for calendar events"}
          </p>

          <div className="space-y-4">
            <div className="space-x-4">
              <Button
                onClick={handleWatchCalendar}
                disabled={isLoading || !!watchDetails}
                variant={watchDetails ? "outline" : "default"}
              >
                {isLoading ? "Setting up..." : "Set up Calendar Notifications"}
              </Button>

              <Button
                onClick={handleStopWatching}
                disabled={isLoading || !watchDetails}
                variant="destructive"
              >
                {isLoading ? "Stopping..." : "Stop Calendar Notifications"}
              </Button>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-sm font-medium mb-2">Manual Stop</h3>
              <div className="space-y-2">
                <div>
                  <Label htmlFor="channelId">Channel ID</Label>
                  <Input
                    id="channelId"
                    value={manualChannelId}
                    onChange={(e) => setManualChannelId(e.target.value)}
                    placeholder="Enter Channel ID"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="resourceId">Resource ID</Label>
                  <Input
                    id="resourceId"
                    value={manualResourceId}
                    onChange={(e) => setManualResourceId(e.target.value)}
                    placeholder="Enter Resource ID"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleManualStop}
                  disabled={isLoading || !manualChannelId || !manualResourceId}
                  variant="destructive"
                >
                  {isLoading ? "Stopping..." : "Stop with Manual IDs"}
                </Button>
              </div>
            </div>
          </div>

          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          {success && <p className="mt-2 text-sm text-green-500">{success}</p>}
        </div>
      </div>
    </div>
  );
}
