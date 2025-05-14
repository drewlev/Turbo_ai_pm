import { Combobox } from "../../combbox";
import { Button } from "../../ui/button";

type Option = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

const low = <span className="mr-1 bg-green-500 rounded-full w-2 h-2"></span>;

const medium = (
  <span className="mr-1 bg-yellow-500 rounded-full w-2 h-2"></span>
);

const high = <span className="mr-1 bg-red-500 rounded-full w-2 h-2"></span>;

const priorityOptions: Option[] = [
  { value: "high", label: "High", icon: high },
  { value: "medium", label: "Medium", icon: medium },
  { value: "low", label: "Low", icon: low },
];

export const PriorityButton = ({
  priority,
  onValueChange,
}: {
  priority: string;
  onValueChange: (value: string) => void;
  
}) => {
  return (
    <Combobox
      options={priorityOptions}
      value={priority}
      onValueChange={(value) => onValueChange(value as string)}
      trigger={
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
        >
          {priority ? (
            <>
              {priorityOptions.find((opt) => opt.value === priority)?.icon}
              <span>
                {priorityOptions.find((opt) => opt.value === priority)?.label}
              </span>
            </>
          ) : (
            <>
              <span className="mr-1">···</span> Priority
            </>
          )}
        </Button>
      }
    />
  );
};
