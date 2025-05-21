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
  className = "h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white",
}: AssigneeButtonProps) => {
  return (
    <Combobox
      options={assigneeOptions}
      value={assigneeValue.map((a) => a.id.toString())}
      multiSelect={true}
      onValueChange={(value) => {
        const selectedIds = value as string[];
        // const selectedAssignees = selectedIds
        //   .map((id) => {
        //     const option = assigneeOptions.find((opt) => opt.value === id);
        //     return option ? { url: id, id: parseInt(id) } : null;
        //   })
        //   .filter((a): a is Assignee => a !== null);
        onValueChange(selectedIds);
      }}
      trigger={
        <Button variant="outline" size="sm" className={className}>
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
