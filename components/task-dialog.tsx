"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  X,
  MoreHorizontal,
  Paperclip,
  MessageSquare,
  Users,
} from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Combobox, Option } from "@/components/combbox";

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

const projectOptions: Option[] = [
  { value: "project1", label: "Project 1", icon: high },
  { value: "project2", label: "Project 2", icon: medium },
  { value: "project3", label: "Project 3", icon: low },
];

const assigneeOptions: Option[] = [
  { value: "user1", label: "John Doe", icon: high },
  { value: "user2", label: "Jane Smith", icon: medium },
  { value: "user3", label: "Bob Johnson", icon: low },
];

export default function TaskModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [createMore, setCreateMore] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("");
  const [project, setProject] = useState("");
  const [assignee, setAssignee] = useState("");

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setCreateMore(false);
      setPriority("");
      setProject("");
      setAssignee("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-[#121212] text-white border-[#2a2a2a] [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Create New Task</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-sm">New Task</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded hover:bg-[#2a2a2a]">
              {/* <Maximize2 className="w-4 h-4 text-gray-400" /> */}
            </button>
            <DialogClose asChild>
              <button className="p-1 rounded hover:bg-[#2a2a2a]">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            className="border-none bg-transparent text-lg font-medium placeholder:text-gray-500 focus-visible:ring-0 p-0"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add description..."
            className="border-none bg-transparent resize-none min-h-[100px] placeholder:text-gray-500 focus-visible:ring-0 p-0"
          />
        </div>

        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex flex-wrap gap-2 mb-4">
            <Combobox
              options={priorityOptions}
              value={priority}
              onValueChange={setPriority}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                >
                  {priority ? (
                    <>
                      {
                        priorityOptions.find((opt) => opt.value === priority)
                          ?.icon
                      }
                      <span>
                        {
                          priorityOptions.find((opt) => opt.value === priority)
                            ?.label
                        }
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
            <Combobox
              options={assigneeOptions}
              value={assignee}
              onValueChange={setAssignee}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                >
                  {assignee ? (
                    <>
                      {
                        assigneeOptions.find((opt) => opt.value === assignee)
                          ?.icon
                      }
                      <span>
                        {
                          assigneeOptions.find((opt) => opt.value === assignee)
                            ?.label
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">
                        <Users className="w-3 h-3" />
                      </span>{" "}
                      Assignee
                    </>
                  )}
                </Button>
              }
            />
            <Combobox
              options={projectOptions}
              value={project}
              onValueChange={setProject}
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
                >
                  {project ? (
                    <>
                      {
                        projectOptions.find((opt) => opt.value === project)
                          ?.icon
                      }
                      <span>
                        {
                          projectOptions.find((opt) => opt.value === project)
                            ?.label
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">◯</span> Project
                    </>
                  )}
                </Button>
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
            >
              <MessageSquare className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-transparent border-[#2a2a2a] text-gray-300 hover:bg-[#2a2a2a] hover:text-white"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 p-2 text-gray-400 hover:bg-[#2a2a2a] hover:text-white"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              {/* <div className="flex items-center gap-2">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                  className="data-[state=checked]:bg-blue-600"
                />
                <label htmlFor="create-more" className="text-sm text-gray-400">
                  Create more
                </label>
              </div> */}
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Task
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
