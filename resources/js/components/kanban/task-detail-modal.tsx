import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Can from "@/components/can";
import { KanbanTask, KanbanProject, KanbanBoard } from "@/types";
import { Paperclip, Edit, Trash2, Download, AlertTriangle } from "lucide-react";
import { router } from "@inertiajs/react";
import { useState, useCallback } from "react";

interface Props {
  task: KanbanTask;
  project: KanbanProject;
  board: KanbanBoard;
  onEdit: () => void;
  onDelete: () => void;
}

export function KanbanTaskDetailModal({
  task,
  project,
  board,
  onEdit,
  onDelete,
}: Props) {
  const [deletingAttachment, setDeletingAttachment] = useState<number | null>(
    null
  );
  const [downloadingAttachment, setDownloadingAttachment] = useState<
    number | null
  >(null);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-gray-100 text-gray-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-orange-100 text-orange-800";
      case "Critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
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

  const isOverdue = (dueDateString: string) => {
    try {
      return new Date(dueDateString) < new Date();
    } catch (error) {
      return false;
    }
  };

  const handleRemoveAttachment = useCallback(
    (attachmentId: number) => {
      if (deletingAttachment !== null) return;
      if (window.confirm("Are you sure you want to remove this attachment?")) {
        setDeletingAttachment(attachmentId);
        router.delete(
          route("kanban.tasks.attachments.destroy", [
            project.id,
            board.id,
            task.column_id,
            task.id,
          ]),
          {
            data: { attachment_id: attachmentId },
            preserveScroll: true,
            onFinish: () => setDeletingAttachment(null),
            onError: (errors) => {
              console.error("Failed to delete attachment:", errors);
              setDeletingAttachment(null);
            },
          }
        );
      }
    },
    [deletingAttachment, project.id, board.id, task.column_id, task.id]
  );

  const handleDownloadAttachment = useCallback(
    async (attachment: any) => {
      if (downloadingAttachment !== null) return;

      setDownloadingAttachment(attachment.id);

      try {
        const link = document.createElement("a");
        link.href = attachment.url;
        link.download = attachment.filename;
        link.target = "_blank";
        link.rel = "noopener noreferrer";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error("Download failed:", error);
        alert("Failed to download file. Please try again.");
      } finally {
        setDownloadingAttachment(null);
      }
    },
    [downloadingAttachment]
  );

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.target as HTMLImageElement;
      img.style.display = "none";

      const parent = img.parentElement;
      if (parent) {
        const errorDiv = document.createElement("div");
        errorDiv.className =
          "flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg";
        errorDiv.innerHTML = `
        <svg class="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span class="text-sm text-red-600">Failed to load image</span>
      `;
        parent.insertBefore(errorDiv, img);
      }
    },
    []
  );

  return (
    <div className="max-w-5xl space-y-12">
      {/* Header with actions */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold leading-tight mb-2">
            {task.title}
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority}
            </Badge>
            {task.column && <Badge variant="outline">{task.column.name}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Can permission="kanban.edit">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </Can>
          <Can permission="kanban.delete">
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </Can>
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Description</h3>
        {task.description ? (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border">
            {task.description}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic bg-gray-50 rounded-lg p-4 border">
            No description provided
          </div>
        )}
      </div>

      {/* Due Date */}
      {task.due_date && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Due Date</h3>
          <div
            className={`text-sm ${isOverdue(task.due_date) ? "text-red-600 font-medium" : "text-muted-foreground"}`}
          >
            {formatDate(task.due_date)}
            {isOverdue(task.due_date) && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Overdue
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tags</h3>
          <div className="flex gap-2 flex-wrap">
            {task.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {task.attachments && task.attachments.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">
            Attachments ({task.attachments.length})
          </h3>
          <div className="space-y-3">
            {task.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="bg-gray-50 rounded-lg p-3 border"
              >
                {attachment.is_image ? (
                  <div className="space-y-3">
                    <div className="relative">
                      {/* REMOVE or MODIFY the style={{ maxHeight: "300px" }} */}
                      <img
                        src={attachment.url}
                        alt={attachment.filename}
                        className="max-w-full h-auto rounded-lg"
                        onError={handleImageError}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.formatted_size}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadAttachment(attachment)}
                          disabled={downloadingAttachment === attachment.id}
                        >
                          {downloadingAttachment === attachment.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        <Can permission="kanban.edit">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleRemoveAttachment(attachment.id)
                            }
                            disabled={deletingAttachment === attachment.id}
                          >
                            {deletingAttachment === attachment.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </Can>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded">
                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {attachment.filename}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.formatted_size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadAttachment(attachment)}
                        disabled={downloadingAttachment === attachment.id}
                      >
                        {downloadingAttachment === attachment.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </Button>
                      <Can permission="kanban.edit">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          disabled={deletingAttachment === attachment.id}
                        >
                          {deletingAttachment === attachment.id ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </Can>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Separator />

      {/* Meta Information */}
      <div className="space-y-3 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{formatDateTime(task.created_at)}</span>
        </div>
        <div className="flex justify-between">
          <span>Last updated:</span>
          <span>{formatDateTime(task.updated_at)}</span>
        </div>
        {task.column && (
          <div className="flex justify-between">
            <span>Column:</span>
            <span>{task.column.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
