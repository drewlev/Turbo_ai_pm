// src/app/project-network/page.tsx
"use client";

import { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  type Node,
  type Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  addEdge,
  applyEdgeChanges, // Used for internal edge state management by React Flow
  type EdgeChange,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge, Briefcase } from "lucide-react";
import { Handle, Position } from "reactflow";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Custom Designer Node Component
export function DesignerNode({ data }: { data: any }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card className="w-48 border-2 border-[var(--border-accent)] shadow-lg overflow-hidden bg-[var(--box-accent)]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={
                data.avatar ||
                "https://placehold.co/32x32/aabbcc/ffffff?text=AV"
              }
            />
            <AvatarFallback>{data.initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-sm text-[var(--text-primary)]">
              {data.name}
            </CardTitle>
            <CardDescription className="text-xs text-[var(--text-secondary)]">
              {data.role}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Briefcase className="h-3 w-3" />
          <span>{data.projectCount} projects</span>
        </div>
        {/* <Badge className="mt-1 text-xs bg-blue-200 text-blue-800">
          {data.workload}
        </Badge> */}
      </CardContent>
      {/* Source Handle (for connecting to projects) - Now a rectangular shape, flush with card */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle
          type="source"
          position={Position.Right}
          id="a"
          style={{
            background: isHovered ? "#2563eb" : "#3b82f6", // Change color on hover
            width: "20px",
            height: "100%", // Make it the same height as the card
            borderTopRightRadius: "10px", // Rounded on top right
            borderBottomRightRadius: "10px", // Rounded on bottom right
            borderTopLeftRadius: "0px", // No rounded on top left
            borderBottomLeftRadius: "0px", // No rounded on bottom left
            transform: "translate(0%, -50%)", // Aligns handle's center with card's right edge
            border: "none", // Add a border for definition
            transition: "background 0.2s ease, border-color 0.2s ease", // Smooth transition
          }}
        />
      </div>
    </Card>
  );
}

// Custom Project Node Component
export function ProjectNode({ data }: { data: any }) {
  const [isHovered, setIsHovered] = useState(false); // Add state for hover

  return (
    <Card className="w-48 border-2 border-[var(--border-accent)] shadow-lg overflow-hidden bg-[var(--box-accent)]">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-[var(--text-primary)]">
          {data.name}
        </CardTitle>
        <CardDescription className="text-xs text-[var(--text-secondary)]">
          {data.client}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Briefcase className="h-3 w-3" /> {/* Example of adding an icon */}
          <span>Deadline: {data.deadline}</span>
        </div>
        {/* <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Progress: {data.progress}%</span>
          <div className={`w-3 h-3 rounded-full ${data.statusColor}`} />
        </div> */}
            {/* <Badge className="mt-1 text-xs bg-green-200 text-green-800">
            {data.priority} Priority
            </Badge> */}
      </CardContent>
      {/* Target Handle (for receiving connections from designers) - Now a rectangular shape, flush with card */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle
          type="target"
          position={Position.Left}
          id="b"
          style={{
            background: isHovered ? "#16a34a" : "#22c55e", // Green shades for hover
            width: "20px",
            height: "100%", // Make it the same height as the card
            borderTopLeftRadius: "10px", // Rounded on top left
            borderBottomLeftRadius: "10px", // Rounded on bottom left
            borderTopRightRadius: "0px", // No rounded on top right
            borderBottomRightRadius: "0px", // No rounded on bottom right
            transform: "translate(0%, -50%)", // Aligns handle's center with card's left edge
            border: "none", // Remove border
            transition: "background 0.2s ease, border-color 0.2s ease", // Smooth transition
          }}
        />
      </div>
    </Card>
  );
}

// --- ProjectAssignment Data Type ---
// Assuming this type is defined elsewhere in your project
// (e.g., in "@/app/types/project-assignment").
// Provided here as a mock for completeness.
type ProjectAssignment = {
  designerName: string;
  designerRole: string;
  designerAvatar: string;
  projectName: string;
  projectClient: string;
  projectDeadline: string;
  projectPriority: string;
  projectProgress: number;
  projectStatusColor: string;
};

// --- Node Types Definition ---
const nodeTypes = {
  designer: DesignerNode,
  project: ProjectNode,
};

// --- Sample Raw Data ---
const rawAssignments: ProjectAssignment[] = [
  {
    designerName: "Sarah Chen",
    designerRole: "Senior UI Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "E-commerce Redesign",
    projectClient: "TechCorp Inc.",
    projectDeadline: "Dec 15, 2024",
    projectPriority: "High",
    projectProgress: 75,
    projectStatusColor: "bg-yellow-500",
  },
  {
    designerName: "Sarah Chen",
    designerRole: "Senior UI Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Mobile App UI",
    projectClient: "StartupXYZ",
    projectDeadline: "Jan 20, 2025",
    projectPriority: "Medium",
    projectProgress: 45,
    projectStatusColor: "bg-blue-500",
  },
  {
    designerName: "Alex Rivera",
    designerRole: "UX Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Dashboard Analytics",
    projectClient: "DataFlow Ltd.",
    projectDeadline: "Jan 5, 2025",
    projectPriority: "High",
    projectProgress: 90,
    projectStatusColor: "bg-orange-500",
  },
  {
    designerName: "Alex Rivera",
    designerRole: "UX Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Landing Page Optimization",
    projectClient: "WebBoost Co.",
    projectDeadline: "Nov 30, 2024",
    projectPriority: "Medium",
    projectProgress: 60,
    projectStatusColor: "bg-purple-500",
  },
  {
    designerName: "Maya Patel",
    designerRole: "Visual Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Brand Identity",
    projectClient: "Local Business",
    projectDeadline: "Feb 10, 2025",
    projectPriority: "Low",
    projectProgress: 20,
    projectStatusColor: "bg-green-500",
  },
  {
    designerName: "Maya Patel",
    designerRole: "Visual Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Print Materials",
    projectClient: "NonProfitWorks",
    projectDeadline: "Dec 5, 2024",
    projectPriority: "Medium",
    projectProgress: 50,
    projectStatusColor: "bg-blue-300",
  },
  {
    designerName: "Jordan Kim",
    designerRole: "Product Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Website Redesign",
    projectClient: "EduStart",
    projectDeadline: "Mar 1, 2025",
    projectPriority: "High",
    projectProgress: 30,
    projectStatusColor: "bg-red-400",
  },
  {
    designerName: "Jordan Kim",
    designerRole: "Product Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Internal Tools UI",
    projectClient: "CorpWare",
    projectDeadline: "Jan 18, 2025",
    projectPriority: "Low",
    projectProgress: 40,
    projectStatusColor: "bg-teal-400",
  },
  {
    designerName: "Mike Kim",
    designerRole: "Product Designer",
    designerAvatar: "/placeholder.svg?height=32&width=32",
    projectName: "Investor Deck Design",
    projectClient: "PitchUp Ventures",
    projectDeadline: "Feb 1, 2025",
    projectPriority: "High",
    projectProgress: 80,
    projectStatusColor: "bg-pink-500",
  },
];

// --- Function to Generate Nodes and Edges from Raw Data ---
const generateGraphData = (assignments: ProjectAssignment[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  const designerMap = new Map<string, Node>();
  const projectMap = new Map<string, Node>();

  const initialYOffset = 50;
  const nodeHeight = 120;
  const minVerticalSpacing = 250;

  const uniqueDesigners = new Map<
    string,
    {
      assignments: ProjectAssignment[];
      details: Omit<
        ProjectAssignment,
        | "projectName"
        | "projectClient"
        | "projectDeadline"
        | "projectPriority"
        | "projectProgress"
        | "projectStatusColor"
      >;
    }
  >();
  const uniqueProjects = new Map<
    string,
    Omit<ProjectAssignment, "designerName" | "designerRole" | "designerAvatar">
  >();

  assignments.forEach((assignment) => {
    if (!uniqueDesigners.has(assignment.designerName)) {
      uniqueDesigners.set(assignment.designerName, {
        assignments: [],
        details: {
          designerName: assignment.designerName,
          designerRole: assignment.designerRole,
          designerAvatar: assignment.designerAvatar,
        },
      });
    }
    uniqueDesigners.get(assignment.designerName)!.assignments.push(assignment);

    if (!uniqueProjects.has(assignment.projectName)) {
      uniqueProjects.set(assignment.projectName, {
        projectName: assignment.projectName,
        projectClient: assignment.projectClient,
        projectDeadline: assignment.projectDeadline,
        projectPriority: assignment.projectPriority,
        projectProgress: assignment.projectProgress,
        projectStatusColor: assignment.projectStatusColor,
      });
    }
  });

  const numDesigners = uniqueDesigners.size;
  const numProjects = uniqueProjects.size;

  const totalDesignerHeight =
    numDesigners * nodeHeight + (numDesigners - 1) * minVerticalSpacing;
  const totalProjectHeight =
    numProjects * nodeHeight + (numProjects - 1) * minVerticalSpacing;

  const maxTotalHeight = Math.max(totalDesignerHeight, totalProjectHeight);

  let designerVerticalSpacing = minVerticalSpacing;
  if (numDesigners > 1) {
    designerVerticalSpacing =
      (maxTotalHeight - numDesigners * nodeHeight) / (numDesigners - 1);
    designerVerticalSpacing = Math.max(
      minVerticalSpacing,
      designerVerticalSpacing
    );
  }

  let projectVerticalSpacing = minVerticalSpacing;
  if (numProjects > 1) {
    projectVerticalSpacing =
      (maxTotalHeight - numProjects * nodeHeight) / (numProjects - 1);
    projectVerticalSpacing = Math.max(
      minVerticalSpacing,
      projectVerticalSpacing
    );
  }

  let currentDesignerY = initialYOffset;
  for (const [
    designerName,
    { assignments: assignmentsList, details },
  ] of uniqueDesigners.entries()) {
    const designerNode: Node = {
      id: `designer-${designerName.replace(/\s+/g, "-")}`,
      type: "designer",
      position: { x: 100, y: currentDesignerY },
      data: {
        name: details.designerName,
        role: details.designerRole,
        initials: details.designerName
          .split(" ")
          .map((n) => n[0])
          .join(""),
        avatar: details.designerAvatar,
        projectCount: assignmentsList.length,
        workload:
          assignmentsList.length >= 3
            ? "High"
            : assignmentsList.length >= 2
            ? "Medium"
            : "Low",
      },
    };
    nodes.push(designerNode);
    designerMap.set(designerName, designerNode);
    currentDesignerY += nodeHeight + designerVerticalSpacing;
  }

  let currentProjectY = initialYOffset;
  for (const [projectName, details] of uniqueProjects.entries()) {
    const projectNode: Node = {
      id: `project-${projectName.replace(/\s+/g, "-")}`,
      type: "project",
      position: { x: 500, y: currentProjectY },
      data: {
        name: details.projectName,
        client: details.projectClient,
        deadline: details.projectDeadline,
        teamSize: 0,
        progress: details.projectProgress,
        priority: details.projectPriority,
        statusColor: details.projectStatusColor,
      },
    };
    nodes.push(projectNode);
    projectMap.set(projectName, projectNode);
    currentProjectY += nodeHeight + projectVerticalSpacing;
  }

  const projectTeamSizes: { [projectId: string]: Set<string> } = {};

  assignments.forEach((assignment) => {
    const designerId = `designer-${assignment.designerName.replace(
      /\s+/g,
      "-"
    )}`;
    const projectId = `project-${assignment.projectName.replace(/\s+/g, "-")}`;

    const edgeId = `e-${designerId}-${projectId}`;
    if (!edges.some((edge) => edge.id === edgeId)) {
      edges.push({
        id: edgeId,
        source: designerId,
        target: projectId,
        animated: true,
        style: { stroke: "#6b7280" },
      });
    }

    if (!projectTeamSizes[projectId]) {
      projectTeamSizes[projectId] = new Set();
    }
    projectTeamSizes[projectId].add(assignment.designerName);
  });

  nodes.forEach((node) => {
    if (node.type === "project") {
      node.data = {
        ...node.data,
        teamSize: projectTeamSizes[node.id]
          ? projectTeamSizes[node.id].size
          : 0,
      };
    }
  });

  return { nodes, edges };
};

// --- Main Project Network Dashboard Component ---
export default function ProjectNetworkDashboard() {
  const { nodes: initialGeneratedNodes, edges: initialGeneratedEdges } =
    useMemo(() => generateGraphData(rawAssignments), [rawAssignments]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialGeneratedNodes);
  const [edges, setEdges, onEdgesState] = useEdgesState(initialGeneratedEdges);

  // Callback for drawing new connections
  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Callback for when an edge is clicked (for highlighting)
  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          selected: e.id === edge.id, // Set clicked edge as selected, others as not selected
          style: {
            ...e.style,
            stroke: e.id === edge.id ? "#2563eb" : "#6b7280", // Highlight selected edge blue, others grey
            strokeWidth: e.id === edge.id ? 2 : 1, // Make selected edge thicker
          },
        }))
      );
    },
    [setEdges]
  );

  // Callback for handling edge deletion (e.g., by pressing Delete/Backspace key)
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      // Filter out the deleted edges from the current state
      setEdges((eds) =>
        eds.filter((edge) => !edgesToDelete.some((e) => e.id === edge.id))
      );
    },
    [setEdges]
  );

  const stats = useMemo(() => {
    const designers = nodes.filter((node) => node.type === "designer");
    const projects = nodes.filter((node) => node.type === "project");
    const totalConnections = edges.length;

    return {
      totalDesigners: designers.length,
      totalProjects: projects.length,
      totalConnections,
      avgProjectsPerDesigner:
        designers.length > 0
          ? (totalConnections / designers.length).toFixed(1)
          : "0",
    };
  }, [nodes, edges]);

  return (
    <div className="w-full h-screen flex flex-col bg-[var(--background)]">
      {/* Header with stats */}
      <div className=" border-b border-[var(--border)] p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Project Network Dashboard</h1>
            <p className="text-muted-foreground">
              Designer-Project Assignment Overview
            </p>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalDesigners}
              </div>
              <div className="text-sm text-muted-foreground">Designers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.totalProjects}
              </div>
              <div className="text-sm text-muted-foreground">Projects</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.avgProjectsPerDesigner}
              </div>
              <div className="text-sm text-muted-foreground">
                Avg Projects/Designer
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Network visualization */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesState} // Handles internal React Flow edge changes, including selection
          onConnect={onConnect} // For drawing new edges
          onEdgeClick={onEdgeClick} // Custom logic for edge highlighting
          onEdgesDelete={onEdgesDelete} // For deleting edges via keyboard (Delete/Backspace)
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2} // Allows zooming out to 20% of original size
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background />
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "designer") return "#dbeafe";
              if (node.type === "project") return "#dcfce7";
              return "#f3f4f6";
            }}
            className="bg-white border"
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      {/* <div className="bg-white border-t p-4">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-200 rounded" />
            <span className="text-sm">Designers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded" />
            <span className="text-sm">Projects</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-gray-400" />
            <span className="text-sm">Assignment</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-300" />
            <span className="text-sm">User Drawn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-blue-600 border-2 border-blue-600" />
            <span className="text-sm">Selected Assignment</span>
          </div>
        </div>
      </div> */}
    </div>
  );
}
