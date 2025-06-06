"use client";

import { formatDistanceToNowStrict, differenceInCalendarDays } from "date-fns";
import { useState, useEffect } from "react";

interface DaysOutDisplayerProps {
  dateString?: string | Date | null;
}

export const DaysOutDisplayer = ({ dateString }: DaysOutDisplayerProps) => {
  const [displayString, setDisplayString] = useState<string | null>(null);

  useEffect(() => {
    if (!dateString) {
      setDisplayString(null);
      return;
    }

    try {
      const date =
        typeof dateString === "string" ? new Date(dateString) : dateString;

      if (isNaN(date?.getTime())) {
        setDisplayString("Invalid Date");
        return;
      }

      const daysDifference = differenceInCalendarDays(date, new Date());

      if (daysDifference === 0) {
        setDisplayString("Today");
      } else if (daysDifference === 1) {
        setDisplayString("Tomorrow");
      } else if (daysDifference === -1) {
        setDisplayString("Yesterday");
      } else if (daysDifference > 1) {
        setDisplayString(`In ${daysDifference}d`);
      } else if (daysDifference < -1) {
        setDisplayString(`${daysDifference}d`);
      } else {
        // Fallback for unexpected cases
        setDisplayString(formatDistanceToNowStrict(date, { addSuffix: false }));
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      setDisplayString("Error");
    }
  }, [dateString]);

  return displayString ;
};
