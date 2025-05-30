import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save } from "lucide-react";
import type { ProjectInfo } from "@/app/types/project";

type ProjectInfoFormProps = {
  projectInfo: ProjectInfo;
  setProjectInfo: (info: ProjectInfo) => void;
  onSubmit: (formData: FormData) => void;
  isPending: boolean;
};

export function ProjectInfoForm({
  projectInfo,
  setProjectInfo,
  onSubmit,
  isPending,
}: ProjectInfoFormProps) {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setProjectInfo({ ...projectInfo, [name]: value });
  };

  return (
    <Card className="bg-[var(--background-light)] border-[var(--border-dark)] p-6">
      <form action={onSubmit} className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4 text-[var(--text-primary)]">
            Basic Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="projectName"
                className="text-[var(--text-primary)]"
              >
                Project Name
              </Label>
              <Input
                id="projectName"
                name="projectName"
                value={projectInfo.projectName}
                onChange={handleChange}
                className="bg-[var(--input-dark)] border-[var(--border-dark)] focus-visible:ring-blue-500 text-white/50"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="websiteUrl"
                className="text-[var(--text-primary)]"
              >
                Website URL
              </Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                value={projectInfo.websiteUrl || ""}
                onChange={handleChange}
                className="bg-[var(--input-dark)] border-[var(--border-dark)] focus-visible:ring-blue-500 text-white/50"

              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4 text-[var(--text-primary)]">
            Project Description
          </h2>
          <Textarea
            id="description"
            name="description"
            value={projectInfo.description}
            onChange={handleChange}
            rows={4}
            className="bg-[var(--input-dark)] border-[var(--border-dark)] focus-visible:ring-blue-500 text-white/50"
            />
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-[var(--turbo-blue)] hover:bg-[var(--turbo-blue)]/90 text-[var(--text-primary)]"
            disabled={isPending}
          >
            <Save className="h-4 w-4 mr-2 text-[var(--text-primary)]" />
            Save Changes
          </Button>
        </div>
      </form>
    </Card>
  );
}
