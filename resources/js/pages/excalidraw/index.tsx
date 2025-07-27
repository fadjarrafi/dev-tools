import React, { useState } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Search, Trash2, Eye } from "lucide-react";
import { ExcalidrawSketch } from "@/types";

interface Props {
  sketches: {
    data: ExcalidrawSketch[];
    links: { url: string; label: string; active: boolean }[];
  };
  search?: string;
}

export default function ExcalidrawIndex({ sketches, search = "" }: Props) {
  const [searchTerm, setSearchTerm] = useState(search);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.get(
      route("excalidraw.index"),
      { search: searchTerm },
      { preserveState: true, replace: true }
    );
  };

  const handleDelete = (sketchId: number) => {
    if (confirm("Are you sure you want to delete this sketch?")) {
      router.delete(route("excalidraw.destroy", sketchId));
    }
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: route("dashboard") },
        { title: "Excalidraw", href: route("excalidraw.index") },
      ]}
    >
      <Head title="Excalidraw Sketches" />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Excalidraw Sketches
            </h1>
            <p className="text-muted-foreground">
              Manage your Excalidraw drawings
            </p>
          </div>
          <Button asChild>
            <Link href={route("excalidraw.create")}>
              <Plus className="mr-2 h-4 w-4" />
              New Sketch
            </Link>
          </Button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search sketches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {/* Sketches List */}
        {sketches.data.length > 0 ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sketches.data.map((sketch) => (
                <Card key={sketch.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{sketch.name}</CardTitle>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link
                            href={route("excalidraw.show", sketch.id)}
                            title="View/Edit"
                          >
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(sketch.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription className="text-xs">
                      Updated {formatDate(sketch.updated_at)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {sketch.data
                        ? JSON.parse(sketch.data).elements.length > 0
                          ? `Contains ${
                              JSON.parse(sketch.data).elements.length
                            } elements.`
                          : "Empty sketch."
                        : "No data."}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            {/* Pagination */}
            {sketches.links.length > 3 && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center space-x-2">
                  {sketches.links.map((link, index) => (
                    <Link
                      key={index}
                      href={link.url || "#"}
                      className={`px-3 py-1 rounded-md text-sm ${
                        link.active
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      } ${!link.url && "opacity-50 cursor-not-allowed"}`}
                      dangerouslySetInnerHTML={{
                        __html: link.label,
                      }}
                      preserveScroll
                    />
                  ))}
                </nav>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto max-w-md">
              <h3 className="text-lg font-semibold">
                No Excalidraw sketches found
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? `No sketches match "${searchTerm}". Try a different search term.`
                  : "Get started by creating your first sketch."}
              </p>
              {!searchTerm && (
                <Button asChild>
                  <Link href={route("excalidraw.create")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Sketch
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
