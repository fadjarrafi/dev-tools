import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { KanbanProject } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { FormEventHandler, useState } from "react";

interface Props {
  project: KanbanProject;
}

export default function KanbanProjectEdit({ project }: Props) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; description?: string }>(
    {}
  );

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    router.put(route("kanban.projects.update", project.id), formData, {
      onSuccess: () => {
        // Success handled by redirect
      },
      onError: (errors) => {
        setErrors(errors as { name?: string; description?: string });
      },
      onFinish: () => {
        setProcessing(false);
      },
    });
  };

  const breadcrumbs = [
    { title: "Kanban", href: route("kanban.projects.index") },
    { title: project.name, href: route("kanban.projects.show", project.id) },
    { title: "Edit Project", href: route("kanban.projects.edit", project.id) },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`Edit ${project.name}`} />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
            <p className="text-muted-foreground">
              Update your kanban project settings
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
              <CardTitle>Project Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Enter project name..."
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
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Enter project description..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={processing}>
                    {processing ? "Updating..." : "Update Project"}
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
