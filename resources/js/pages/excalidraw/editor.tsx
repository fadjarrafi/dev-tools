import React, { useEffect, useRef, useState, useCallback } from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, X, RotateCcw } from "lucide-react";
import { ExcalidrawSketch } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

interface EditorProps {
  sketch?: ExcalidrawSketch;
}

const sketchSchema = z.object({
  name: z
    .string()
    .min(1, "Sketch name is required")
    .max(255, "Sketch name must be less than 255 characters"),
});

type SketchFormValues = z.infer<typeof sketchSchema>;

export default function ExcalidrawEditor({ sketch }: EditorProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const excalidrawWrapperRef = useRef<HTMLDivElement>(null);
  const [isExcalidrawMounted, setIsExcalidrawMounted] = useState(false);

  const [initialExcalidrawData, setInitialExcalidrawData] = useState<any>(null);

  const form = useForm<SketchFormValues>({
    resolver: zodResolver(sketchSchema),
    defaultValues: {
      name: sketch?.name || "Untitled Sketch",
    },
  });

  const checkAndMountExcalidraw = useCallback(() => {
    if (excalidrawWrapperRef.current) {
      const { width, height } =
        excalidrawWrapperRef.current.getBoundingClientRect();
      console.log("Wrapper dimensions on check:", { width, height });
      if (width > 0 && height > 0) {
        setIsExcalidrawMounted(true);
        return;
      }
    }
    setTimeout(checkAndMountExcalidraw, 100);
  }, []);

  useEffect(() => {
    checkAndMountExcalidraw();
  }, [checkAndMountExcalidraw]);

  useEffect(() => {
    if (sketch?.data) {
      try {
        const loadedData = JSON.parse(sketch.data);
        console.log("Parsed data from DB for initial load:", loadedData);

        const appStateWithCollaboratorsFix = {
          ...(loadedData.appState || {}),
          collaborators: [],
        };

        setInitialExcalidrawData({
          elements: loadedData.elements || [],
          appState: appStateWithCollaboratorsFix,
          files: loadedData.files || {},
          scrollToContent: true,
        });
      } catch (error) {
        console.error(
          "Failed to parse Excalidraw data for initial load:",
          error
        );
        setInitialExcalidrawData(null);
      }
    } else {
      setInitialExcalidrawData({
        elements: [],
        appState: { collaborators: [] },
        files: {},
        scrollToContent: true,
      });
    }
  }, [sketch?.data]);

  const handleSave = () => {
    if (!excalidrawAPI) {
      console.error("Excalidraw API not initialized.");
      return;
    }

    const elements = excalidrawAPI.getSceneElements();
    const appState = excalidrawAPI.getAppState();
    const files = excalidrawAPI.getFiles();

    // --- Ini tetap perlu dibungkus dengan type dan version saat disimpan ke DB ---
    // Karena DB menyimpan *file format* Excalidraw, bukan hanya scene data mentah.
    const excalidrawContent = {
      type: "excalidraw",
      version: 2,
      elements: elements,
      appState: appState,
      files: files,
    };
    const dataToSave = JSON.stringify(excalidrawContent);

    const values = form.getValues();

    if (sketch) {
      router.put(
        route("excalidraw.update", sketch.id),
        {
          name: values.name,
          data: dataToSave,
        },
        {
          onSuccess: () => {
            console.log("Sketch updated successfully!");
          },
          onError: (errors) => {
            console.error("Error updating sketch:", errors);
          },
        }
      );
    } else {
      router.post(
        route("excalidraw.store"),
        {
          name: values.name,
          data: dataToSave,
        },
        {
          onSuccess: () => {
            console.log("Sketch saved successfully!");
            router.visit(route("excalidraw.index"));
          },
          onError: (errors) => {
            console.error("Error saving sketch:", errors);
          },
        }
      );
    }
  };

  const handleReset = () => {
    if (excalidrawAPI) {
      excalidrawAPI.resetScene();
    }
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: "Dashboard", href: route("dashboard") },
        { title: "Excalidraw", href: route("excalidraw.index") },
        {
          title: sketch ? "Edit Sketch" : "Create Sketch",
          href: sketch
            ? route("excalidraw.show", sketch.id)
            : route("excalidraw.create"),
        },
      ]}
    >
      <Head title={sketch ? "Edit Excalidraw" : "Create Excalidraw"} />

      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Excalidraw Editor
            </h1>
            <p className="text-muted-foreground">
              {sketch
                ? "Edit your Excalidraw sketch"
                : "Create a new Excalidraw sketch"}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                className="flex items-center gap-2"
              >
                <Input
                  className="text-xl font-semibold border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Sketch Name"
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <span className="text-destructive text-sm">
                    {form.formState.errors.name.message}
                  </span>
                )}
              </form>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={handleSave}
                disabled={!excalidrawAPI || form.formState.isSubmitting}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Sketch
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={!excalidrawAPI}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Editor
              </Button>
              <Button
                onClick={() => router.get(route("excalidraw.index"))}
                variant="secondary"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>

            <div
              className="excalidraw-wrapper w-full border rounded-md"
              ref={excalidrawWrapperRef}
              style={{
                height: "800px",
                width: "100%",
                position: "relative",
              }}
            >
              {!isExcalidrawMounted || initialExcalidrawData === null ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Loading Excalidraw editor...
                  </p>
                </div>
              ) : (
                <Excalidraw
                  excalidrawAPI={setExcalidrawAPI}
                  initialData={initialExcalidrawData}
                  viewModeEnabled={false}
                  zenModeEnabled={false}
                  gridModeEnabled={false}
                  langCode="en-US"
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
