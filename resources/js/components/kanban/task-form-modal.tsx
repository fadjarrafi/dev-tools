"use client"; // <--- This is crucial for client-side interactivity

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KanbanTask, KanbanProject, KanbanBoard, KanbanColumn } from "@/types";
import { router } from "@inertiajs/react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, X, FileImage, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface Props {
  project: KanbanProject;
  board: KanbanBoard;
  column: KanbanColumn;
  task?: KanbanTask | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  title: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  tags: string;
  due_date: Date | null;
  attachments: File[];
}

export function KanbanTaskFormModal({
  project,
  board,
  column,
  task,
  onSuccess,
  onCancel,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<FormData>({
    title: task?.title || "",
    description: task?.description || "",
    priority:
      task?.priority || ("Medium" as "Low" | "Medium" | "High" | "Critical"),
    tags: task?.tags?.join(", ") || "",
    due_date: task?.due_date ? new Date(task.due_date) : null,
    attachments: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPopoverOpen, setIsPopoverOpen] = useState(false); // State to control Popover open/close

  const isEditing = !!task;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (processing) return;

    setProcessing(true);

    const submitDueDate =
      formData.due_date instanceof Date
        ? format(formData.due_date, "yyyy-MM-dd")
        : null;

    const submitData = {
      ...formData,
      due_date: submitDueDate,
      attachments: selectedFiles,
    };

    const onSuccessCallback = () => {
      setProcessing(false);
      onSuccess();
    };

    const onErrorCallback = (errors: Record<string, string>) => {
      setErrors(errors);
      setProcessing(false);
    };

    if (isEditing) {
      router.post(
        route("kanban.tasks.update", [
          project.id,
          board.id,
          column.id,
          task.id,
        ]),
        { ...submitData, _method: "PUT" },
        {
          onSuccess: onSuccessCallback,
          onError: onErrorCallback,
          preserveScroll: true,
        }
      );
    } else {
      router.post(
        route("kanban.tasks.store", [project.id, board.id, column.id]),
        submitData,
        {
          onSuccess: onSuccessCallback,
          onError: onErrorCallback,
          preserveScroll: true,
        }
      );
    }
  };

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || processing) return;
      const newFiles = Array.from(files).filter((file) => {
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          console.error(
            `File type ${file.type} is not allowed. Please use: jpg, png, gif, webp`
          );
          return false;
        }
        if (file.size > 3 * 1024 * 1024) {
          console.error(`File ${file.name} is too large. Maximum size is 3MB.`);
          return false;
        }
        return true;
      });
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    },
    [processing]
  );

  const handleDrag = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (processing) return;

      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    },
    [processing]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      if (processing) return;

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [processing, handleFileSelect]
  );

  const removeFile = useCallback(
    (index: number) => {
      if (processing) return;
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [processing]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter task title..."
            disabled={processing}
            autoFocus
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Enter task description..."
            rows={4}
            disabled={processing}
          />
          {errors.description && (
            <p className="text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label htmlFor="priority">Priority *</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: any) =>
              setFormData((prev) => ({ ...prev, priority: value }))
            }
            disabled={processing}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && (
            <p className="text-sm text-red-600">{errors.priority}</p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-between font-normal",
                  !formData.due_date && "text-muted-foreground"
                )}
                disabled={processing}
              >
                {formData.due_date ? (
                  format(formData.due_date, "PPP")
                ) : (
                  <span>Pick a date</span>
                )}
                <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.due_date ?? undefined}
                onSelect={(date) => {
                  console.log("Date selected:", date);
                  setFormData((prev) => ({ ...prev, due_date: date ?? null }));
                  setIsPopoverOpen(false);
                }}
                initialFocus
                captionLayout="dropdown"
                className="pointer-events-auto" // <--- ADDED THIS LINE
              />
            </PopoverContent>
          </Popover>
          {errors.due_date && (
            <p className="text-sm text-red-600">{errors.due_date}</p>
          )}
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, tags: e.target.value }))
            }
            placeholder="Enter tags separated by commas..."
            disabled={processing}
          />
          <p className="text-xs text-muted-foreground">
            Separate multiple tags with commas
          </p>
          {errors.tags && <p className="text-sm text-red-600">{errors.tags}</p>}
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Attachments</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : processing
                  ? "border-gray-200 bg-gray-50"
                  : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-2">
              <Upload
                className={`h-8 w-8 mx-auto ${processing ? "text-gray-400" : "text-muted-foreground"}`}
              />
              <div className="text-sm text-muted-foreground">
                <p>Drag and drop images here, or</p>
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={processing}
                >
                  click to browse
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, GIF, WEBP up to 3MB each
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={(e) => handleFileSelect(e.target.files)}
            disabled={processing}
            className="hidden"
          />

          {errors.attachments && (
            <p className="text-sm text-red-600">{errors.attachments}</p>
          )}

          {/* Selected Files */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm">
                Selected files ({selectedFiles.length})
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      disabled={processing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={processing} className="flex-1">
            {processing
              ? "Saving..."
              : isEditing
                ? "Update Task"
                : "Create Task"}
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
