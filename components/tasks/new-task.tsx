"use client";

import { Button } from "../ui/button";
import { SquarePen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewTask() {
  const router = useRouter();

  return (
    <div className="px-4 py-2">
      <Button
        variant="outline"
        className="w-full justify-start gap-2 bg-[var(--background-dark)] border-[var(--border-accent)] text-white"
        onClick={() => router.push("/app/task/new")}
      >
        <SquarePen className="h-4 w-4" />
        New Task
      </Button>
    </div>
  );
}
