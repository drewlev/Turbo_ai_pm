import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/combobox";
import { StackedInitials } from "@/components/stacked-avatars";
import { Users } from "lucide-react";

export type Assignee = {
  url: string;
  id: number;
};

export type Option = {
  value: string;
  label: string;
};

interface AssigneeButtonProps {
  assigneeValue: Assignee[];
  assigneeOptions: Option[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const AssigneeButton = ({
  assigneeValue,
  assigneeOptions,
  onValueChange,
  placeholder = "Assignee",
  // className = "h-8 text-xs bg-transparent border-[var(--border-dark)] text-[var(--text-primary)] hover:bg-[var(--background-light)] hover:text-white",
}: AssigneeButtonProps) => {
  return (
    <Combobox
      options={assigneeOptions}
      value={assigneeValue.map((a) => a.id.toString())}
      multiSelect={true}
      onValueChange={(value) => {
        const selectedIds = value as string[];

        onValueChange(selectedIds);
      }}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="w-[160px] [&]:!bg-transparent [&]:!border-[var(--box-accent)] [&]:!text-[var(--text-primary)] [&]:hover:!bg-white/20 [&]:hover:!text-white"
        >
          {assigneeValue.length > 0 ? (
            <>
              <StackedInitials
                assignees={assigneeValue.map((id) => ({
                  label:
                    assigneeOptions.find(
                      (opt) => opt.value === id.id.toString()
                    )?.label || "",
                  url: id.url,
                  id: id.id,
                }))}
              />
              <span className="ml-2">
                {assigneeValue.length === 1
                  ? assigneeOptions.find(
                      (opt) => opt.value === assigneeValue[0].id.toString()
                    )?.label
                  : `${assigneeValue.length} assignees`}
              </span>
            </>
          ) : (
            <>
              <span className="mr-1">
                <Users className="w-3 h-3" />
              </span>{" "}
              {placeholder}
            </>
          )}
        </Button>
      }
    />
  );
};
