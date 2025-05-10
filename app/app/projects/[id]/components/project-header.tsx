import type React from "react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export function ProjectHeader() {
  return (
    <header className="sticky top-0 z-10 bg-[var(--background-dark)] border-b border-[var(--border-dark)] shadow-sm">
      <div className="max-w-[1200px] mx-auto px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            className="rounded-sm"
            src="https://n1v74cls2c.ufs.sh/f/XAC5NGVjIxRTyIYbktgRkYIPZNFQpvTomWh6SO39DjtMaGlu"
            alt="Rally"
            width={32}
            height={32}
          />
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            Rally
          </h1>
          <div className="flex items-center gap-2 text-[var(--text-secondary)]"></div>
        </div>

        <div className="flex items-center gap-6">
          <Badge
            variant="outline"
            className="bg-blue-500 text-[var(--text-primary)] border-[var(--border-accent)] px-3 py-1"
          >
            Design Phase
          </Badge>

          <div className="flex -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-[var(--background-dark)]">
              <AvatarImage src="/placeholder.svg?height=32&width=32" alt="PM" />
              <AvatarFallback>PM</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-[var(--background-dark)]">
              <AvatarImage
                src="/placeholder.svg?height=32&width=32"
                alt="Designer"
              />
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
          </div>

          <div className="text-sm text-[var(--text-secondary)]">
            <span>May 1 – Jun 30, 2025</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function WarningIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
