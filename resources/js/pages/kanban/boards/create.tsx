import { AppSidebarHeader } from "@/components/app-sidebar-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { KanbanProject } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { FormEventHandler } from "react";

interface Props {
  project: KanbanProject;
}

interface FormData {
  name: string;
  description: string;
}

export default function KanbanBoardCreate({ project }: Props) {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: "",
    description: "",
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("kanban.boards.store", project.id));
  };

  const breadcrumbs = [
    { title: "Kanban", href: route("kanban.projects.index") },
    { title: project.name, href: route("kanban.projects.show", project.id) },
    { title: "Create Board", href: route("kanban.boards.create", project.id) },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Create Board - ${project.name}`} />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Board
            </h1>
            <p className="text-muted-foreground">
              Create a new kanban board for {project.name}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={route("kanban.projects.show", project.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Project
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Board Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Board Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
                    placeholder="Enter board name..."
                    disabled={processing}
                    autoFocus
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Enter board description..."
                    rows={4}
                    disabled={processing}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Default Columns
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Your new board will be created with these default columns:
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm font-medium">To Do</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Done</span>
                    </div>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    You can customize these columns after creating the board.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={processing}>
                    {processing ? "Creating..." : "Create Board"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={route("kanban.projects.show", project.id)}>
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
