"use client";

import TaskModal from "@/components/tasks/task-dialog";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { TaskTableTask } from "@/app/types/task";
import { StatusButton } from "@/components/tasks/status-button";
import { DaysOutDisplayer } from "@/lib/date-and-time";
import { ColumnDef } from "@tanstack/react-table";
import { StackedInitials } from "../stacked-avatars";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const columns: ColumnDef<TaskTableTask>[] = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="border-[var(--border-dark)]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="border-[var(--border-dark)]"
  //       onClick={(e) => e.stopPropagation()}
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TaskTableTask["status"];
      return (
        <StatusButton
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          status={status}
          taskId={parseInt(row.original.id)}
          onStatusUpdated={() => {}}
        />
      );
    },
  },
  {
    accessorKey: "title",
    header: "Task",
    cell: ({ row }) => <div>{row.getValue("title")}</div>,
  },
  {
    accessorKey: "dueDate",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue("dueDate") as string;
      return (
        <div className="text-xs text-[var(--text-secondary)]">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <DaysOutDisplayer dateString={date} />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {date ? new Date(date).toLocaleDateString() : "No due date"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      );
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned",
    cell: ({ row }) => {
      const assignedTo = row.getValue(
        "assignedTo"
      ) as TaskTableTask["assignedTo"];
      return assignedTo ? <StackedInitials assignees={assignedTo} /> : null;
    },
  },
];

interface TaskTableClientProps {
  tasks: TaskTableTask[];
  title: string;
  count: number;
  availableAssignees: any[];
}

export function TaskTableClient({
  tasks,
  title,
  count,
  availableAssignees,
}: TaskTableClientProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedTask, setSelectedTask] = useState<TaskTableTask | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  console.log({ selectedTask });
  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const handleRowClick = (task: TaskTableTask) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  return (
    <div className="mb-6">
      <h2 className="text-sm font-medium text-[var(--text-secondary)] mb-2 flex items-center">
        {title}{" "}
        <span className="ml-2 text-xs text-[var(--text-secondary)]">
          {count}
        </span>
      </h2>
      <div className="rounded-md border border-[var(--box-accent)] overflow-hidden">
        <Table>
          <TableHeader className="bg-transparent rounded-t-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-[var(--box-accent)]"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-white first:rounded-tl-md last:rounded-tr-md"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="group cursor-pointer border-b border-gray-500"
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleRowClick(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`group-hover:bg-gray-700/90 ${
                        row.getIsSelected()
                          ? "bg-gray-700/90"
                          : "bg-[var(--background-dark)]"
                      }`}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {selectedTask && (
        <TaskModal
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedTask={selectedTask}
          availableAssignees={availableAssignees}
        />
      )}
    </div>
  );
}
