import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

interface Task {
  id: string;
  title: string;
  date?: string;
  assignedTo?: {
    name: string;
    avatar?: string;
  };

}

interface TaskTableProps {
  tasks: Task[];
  title: string;
  count: number;
}

export function TaskTable({ tasks, title, count }: TaskTableProps) {
  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-[#858699] mb-2 flex items-center">
        {title} <span className="ml-2 text-xs text-[#858699]">{count}</span>
      </h2>
      <ul className="space-y-1">
        {tasks.map((task) => (
          <li
            key={task.id}
            className="flex items-center gap-3 py-2 px-3 hover:bg-[#212234] rounded-md group"
          >
            <Checkbox id={task.id} className="border-[#4c4f6b]" />
            <label htmlFor={task.id} className="flex-1 cursor-pointer">
              {task.title}

            </label>
            {task.date && (
              <div className="text-xs text-[#858699]">{task.date}</div>
            )}
            {task.assignedTo && (
              <Avatar className="h-6 w-6">
                <AvatarImage
                  src={task.assignedTo.avatar}
                  alt={task.assignedTo.name}
                />
                <AvatarFallback>{task.assignedTo.name[0]}</AvatarFallback>
              </Avatar>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
