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
import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { z } from "zod";

const linkedinRegex =
  /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  linkedin: z
    .string()
    .refine(
      (val) => !val || val.match(linkedinRegex),
      "Invalid LinkedIn URL. Please use a format like https://www.linkedin.com/in/your-profile or linkedin.com/in/your-profile"
    )
    .optional(),
  email: z
    .string()
    .refine(
      (val) => !val || val.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
      "Invalid email address"
    )
    .optional(),
});

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  scope: z.string().optional(),
  clients: z.array(clientSchema).default([]),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

type Client = {
  name: string;
  linkedin?: string;
  email?: string;
};

export default function ProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [scope, setScope] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [newClient, setNewClient] = useState<Client>({
    name: "",
    linkedin: "",
    email: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!open) {
      // Reset all form states when dialog closes
      setName("");
      setScope("");
      setClients([]);
      setNewClient({ name: "", linkedin: "", email: "" });
      setEditingIndex(null);
    }
  }, [open]);

  const handleAddClient = () => {
    try {
      const validatedClient = clientSchema.parse(newClient);
      setClients([...clients, validatedClient]);
      setNewClient({ name: "", linkedin: "", email: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join("\n");
        toast.error(errorMessages);
      } else {
        toast.error("Failed to add client");
      }
    }
  };

  const handleDeleteClient = (index: number) => {
    setClients(clients.filter((_, i) => i !== index));
  };

  const handleEditClient = (index: number) => {
    setEditingIndex(index);
    setNewClient(clients[index]);
  };

  const handleSaveEdit = () => {
    try {
      if (editingIndex !== null) {
        const validatedClient = clientSchema.parse(newClient);
        const updatedClients = [...clients];
        updatedClients[editingIndex] = validatedClient;
        setClients(updatedClients);
        setEditingIndex(null);
        setNewClient({ name: "", linkedin: "", email: "" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join("\n");
        toast.error("Failed to save client changes");
      } else {
        toast.error("Failed to save client changes");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setNewClient({ name: "", linkedin: "", email: "" });
  };

  const handleCreateProject = () => {
    try {
      const formData: ProjectFormData = {
        name,
        scope,
        clients,
      };

      const validatedData = projectFormSchema.parse(formData);

      // TODO: Add your project creation API call here
      console.log("Creating project:", validatedData);

      toast.success("Project created successfully!");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map((err) => err.message).join("\n");
        toast.error(errorMessages);
      } else {
        toast.error("Failed to create project");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0 bg-[#121212] text-white border-[#2a2a2a] [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Create New Project</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <div className="flex items-center gap-2">
            <span className="text-sm">New Project</span>
          </div>
          <div className="flex items-center gap-2">
            <DialogClose asChild>
              <button className="p-1 rounded hover:bg-[#2a2a2a]">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </DialogClose>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name"
            className="border-none bg-transparent text-lg font-medium placeholder:text-gray-500 focus-visible:ring-0 p-0"
          />
          <Textarea
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            placeholder="General scope..."
            className="border-none bg-transparent resize-none min-h-[100px] placeholder:text-gray-500 focus-visible:ring-0 p-0"
          />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Key Clients</h3>
            {clients.map((client, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-[#2a2a2a] rounded group"
              >
                <div className="flex items-center gap-2">
                  <span>{client.name}</span>
                  {client.linkedin && (
                    <span className="text-sm text-gray-400">
                      • {client.linkedin}
                    </span>
                  )}
                  {client.email && (
                    <span className="text-sm text-gray-400">
                      • {client.email}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-[#3a3a3a]"
                    onClick={() => handleEditClient(index)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-[#3a3a3a] text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteClient(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <Input
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                placeholder="Client name"
                className="bg-[#2a2a2a] border-none"
              />
              <Input
                value={newClient.linkedin}
                onChange={(e) =>
                  setNewClient({ ...newClient, linkedin: e.target.value })
                }
                placeholder="LinkedIn URL (optional)"
                className="bg-[#2a2a2a] border-none"
              />
              <Input
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
                placeholder="Email (optional)"
                className="bg-[#2a2a2a] border-none"
              />
              {editingIndex !== null ? (
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveEdit}
                    variant="outline"
                    className="flex-1 bg-[#2a2a2a] border-none hover:bg-[#3a3a3a]"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="flex-1 bg-[#2a2a2a] border-none hover:bg-[#3a3a3a]"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddClient}
                  variant="outline"
                  className="w-full bg-[#2a2a2a] border-none hover:bg-[#3a3a3a]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Client
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#2a2a2a]">
          <div className="flex justify-end">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateProject}
            >
              Create Project
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
