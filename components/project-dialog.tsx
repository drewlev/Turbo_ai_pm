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
import { X, Plus, Pencil, Trash2, Copy, Check } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { z } from "zod";
import { createProject, revalidateProjectPaths } from "@/app/actions/projects";
import { clientSchema, projectFormSchema } from "@/app/schemas/project";
import type { ClientData, ProjectFormData } from "@/app/schemas/project";

const linkedinRegex =
  /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/;

export default function ProjectModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clients, setClients] = useState<ClientData[]>([]);
  const [newClient, setNewClient] = useState<ClientData>({
    name: "",
    linkedin: "",
    email: "",
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [onboardingLink, setOnboardingLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      // Reset all form states when dialog closes
      setName("");
      setDescription("");
      setClients([]);
      setNewClient({ name: "", linkedin: "", email: "" });
      setEditingIndex(null);
      setOnboardingLink(null);
      setCopied(false);
    }
  }, [open]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
      toast.error("Failed to copy link");
    }
  };

  const handleAddClient = () => {
    try {
      const validatedClient = clientSchema.parse(newClient);
      setClients([...clients, validatedClient]);
      setNewClient({ name: "", linkedin: "", email: "" });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors
          .map((err: { message: string }) => err.message)
          .join("\n");
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

  const handleCreateProject = async () => {
    try {
      const formData: ProjectFormData = {
        name,
        description,
        clients,
      };

      const validatedData = projectFormSchema.parse(formData);

      const { project, onboarding, onboardingLink } = await createProject(
        validatedData
      );
      if (project && onboarding && onboardingLink) {
        setOnboardingLink(onboardingLink);
        toast.success("Project created successfully!");
      } else {
        toast.error("Failed to create project");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors
          .map((err: { message: string }) => err.message)
          .join("\n");
        toast.error(errorMessages);
      } else {
        toast.error("Failed to create project");
      }
    }
  };

  if (onboardingLink) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 gap-0 bg-[#121212] text-white border-[#2a2a2a] [&>button]:hidden">
          <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
            <div className="flex items-center gap-2">
              <span className="text-sm">Project Created Successfully</span>
            </div>
            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <button className="p-1 rounded hover:bg-[#2a2a2a]">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </DialogClose>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Share Onboarding Link</h3>
              <p className="text-gray-400">
                Share this link with your clients to start their onboarding
                process
              </p>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <code className="text-sm text-gray-300 break-all">
                  {onboardingLink}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-[#3a3a3a]"
                  onClick={() => copyToClipboard(onboardingLink)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <DialogClose asChild>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={async () => {
                    await revalidateProjectPaths();
                  }}
                >
                  Done
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 bg-[#121212] text-white border-[#2a2a2a] [&>button]:hidden">
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
