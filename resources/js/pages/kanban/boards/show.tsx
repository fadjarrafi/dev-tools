import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Can from "@/components/can";
import AppLayout from "@/layouts/app-layout";
import { KanbanBoard, KanbanProject, KanbanTask, KanbanColumn } from "@/types";
import { Head, Link, router } from "@inertiajs/react";
import {
  Plus,
  Calendar,
  Paperclip,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  GripVertical,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";

// Import dnd-kit components and hooks
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCorners,
  DropAnimation,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove, // Helper to reorder arrays
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Import the modal components
import { KanbanTaskDetailModal } from "@/components/kanban/task-detail-modal";
import { KanbanTaskFormModal } from "@/components/kanban/task-form-modal";
import { KanbanColumnFormModal } from "@/components/kanban/column-form-modal";

interface Props {
  project: KanbanProject;
  board: KanbanBoard;
}

type ModalType = "none" | "task-detail" | "task-form" | "column-form";

interface ModalState {
  type: ModalType;
  selectedTask: KanbanTask | null;
  selectedColumn: KanbanColumn | null;
  editingTask: KanbanTask | null;
  editingColumn: KanbanColumn | null;
}

const initialModalState: ModalState = {
  type: "none",
  selectedTask: null,
  selectedColumn: null,
  editingTask: null,
  editingColumn: null,
};

// Drop animation for DragOverlay
const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

export default function KanbanBoardShow({
  project,
  board: initialBoard,
}: Props) {
  const [board, setBoard] = useState<KanbanBoard>(initialBoard);
  const [modalState, setModalState] = useState<ModalState>(initialModalState);
  const [activeDragItem, setActiveDragItem] = useState<KanbanTask | null>(null); // Stores the task being dragged
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync local board state with prop changes
  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard]);

  // Dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Drag starts after 8px movement
    useSensor(KeyboardSensor, {})
  );

  const closeModal = useCallback(() => {
    setModalState(initialModalState);
    setIsSubmitting(false);
  }, []);

  const openModal = useCallback(
    (newState: Partial<ModalState> & { type: ModalType }) => {
      if (isSubmitting) return;
      setModalState({ ...initialModalState, ...newState });
    },
    [isSubmitting]
  );

  const handleTaskClick = useCallback(
    (task: KanbanTask) => {
      openModal({ type: "task-detail", selectedTask: task });
    },
    [openModal]
  );

  const handleCreateTask = useCallback(
    (column: KanbanColumn) => {
      openModal({
        type: "task-form",
        selectedColumn: column,
        editingTask: null,
      });
    },
    [openModal]
  );

  const handleEditTask = useCallback(
    (task: KanbanTask) => {
      openModal({
        type: "task-form",
        selectedColumn: task.column!,
        editingTask: task,
      });
    },
    [openModal]
  );

  const handleDeleteTask = useCallback(
    (task: KanbanTask) => {
      if (window.confirm("Are you sure you want to delete this task?")) {
        setIsSubmitting(true);
        router.delete(
          route("kanban.tasks.destroy", [
            project.id,
            board.id,
            task.column_id,
            task.id,
          ]),
          { preserveScroll: true, onFinish: () => closeModal() }
        );
      }
    },
    [project.id, board.id, closeModal]
  );

  const handleCreateColumn = useCallback(() => {
    openModal({ type: "column-form", editingColumn: null });
  }, [openModal]);

  const handleEditColumn = useCallback(
    (column: KanbanColumn) => {
      openModal({ type: "column-form", editingColumn: column });
    },
    [openModal]
  );

  const handleDeleteColumn = useCallback(
    (column: KanbanColumn) => {
      if (
        window.confirm(
          `Are you sure you want to delete the column "${column.name}"? All tasks in this column will also be deleted.`
        )
      ) {
        setIsSubmitting(true);
        router.delete(
          route("kanban.columns.destroy", [project.id, board.id, column.id]),
          { preserveScroll: true, onFinish: () => closeModal() }
        );
      }
    },
    [project.id, board.id, closeModal]
  );

  const handleFormSuccess = useCallback(() => {
    closeModal();
  }, [closeModal]);

  // --- Dnd-kit Drag Handlers ---

  const handleDragStart = (event: any) => {
    const { active } = event;
    // Find the task being dragged
    let draggedTaskFound: KanbanTask | null = null;
    board.columns?.forEach((column) => {
      const task = column.tasks?.find((t) => t.id === active.id);
      if (task) draggedTaskFound = task;
    });
    setActiveDragItem(draggedTaskFound);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!activeDragItem || !over || active.id === over.id) {
      setActiveDragItem(null);
      return;
    }

    const activeColumn = board.columns?.find((col) =>
      col.tasks?.some((task) => task.id === active.id)
    );
    const overColumn = board.columns?.find(
      (col) =>
        col.id === over.id || col.tasks?.some((task) => task.id === over.id)
    );

    if (!activeColumn || !overColumn) {
      setActiveDragItem(null);
      return;
    }

    const activeTask = activeColumn.tasks?.find(
      (task) => task.id === active.id
    );
    const overTask = overColumn.tasks?.find((task) => task.id === over.id);

    // Scenario 1: Moving between columns OR dropping onto an empty column
    if (activeColumn.id !== overColumn.id) {
      // Optimistic UI update for cross-column move
      setBoard((prevBoard) => {
        const newBoard = { ...prevBoard };
        const newColumns = newBoard.columns ? [...newBoard.columns] : [];

        const sourceColIndex = newColumns.findIndex(
          (col) => col.id === activeColumn.id
        );
        const destColIndex = newColumns.findIndex(
          (col) => col.id === overColumn.id
        );

        if (sourceColIndex === -1 || destColIndex === -1) return prevBoard;

        const sourceTasks = [...(newColumns[sourceColIndex].tasks || [])];
        const destTasks = [...(newColumns[destColIndex].tasks || [])];

        const [movedTask] = sourceTasks.splice(
          sourceTasks.findIndex((task) => task.id === active.id),
          1
        );
        destTasks.push({ ...movedTask, column_id: overColumn.id }); // Update column_id for the moved task

        newColumns[sourceColIndex].tasks = sourceTasks;
        newColumns[destColIndex].tasks = destTasks;

        return { ...newBoard, columns: newColumns };
      });

      // Backend call for cross-column move
      router.patch(
        route("kanban.tasks.move", [project.id, board.id]),
        {
          task_id: active.id,
          column_id: overColumn.id,
          sort_order: overColumn.tasks?.length || 0, // Place at the end of the target column
        },
        {
          preserveScroll: true,
          onFinish: () => setActiveDragItem(null),
          onError: (errors) => {
            console.error("Cross-column move error:", errors);
            setBoard(initialBoard); // Revert optimistic update on error
          },
        }
      );
    }
    // Scenario 2: Reordering within the same column
    else if (activeColumn.id === overColumn.id) {
      const currentTasks = [...(activeColumn.tasks || [])];
      const oldIndex = currentTasks.findIndex((task) => task.id === active.id);
      const newIndex = currentTasks.findIndex((task) => task.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        setActiveDragItem(null);
        return;
      }

      // Optimistic UI update for in-column reorder
      setBoard((prevBoard) => {
        const newBoard = { ...prevBoard };
        const newColumns = newBoard.columns ? [...newBoard.columns] : [];
        const colIndex = newColumns.findIndex(
          (col) => col.id === activeColumn.id
        );

        if (colIndex === -1) return prevBoard;

        const reorderedTasks = arrayMove(
          newColumns[colIndex].tasks || [],
          oldIndex,
          newIndex
        );
        newColumns[colIndex].tasks = reorderedTasks;

        return { ...newBoard, columns: newColumns };
      });

      // Backend call for in-column reorder
      const tasksToUpdate = arrayMove(currentTasks, oldIndex, newIndex).map(
        (task, index) => ({
          id: task.id,
          sort_order: index,
        })
      );

      router.patch(
        route("kanban.tasks.order", [project.id, board.id, activeColumn.id]),
        { tasks: tasksToUpdate },
        {
          preserveScroll: true,
          onFinish: () => setActiveDragItem(null),
          onError: (errors) => {
            console.error("In-column reorder error:", errors);
            setBoard(initialBoard); // Revert optimistic update on error
          },
        }
      );
    }
    setActiveDragItem(null); // Clear active item after processing
  };

  const handleDragOver = (event: any) => {
    const { active, over } = event;
    // Handle dragging a task over a column (empty or not)
    if (
      active.data.current?.type === "Task" &&
      over?.data.current?.type === "Column"
    ) {
      // If a task is dragged over a column, and it's not its original column,
      // or if it's the same column but there are no tasks,
      // then we can allow dropping into the column's empty space.
      // dnd-kit's closestCorners resolver will usually handle this.
    }
  };

  // --- Utility Functions ---
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (dueDateString: string) => {
    return new Date(dueDateString) < new Date();
  };

  // --- TaskCard Component (now a SortableItem) ---
  const TaskCard = ({ task }: { task: KanbanTask }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: task.id, data: { type: "Task", task } }); // Add data for easier identification

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1, // Visual feedback for dragging
      zIndex: isDragging ? 10 : 0, // Bring dragged item to front
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        className={`bg-white border rounded-lg p-3 transition-all relative group
          ${
            isSubmitting || modalState.type !== "none"
              ? "opacity-50 cursor-not-allowed"
              : "cursor-grab hover:shadow-md"
          }`}
        onClick={() =>
          modalState.type === "none" && !isSubmitting && handleTaskClick(task)
        }
      >
        {/* Drag Handle */}
        <div
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-gray-400" />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm line-clamp-2 pr-6">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={`text-xs ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </Badge>

            {task.tags && task.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {task.tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {task.tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">
                    +{task.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {task.due_date && (
                <div
                  className={`flex items-center gap-1 ${
                    isOverdue(task.due_date) ? "text-red-600" : ""
                  }`}
                >
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(task.due_date)}</span>
                </div>
              )}
              {task.attachments && task.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- ColumnCard Component (now a Droppable container for tasks) ---
  const ColumnCard = ({ column }: { column: KanbanColumn }) => {
    const { setNodeRef, isOver } = useSortable({
      id: column.id,
      data: { type: "Column", column }, // Add data for identification
    });

    // Determine if the column itself is being dragged over (for empty column drops)
    const isColumnOver =
      isOver &&
      activeDragItem?.column_id !== column.id &&
      column.tasks?.length === 0;

    return (
      <div
        ref={setNodeRef}
        className="bg-gray-50 rounded-lg p-4 min-w-80 max-w-80"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: column.color }}
            />
            <h3 className="font-semibold">{column.name}</h3>
            <Badge variant="secondary" className="text-xs">
              {column.tasks?.length || 0}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Can permission="kanban.create">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCreateTask(column)}
                disabled={isSubmitting || modalState.type !== "none"}
                title="Add task"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </Can>
            <Can permission="kanban.edit">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" title="Column actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleEditColumn(column)}
                    disabled={isSubmitting || modalState.type !== "none"}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Rename Column
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleDeleteColumn(column)}
                    disabled={isSubmitting || modalState.type !== "none"}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Column
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
          </div>
        </div>

        {/* SortableContext for tasks within the column */}
        <SortableContext
          items={column.tasks || []}
          strategy={verticalListSortingStrategy}
        >
          <div
            className={`space-y-3 min-h-24 p-2 ${isColumnOver ? "border-2 border-dashed border-blue-500 rounded-lg" : ""}`}
          >
            {column.tasks?.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
            {/* Visual indicator for dropping on an empty column */}
            {isColumnOver && (
              <div className="p-8 text-center text-blue-500">
                Drop task here
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    );
  };

  const breadcrumbs = [
    { title: "Kanban", href: route("kanban.projects.index") },
    { title: project.name, href: route("kanban.projects.show", project.id) },
    {
      title: board.name,
      href: route("kanban.boards.show", [project.id, board.id]),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title={`${board.name} - ${project.name}`} />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
            <p className="text-muted-foreground">
              {board.description || "Kanban board for project management"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Can permission="kanban.create">
              <Button
                variant="outline"
                onClick={handleCreateColumn}
                disabled={isSubmitting || modalState.type !== "none"}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </Button>
            </Can>
            <Can permission="kanban.edit">
              <Button variant="outline" asChild>
                <Link
                  href={route("kanban.boards.edit", [project.id, board.id])}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </Can>
          </div>
        </div>

        <Separator />

        <div className="overflow-x-auto pb-4">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver} // Needed for cross-column drag over empty space
          >
            <div className="flex gap-6 min-w-max">
              {board.columns?.map((column) => (
                <ColumnCard key={column.id} column={column} />
              ))}
            </div>

            {/* Drag Overlay for visual feedback of the dragged item */}
            <DragOverlay dropAnimation={dropAnimation}>
              {activeDragItem ? <TaskCard task={activeDragItem} /> : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>

      {/* Task Detail Modal */}
      <Dialog
        open={modalState.type === "task-detail"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {modalState.selectedTask && (
            <KanbanTaskDetailModal
              task={modalState.selectedTask}
              project={project}
              board={board}
              onEdit={() => handleEditTask(modalState.selectedTask!)}
              onDelete={() => handleDeleteTask(modalState.selectedTask!)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Task Form Modal */}
      <Dialog
        open={modalState.type === "task-form"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalState.editingTask ? "Edit Task" : "Create New Task"}
            </DialogTitle>
          </DialogHeader>
          {modalState.selectedColumn && (
            <KanbanTaskFormModal
              project={project}
              board={board}
              column={modalState.selectedColumn}
              task={modalState.editingTask}
              onSuccess={handleFormSuccess}
              onCancel={closeModal}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Column Form Modal */}
      <Dialog
        open={modalState.type === "column-form"}
        onOpenChange={(open) => !open && closeModal()}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {modalState.editingColumn ? "Edit Column" : "Create New Column"}
            </DialogTitle>
          </DialogHeader>
          <KanbanColumnFormModal
            project={project}
            board={board}
            column={modalState.editingColumn}
            onSuccess={handleFormSuccess}
            onCancel={closeModal}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
