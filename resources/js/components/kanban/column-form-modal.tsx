import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KanbanProject, KanbanBoard, KanbanColumn } from "@/types";
import { router } from "@inertiajs/react";
import { useState } from "react";

interface Props {
  project: KanbanProject;
  board: KanbanBoard;
  column?: KanbanColumn | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const predefinedColors = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Gray", value: "#6b7280" },
];

export function KanbanColumnFormModal({
  project,
  board,
  column,
  onSuccess,
  onCancel,
}: Props) {
  const [formData, setFormData] = useState({
    name: column?.name || "",
    color: column?.color || "#6b7280",
  });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!column;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setErrors({});

    const url = isEditing
      ? route("kanban.columns.update", [project.id, board.id, column.id])
      : route("kanban.columns.store", [project.id, board.id]);

    const method = isEditing ? "put" : "post";

    router[method](url, formData, {
      onSuccess: () => {
        setFormData({ name: "", color: "#6b7280" });
        onSuccess();
      },
      onError: (errors) => {
        setErrors(errors as Record<string, string>);
      },
      onFinish: () => {
        setProcessing(false);
      },
      preserveScroll: true,
    });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Column Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="Enter column name..."
            disabled={processing}
            autoFocus
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Color */}
        <div className="space-y-3">
          <Label>Column Color</Label>

          {/* Predefined Colors */}
          <div className="grid grid-cols-3 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, color: color.value }))
                }
                disabled={processing}
                className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                  formData.color === color.value
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                } ${processing ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <div
                  className="w-4 h-4 rounded-full border"
                  style={{ backgroundColor: color.value }}
                />
                <span className="text-sm">{color.name}</span>
              </button>
            ))}
          </div>

          {/* Custom Color Picker */}
          <div className="space-y-2">
            <Label htmlFor="color">Custom Color</Label>
            <div className="flex items-center gap-2">
              <input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                disabled={processing}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer disabled:opacity-50"
              />
              <Input
                value={formData.color}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, color: e.target.value }))
                }
                placeholder="#6b7280"
                pattern="^#[0-9A-Fa-f]{6}$"
                disabled={processing}
                className="flex-1"
              />
            </div>
          </div>

          {/* Color Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: formData.color }}
              />
              <span className="font-medium">
                {formData.name || "Column Name"}
              </span>
              <span className="bg-white px-2 py-1 rounded text-xs text-muted-foreground">
                0
              </span>
            </div>
          </div>

          {errors.color && (
            <p className="text-sm text-red-600">{errors.color}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={processing} className="flex-1">
            {processing
              ? "Saving..."
              : isEditing
                ? "Update Column"
                : "Create Column"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={processing}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
