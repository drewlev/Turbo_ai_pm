import { CheckCircle, Circle, LoaderCircle, CircleAlert } from "lucide-react";
import { Combobox } from "./combbox";
import { Button } from "./ui/button";

type Option = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

const statusOptions: Option[] = [
  { value: "todo", label: "To Do", icon: <Circle /> },
  {
    value: "in_progress",
    label: "In Progress",
    icon: <LoaderCircle className="animate-spin slow-spin" />,
  }, // Added animate-spin
  {
    value: "needs_review",
    label: "Needs Review",
    icon: <CircleAlert className="text-yellow-500" />,
  },
  {
    value: "done",
    label: "Done",
    icon: <CheckCircle className="text-green-500" />,
  },
];

export const StatusButton = ({
  status,
  onValueChange,
}: {
  status: string;
  onValueChange: (value: string) => void;
}) => {
  return (
    <Combobox
      options={statusOptions}
      value={status}
      onValueChange={(value) => onValueChange(value as string)}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
        >
          {status ? (
            <>
              {statusOptions.find((opt) => opt.value === status)?.icon}
              <span>
                {statusOptions.find((opt) => opt.value === status)?.label}
              </span>
            </>
          ) : (
            <>
              <span className="mr-1"></span> Status
            </>
          )}
        </Button>
      }
    />
  );
};
