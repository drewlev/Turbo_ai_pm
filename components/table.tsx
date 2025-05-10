"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ColumnDef,
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

const columns: ColumnDef<Task>[] = [
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
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
        <div className="text-xs text-[var(--text-secondary)]">{date}</div>
      ) : null;
    },
  },
  {
    accessorKey: "assignedTo",
    header: "Assigned",
    cell: ({ row }) => {
      const assignedTo = row.getValue("assignedTo") as Task["assignedTo"];
      return assignedTo ? (
        <Avatar className="h-6 w-6">
          <AvatarImage src={assignedTo.avatar} alt={assignedTo.name} />
          <AvatarFallback>{assignedTo.name[0]}</AvatarFallback>
        </Avatar>
      ) : null;
    },
  },
];

export function TaskTable({ tasks, title, count }: TaskTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

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
                  onClick={() => row.toggleSelected(!row.getIsSelected())}
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
    </div>
  );
}
