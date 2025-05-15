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
import { Checkbox } from "@/components/ui/checkbox";
import { StackedInitials } from "@/components/stacked-avatars";
import { StatusButton } from "@/components/tasks/status-button";
import { daysOutDisplayer } from "@/lib/date-and-time";
import { ColumnDef } from "@tanstack/react-table";
const columns: ColumnDef<TaskTableTask>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="border-[var(--border-dark)]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="border-[var(--border-dark)]"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as TaskTableTask["status"];
      return (
        <StatusButton
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
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const date = row.getValue("date") as string;
      return date ? (
        <div className="text-xs text-[var(--text-secondary)]">
          {daysOutDisplayer({ dateString: date })}
        </div>
      ) : null;
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
  projects: {
    id: number;
    title: string;
    url: string;
  }[];
  availableAssignees: any[];
}

export function TaskTableClient({
  tasks,
  title,
  count,
  projects,
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
      <div className="rounded-md border border-gray-500 overflow-hidden">
        <Table>
          <TableHeader className="bg-[var(--sidebar)] rounded-t-md">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-b border-gray-500"
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
          projects={projects}
          availableAssignees={availableAssignees}
        />
      )}
    </div>
  );
}
