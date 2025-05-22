"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Circle, MessageSquare, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SnapshotSummary() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="text-xs text-[#6e6a68]">Project Phase</div>
          <div className="text-xs text-[#6e6a68]">Client Contact</div>
          <div className="text-xs text-[#6e6a68]">Last Loom Sent</div>
        </div>
        <div className="space-y-4">
          <div>Design 2/4</div>
          <div className="flex items-center gap-2">
            <Avatar className="h-5 w-5">
              <AvatarImage
                src="/placeholder.svg?height=20&width=20"
                alt="Alex Levine"
              />
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span>Alex Levine</span>
            <span className="text-[#6e6a68]">alex@rallyhq.com</span>
          </div>
          <div className="flex items-center gap-2">
            <span>May 8, 2025 (2 days ago)</span>
            <Link href="#" className="text-[#dd743b] text-sm flex items-center">
              View Recording <ArrowRight className="h-3 w-3 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 t">
        <div>
          <div className="text-xs text-[#6e6a68] flex items-center gap-2 mb-2">
            <Circle className="h-3 w-3 fill-[#5092e0] text-[#5092e0]" />
            Project Status
          </div>
          <Card className="bg-[#1f1e1e] border-[#292828] p-3 text-sm h-full">
            <p className="text-white">
              The project is progressing as expected. Wireframes are approved,
              and the team is working on mockups. Client feedback is positive,
              but timeline concerns remain.
            </p>
          </Card>
        </div>

        <div>
          <div className="text-xs text-[#6e6a68] flex items-center gap-2 mb-2">
            <Check className="h-3 w-3 text-[#55e050]" />
            Top 3 Next Actions
          </div>
          <Card className="bg-[#1f1e1e] border-[#292828] p-3 text-sm h-full">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                  <Check className="h-4 w-4 text-[#55e050]" />
                </div>
                <span className="text-white">
                  Complete homepage design by May 15
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                  <Check className="h-4 w-4 text-[#55e050]" />
                </div>
                <span className="text-white">
                  Schedule design review meeting with Cees
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                  <Check className="h-4 w-4 text-[#55e050]" />
                </div>
                <span className="text-white">
                  Finalize content for product pages
                </span>
              </li>
            </ul>
          </Card>
        </div>

        <div>
          <div className="text-xs text-[#6e6a68] flex items-center gap-2 mb-2">
            <MessageSquare className="h-3 w-3 text-[#5092e0]" />
            Open Questions
          </div>
          <Card className="bg-[#1f1e1e] border-[#292828] p-3 text-sm h-full">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-[#5092e0]" />
                </div>
                <span className="text-white">
                  Will the client provide product photography or should we
                  source stock images?
                </span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-4 w-4 mt-0.5 flex-shrink-0">
                  <MessageSquare className="h-4 w-4 text-[#5092e0]" />
                </div>
                <span className="text-white">
                  Do we need to support RTL for this project?
                </span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
