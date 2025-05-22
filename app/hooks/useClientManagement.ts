import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  addClientToProject,
  getProjectClients,
  removeClientFromProject,
  updateClient,
} from "@/app/actions/projects";
import type { Client, NewClient } from "@/app/types/project";

export function useClientManagement(
  projectId: number,
  initialClients: Client[]
) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState<NewClient>({
    name: "",
    email: "",
    linkedinUrl: "",
    role: "",
  });
  const [isPending, startTransition] = useTransition();

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const result = await addClientToProject({
          name: newClient.name,
          email: newClient.email,
          linkedinUrl: newClient.linkedinUrl || null,
          role: newClient.role || null,
          projectId: projectId,
        });

        if (result) {
          toast.success("Client added successfully");
          // Refresh client list
          const updatedClients = await getProjectClients(projectId);
          // Transform the database clients to match our UI client type
          const transformedClients: Client[] = updatedClients.map((client) => ({
            id: client.id.toString(),
            name: client.name,
            email: client.email,
            role: client.role,
            linkedinUrl: client.linkedinUrl,
            avatar: "/placeholder.svg?height=40&width=40", // Default avatar
          }));
          setClients(transformedClients);
          setIsAddClientOpen(false);
          setNewClient({ name: "", email: "", linkedinUrl: "", role: "" }); // Reset form
        } else {
          toast.error("Failed to add client");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to add client");
      }
    });
  };

  const handleEditClient = async (clientId: string, data: Partial<Client>) => {
    startTransition(async () => {
      try {
        const result = await updateClient(Number(clientId), {
          name: data.name,
          email: data.email,
          role: data.role || null,
          linkedinUrl: data.linkedinUrl || null,
        });

        if (result) {
          toast.success("Client updated successfully");
          // Refresh client list
          const updatedClients = await getProjectClients(projectId);
          const transformedClients: Client[] = updatedClients.map((client) => ({
            id: client.id.toString(),
            name: client.name,
            email: client.email,
            role: client.role,
            linkedinUrl: client.linkedinUrl,
            avatar: "/placeholder.svg?height=40&width=40",
          }));
          setClients(transformedClients);
          setEditingClient(null);
          setIsAddClientOpen(false);
          setNewClient({ name: "", email: "", linkedinUrl: "", role: "" }); // Reset form
        } else {
          toast.error("Failed to update client");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to update client");
      }
    });
  };

  const handleRemoveClient = async (clientId: string) => {
    startTransition(async () => {
      try {
        const result = await removeClientFromProject(Number(clientId));
        if (result.success) {
          setClients((prev) => prev.filter((client) => client.id !== clientId));
          toast.success("Client removed successfully");
        } else {
          toast.error("Failed to remove client");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to remove client");
      }
    });
  };

  return {
    clients,
    isAddClientOpen,
    setIsAddClientOpen,
    editingClient,
    setEditingClient,
    newClient,
    setNewClient,
    handleAddClient,
    handleEditClient,
    handleRemoveClient,
    isPending,
  };
}
