"use client";

import { ProjectInfoForm } from "@/app/app/projects/[id]/components/settings/components/ProjectInfoForm";
import { ClientManagement } from "@/app/app/projects/[id]/components/settings/components/ClientManagement";
import { QASection } from "@/app/app/projects/[id]/components/settings/components/QASection";
import { ProjectSetupProgress } from "@/app/app/projects/[id]/components/settings/components/ProjectSetupProgress";
import { useProjectInfo } from "@/app/hooks/useProjectInfo";
import { useClientManagement } from "@/app/hooks/useClientManagement";
import { useQAManagement } from "@/app/hooks/useQAManagement";
import { useProjectActivation } from "@/app/hooks/useProjectActivation";
import type { SettingsSectionProps } from "@/app/types/project";

export function SettingsSection({ projectDetails }: SettingsSectionProps) {
  const {
    projectInfo,
    setProjectInfo,
    handleSubmit: handleProjectInfoSubmit,
    isPending: isProjectInfoPending,
  } = useProjectInfo(projectDetails.project.id, {
    projectName: projectDetails.project.name,
    description: projectDetails.project.description || "",
    websiteUrl: projectDetails.project.websiteUrl || "",
  });

  const {
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
    isPending: isClientPending,
  } = useClientManagement(projectDetails.project.id, projectDetails.clients);

  const {
    qaText,
    setQaText,
    qaItems,
    handleParseQA,
    isParsing,
    editingQAItem,
    setEditingQAItem,
    handleEditQAItem,
    handleDeleteQAItem,
  } = useQAManagement(projectDetails.project.id, projectDetails.qaItems);

  const { activateProject, isPending: isActivating } = useProjectActivation(
    projectDetails.project.id
  );

  return (
    <div className="space-y-6">
      {projectDetails.project.status !== "active" && (
        <ProjectSetupProgress
          projectInfo={projectInfo}
          clients={clients}
          onActivateProject={activateProject}
          isPending={isActivating}
          savedProjectInfo={{
            name: projectDetails.project.name,
            description: projectDetails.project.description,
            websiteUrl: projectDetails.project.websiteUrl,
          }}
        />
      )}

      <ProjectInfoForm
        projectInfo={projectInfo}
        setProjectInfo={setProjectInfo}
        onSubmit={handleProjectInfoSubmit}
        isPending={isProjectInfoPending}
      />

      <ClientManagement
        clients={clients}
        isAddClientOpen={isAddClientOpen}
        setIsAddClientOpen={setIsAddClientOpen}
        editingClient={editingClient}
        setEditingClient={setEditingClient}
        newClient={newClient}
        setNewClient={setNewClient}
        onAddClient={handleAddClient}
        onEditClient={handleEditClient}
        onRemoveClient={handleRemoveClient}
        isPending={isClientPending}
      />

      <QASection
        qaText={qaText}
        setQaText={setQaText}
        qaItems={qaItems}
        editingQAItem={editingQAItem}
        setEditingQAItem={setEditingQAItem}
        onParseQA={handleParseQA}
        onEditQAItem={handleEditQAItem}
        onDeleteQAItem={handleDeleteQAItem}
        isParsing={isParsing}
      />
    </div>
  );
}
