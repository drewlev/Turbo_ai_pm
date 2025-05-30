import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Edit2 } from "lucide-react";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { TransformedClient, NewClient } from "@/app/types/project";
import { LINKEDIN_ICON_URL } from "@/app/constants/project";

type ClientManagementProps = {
  clients: TransformedClient[];
  isAddClientOpen: boolean;
  setIsAddClientOpen: (open: boolean) => void;
  editingClient: TransformedClient | null;
  setEditingClient: (client: TransformedClient | null) => void;
  newClient: NewClient;
  setNewClient: (client: NewClient) => void;
  onAddClient: (e: React.FormEvent) => void;
  onEditClient: (clientId: string, data: Partial<TransformedClient>) => void;
  onRemoveClient: (clientId: string) => void;
  isPending: boolean;
};

export function ClientManagement({
  clients,
  isAddClientOpen,
  setIsAddClientOpen,
  editingClient,
  setEditingClient,
  newClient,
  setNewClient,
  onAddClient,
  onEditClient,
  onRemoveClient,
  isPending,
}: ClientManagementProps) {
  const handleClose = () => {
    setIsAddClientOpen(false);
    setEditingClient(null);
    setNewClient({ name: "", email: "", linkedinUrl: "", role: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClient) {
      onEditClient(editingClient.id, newClient);
    } else {
      onAddClient(e);
    }
  };

  return (
    <Card className="bg-[var(--background-light)] border-[var(--border-dark)] p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-[var(--text-primary)]">
            Key Clients
          </h2>
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => setIsAddClientOpen(true)}
                className="bg-[var(--turbo-blue)] hover:bg-[var(--turbo-blue)]/90 text-[var(--text-primary)]"
              >
                <Plus className="h-4 w-4 mr-2 text-[var(--text-primary)]" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[var(--background-light)] border-[var(--border-dark)]">
              <DialogHeader>
                <DialogTitle className="text-[var(--text-primary)]">
                  {editingClient ? "Edit Client" : "Add New Client"}
                </DialogTitle>
                <DialogDescription className="text-[var(--text-secondary)]">
                  {editingClient
                    ? "Edit the client's information below."
                    : "Add a new client to this project. Name and email are required."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[var(--text-primary)]">
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) =>
                      setNewClient({ ...newClient, name: e.target.value })
                    }
                    className="bg-[var(--input-dark)] border-[var(--border-dark)] focus-visible:ring-blue-500 text-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[var(--text-primary)]">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) =>
                      setNewClient({ ...newClient, email: e.target.value })
                    }
                    className="bg-[var(--input-dark)] border-[var(--border-dark)] focus-visible:ring-blue-500 text-white/50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[var(--text-primary)]">
                    Role (Optional)
                  </Label>
                  <Input
                    id="role"
                    value={newClient.role}
                    onChange={(e) =>
                      setNewClient({ ...newClient, role: e.target.value })
                    }
                    className="bg-[var(--input-dark)] border-[var(--border-dark)] focus-visible:ring-blue-500 text-white/50"
                    placeholder="e.g., Product Manager"
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="linkedinUrl"
                    className="text-[var(--text-primary)]"
                  >
                    LinkedIn URL (Optional)
                  </Label>
                  <Input
                    id="linkedinUrl"
                    type="url"
                    value={newClient.linkedinUrl}
                    onChange={(e) =>
                      setNewClient({
                        ...newClient,
                        linkedinUrl: e.target.value,
                      })
                    }
                    className="bg-[var(--input-dark)] border-[var(--border-dark)] focus-visible:ring-blue-500 text-white/50"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="border-[var(--border-dark)]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[var(--turbo-blue)] hover:bg-[var(--turbo-blue)]/90 text-[var(--text-primary)]"
                    disabled={isPending}
                  >
                    {isPending
                      ? editingClient
                        ? "Saving..."
                        : "Adding..."
                      : editingClient
                      ? "Save Changes"
                      : "Add Client"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {clients.map((client) => (
            <div
              key={client.id}
              className="bg-[var(--box-accent)] border border-[var(--border-dark)] rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.avatar} alt={client.name} />
                    <AvatarFallback>
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-[var(--text-primary)]">
                      {client.name}
                    </div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {client.email}
                    </div>
                    <div className="flex gap-2">
                      {client.role && (
                        <div className="text-sm text-[var(--text-secondary)]">
                          {client.role}
                        </div>
                      )}

                      {client.linkedinUrl && (
                        <button
                          className="p-0 m-0 cursor-pointer"
                          onClick={() =>
                            window.open(client.linkedinUrl!, "_blank")
                          }
                        >
                          <Image
                            src={LINKEDIN_ICON_URL}
                            alt="LinkedIn"
                            className="h-4 w-4"
                            width={16}
                            height={16}
                          />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]"
                    onClick={() => {
                      setEditingClient(client);
                      setNewClient({
                        name: client.name,
                        email: client.email,
                        role: client.role || "",
                        linkedinUrl: client.linkedinUrl || "",
                      });
                      setIsAddClientOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--background)]"
                    onClick={() => onRemoveClient(client.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
