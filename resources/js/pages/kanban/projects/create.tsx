import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import { FormEventHandler } from "react";

interface FormData {
  name: string;
  description: string;
}

export default function KanbanProjectCreate() {
  const { data, setData, post, processing, errors } = useForm<FormData>({
    name: "",
    description: "",
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route("kanban.projects.store"));
  };

  const breadcrumbs = [
    { title: "Kanban", href: route("kanban.projects.index") },
    { title: "Create Project", href: route("kanban.projects.create") },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Create Kanban Project" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create New Project
            </h1>
            <p className="text-muted-foreground">
              Set up a new kanban project to organize your work
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={route("kanban.projects.index")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>

        <div className="max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData("name", e.target.value)}
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
                    value={data.description}
                    onChange={(e) => setData("description", e.target.value)}
                    placeholder="Enter project description..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={processing}>
                    {processing ? "Creating..." : "Create Project"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={route("kanban.projects.index")}>Cancel</Link>
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
