import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Can from "@/components/can";
import AppLayout from "@/layouts/app-layout";
import { KanbanProject } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import {
  Archive,
  FolderKanban,
  Plus,
  Settings,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

interface Props {
  activeProjects: KanbanProject[];
  archivedProjects: KanbanProject[];
}

export default function KanbanProjectsIndex({
  activeProjects,
  archivedProjects,
}: Props) {
  const [deletingProject, setDeletingProject] = useState<number | null>(null);

  const handleArchiveProject = (projectId: number) => {
    router.patch(
      route("kanban.projects.archive", projectId),
      {},
      {
        onSuccess: () => {
          // Success message handled by backend
        },
      }
    );
  };

  const handleRestoreProject = (projectId: number) => {
    router.patch(
      route("kanban.projects.restore", projectId),
      {},
      {
        onSuccess: () => {
          // Success message handled by backend
        },
      }
    );
  };

  const handleDeleteProject = (projectId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      setDeletingProject(projectId);
      router.delete(route("kanban.projects.destroy", projectId), {
        onFinish: () => setDeletingProject(null),
      });
    }
  };

  const ProjectCard = ({
    project,
    isArchived = false,
  }: {
    project: KanbanProject;
    isArchived?: boolean;
  }) => (
    <Card className="group hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2">
                {project.description}
              </CardDescription>
            )}
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Can permission="kanban.edit">
              <Button variant="ghost" size="sm" asChild>
                <Link href={route("kanban.projects.edit", project.id)}>
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
            </Can>
            <Can permission="kanban.edit">
              {isArchived ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRestoreProject(project.id)}
                  title="Restore project"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleArchiveProject(project.id)}
                  title="Archive project"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </Can>
            <Can permission="kanban.delete">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteProject(project.id)}
                disabled={deletingProject === project.id}
                title="Delete project"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Can>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {project.boards && project.boards.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Recent Boards ({project.boards.length})
              </p>
              <div className="space-y-1">
                {project.boards.slice(0, 3).map((board) => (
                  <div key={board.id} className="flex items-center gap-2">
                    <FolderKanban className="h-3 w-3 text-muted-foreground" />
                    <Link
                      href={route("kanban.boards.show", [project.id, board.id])}
                      className="text-sm hover:underline truncate"
                    >
                      {board.name}
                    </Link>
                  </div>
                ))}
                {project.boards.length > 3 && (
                  <p className="text-xs text-muted-foreground pl-5">
                    +{project.boards.length - 3} more boards
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No boards yet</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Button asChild className="flex-1">
            <Link href={route("kanban.projects.show", project.id)}>
              View Project
            </Link>
          </Button>
          <Can permission="kanban.create">
            <Button variant="outline" asChild>
              <Link href={route("kanban.boards.create", project.id)}>
                <Plus className="h-4 w-4 mr-1" />
                Board
              </Link>
            </Button>
          </Can>
        </div>
      </CardFooter>
    </Card>
  );

  const breadcrumbs = [
    { title: "Kanban", href: route("kanban.projects.index") },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Kanban Projects" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Kanban Projects
            </h1>
            <p className="text-muted-foreground">
              Manage your kanban projects and boards
            </p>
          </div>
          <Can permission="kanban.create">
            <Button asChild>
              <Link href={route("kanban.projects.create")}>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Link>
            </Button>
          </Can>
        </div>

        <Separator />

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active" className="flex items-center gap-2">
              Active Projects
              {activeProjects.length > 0 && (
                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {activeProjects.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              Archived
              {archivedProjects.length > 0 && (
                <span className="bg-muted-foreground/10 text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                  {archivedProjects.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            {activeProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No active projects</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first kanban project.
                </p>
                <Can permission="kanban.create">
                  <Button asChild>
                    <Link href={route("kanban.projects.create")}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Link>
                  </Button>
                </Can>
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="space-y-6">
            {archivedProjects.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {archivedProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} isArchived />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Archive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold">No archived projects</h3>
                <p className="text-muted-foreground">
                  Archived projects will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
