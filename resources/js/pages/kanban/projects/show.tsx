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
import Can from "@/components/can";
import AppLayout from "@/layouts/app-layout";
import { KanbanProject } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft, FolderKanban, Plus, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

interface Props {
  project: KanbanProject;
}

export default function KanbanProjectShow({ project }: Props) {
  const [deletingBoard, setDeletingBoard] = useState<number | null>(null);

  const handleDeleteBoard = (boardId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this board? This action cannot be undone."
      )
    ) {
      setDeletingBoard(boardId);
      router.delete(route("kanban.boards.destroy", [project.id, boardId]), {
        onFinish: () => setDeletingBoard(null),
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const breadcrumbs = [
    { title: "Kanban", href: route("kanban.projects.index") },
    { title: project.name, href: route("kanban.projects.show", project.id) },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={project.name} />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-muted-foreground">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Can permission="kanban.create">
              <Button asChild>
                <Link href={route("kanban.boards.create", project.id)}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Board
                </Link>
              </Button>
            </Can>
            <Can permission="kanban.edit">
              <Button variant="outline" asChild>
                <Link href={route("kanban.projects.edit", project.id)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </Can>
          </div>
          <Button variant="outline" asChild>
            <Link href={route("kanban.projects.index")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <Separator />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Boards</h2>
            {project.boards && project.boards.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {project.boards.length} board
                {project.boards.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {project.boards && project.boards.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {project.boards.map((board) => (
                <Card
                  key={board.id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{board.name}</CardTitle>
                        {board.description && (
                          <CardDescription className="line-clamp-2">
                            {board.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Can permission="kanban.edit">
                          <Button variant="ghost" size="sm" asChild>
                            <Link
                              href={route("kanban.boards.edit", [
                                project.id,
                                board.id,
                              ])}
                            >
                              <Settings className="h-4 w-4" />
                            </Link>
                          </Button>
                        </Can>
                        <Can permission="kanban.delete">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteBoard(board.id)}
                            disabled={deletingBoard === board.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Can>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>Created: {formatDate(board.created_at)}</span>
                        <span>Updated: {formatDate(board.updated_at)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link
                        href={route("kanban.boards.show", [
                          project.id,
                          board.id,
                        ])}
                      >
                        Open Board
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">No boards yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first kanban board to get started.
              </p>
              <Can permission="kanban.create">
                <Button asChild>
                  <Link href={route("kanban.boards.create", project.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Board
                  </Link>
                </Button>
              </Can>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
