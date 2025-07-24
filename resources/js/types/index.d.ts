import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
    permission?: string;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    is_protected: boolean;
    roles: Role[];
    permissions: Permission[];
    [key: string]: unknown; // This allows for additional properties...
}

export interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

export interface Permission {
    id: number;
    name: string;
}

// Kanban Types
export interface KanbanProject {
  id: number;
  name: string;
  description?: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  boards?: KanbanBoard[];
}

export interface KanbanBoard {
  id: number;
  project_id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  project?: KanbanProject;
  columns?: KanbanColumn[];
}

export interface KanbanColumn {
  id: number;
  board_id: number;
  name: string;
  sort_order: number;
  color: string;
  created_at: string;
  updated_at: string;
  board?: KanbanBoard;
  tasks?: KanbanTask[];
}

export interface KanbanTask {
  id: number;
  column_id: number;
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  tags?: string[];
  due_date?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
  column?: KanbanColumn;
  attachments?: KanbanTaskAttachment[];
  priority_color?: string;
  is_overdue?: boolean;
  is_due_soon?: boolean;
}

export interface KanbanTaskAttachment {
  id: number;
  task_id: number;
  filename: string;
  path: string;
  mime_type: string;
  size: number;
  created_at: string;
  updated_at: string;
  task?: KanbanTask;
  url?: string;
  formatted_size?: string;
  is_image?: boolean;
}

// Form interfaces
export interface CreateProjectForm {
  name: string;
  description?: string;
}

export interface CreateBoardForm {
  name: string;
  description?: string;
}

export interface CreateColumnForm {
  name: string;
  color: string;
}

export interface CreateTaskForm {
  title: string;
  description?: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  tags?: string;
  due_date?: string;
  attachments?: File[];
}

// Drag and drop interfaces
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  };
}

export interface ColumnOrderUpdate {
  id: number;
  sort_order: number;
}

export interface TaskOrderUpdate {
  id: number;
  sort_order: number;
}

export interface TaskMoveData {
  task_id: number;
  column_id: number;
  sort_order: number;
}