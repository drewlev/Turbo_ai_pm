import { cn } from "@/lib/utils";
type Assignee = {
  label: string;
  url: string;
  id: number;
};
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const StackedInitials = ({ assignees }: { assignees: Assignee[] }) => {
  if (!assignees || assignees.length === 0) return null;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // For single assignee - simple avatar with initials and tooltip
  if (assignees.length === 1) {
    const assignee = assignees[0];
    const initials = getInitials(assignee.label);
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Avatar className="w-6 h-6 bg-blue-600 text-white">
              <AvatarFallback className="bg-blue-600 text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{assignee.label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // For multiple assignees - overlapping avatars with tooltips
  return (
    <TooltipProvider>
      <div className="flex -space-x-2 rtl:space-x-reverse">
        {assignees.slice(0, 2).map((assignee, idx) => {
          const initials = getInitials(assignee.label);
          const bgColor = idx === 0 ? "bg-blue-600" : "bg-green-600";
          return (
            <Tooltip key={assignee.id}>
              <TooltipTrigger asChild>
                <Avatar
                  className={cn(
                    "w-6 h-6 border-[1.5px] border-[#121212]",
                    `${bgColor} text-white`
                  )}
                  style={{ zIndex: 9 - idx }}
                >
                  <AvatarFallback className="bg-blue-600 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>{assignee.label}</TooltipContent>
            </Tooltip>
          );
        })}
        {assignees.length > 2 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-600 text-white text-xs font-semibold border-[1.5px] border-[#121212]"
                style={{ zIndex: 8 }}
              >
                +{assignees.length - 2}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {assignees
                .slice(2)
                .map((a) => a.label)
                .join(", ")}{" "}
              and {assignees.length - 2} more
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
};
