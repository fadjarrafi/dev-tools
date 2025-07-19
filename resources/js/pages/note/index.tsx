import { useState, useRef, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Search, Edit, Trash2, Save, X, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface Note {
  id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  notes: Note[];
  search?: string;
}

// Form schema
const noteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  content: z.string().min(1, "Content is required"),
});

type NoteFormValues = z.infer<typeof noteSchema>;

// Simple markdown renderer for preview
const MarkdownPreview = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`(.*?)`/g, "<code>$1</code>")
      .replace(/\n/g, "<br>");
  };

  return (
    <div
      className="prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default function NotesIndex({ notes, search = "" }: Props) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [previewMode, setPreviewMode] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState(search);
  const [localNotes, setLocalNotes] = useState<Note[]>([]);

  // Load local notes from localStorage on mount
  useEffect(() => {
    const savedLocalNotes = localStorage.getItem("sticky-notes-local");
    if (savedLocalNotes) {
      try {
        setLocalNotes(JSON.parse(savedLocalNotes));
      } catch (error) {
        console.error("Error parsing local notes:", error);
      }
    }
  }, []);

  // Save local notes to localStorage whenever localNotes changes
  useEffect(() => {
    localStorage.setItem("sticky-notes-local", JSON.stringify(localNotes));
  }, [localNotes]);

  // Form setup
  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  // Format date helper function
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

  const handleCreate = () => {
    setIsCreating(true);
    setEditingNote(null);
    form.reset();
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setIsCreating(false);
    form.reset({
      title: note.title,
      content: note.content,
    });
  };

  const onSubmit = (values: NoteFormValues) => {
    if (editingNote) {
      // Update existing note
      router.put(route("notes.update", editingNote.id), values, {
        onSuccess: () => {
          setEditingNote(null);
          form.reset();
        },
      });
    } else {
      // Create new note
      router.post(route("notes.store"), values, {
        onSuccess: () => {
          setIsCreating(false);
          form.reset();
        },
      });
    }
  };

  const handleDelete = (noteId: number) => {
    if (confirm("Are you sure you want to delete this note?")) {
      router.delete(route("notes.destroy", noteId));
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingNote(null);
    form.reset();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const url = new URL(window.location.href);
    if (searchTerm) {
      url.searchParams.set("search", searchTerm);
    } else {
      url.searchParams.delete("search");
    }
    window.location.href = url.toString();
  };

  const togglePreview = (noteId: number) => {
    setPreviewMode((prev) => ({
      ...prev,
      [noteId]: !prev[noteId],
    }));
  };

  // Local note functions
  const addLocalNote = () => {
    const newNote: Note = {
      id: Date.now(), // Use timestamp as ID for local notes
      title: "New Note",
      content: "Start typing...",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocalNotes((prev) => [newNote, ...prev]);
  };

  const updateLocalNote = (id: number, updates: Partial<Note>) => {
    setLocalNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, ...updates, updated_at: new Date().toISOString() }
          : note
      )
    );
  };

  const deleteLocalNote = (id: number) => {
    if (confirm("Are you sure you want to delete this local note?")) {
      setLocalNotes((prev) => prev.filter((note) => note.id !== id));
    }
  };

  const saveLocalNoteToDatabase = (localNote: Note) => {
    router.post(
      route("notes.store"),
      {
        title: localNote.title,
        content: localNote.content,
      },
      {
        onSuccess: () => {
          deleteLocalNote(localNote.id);
        },
      }
    );
  };

  // Filter notes based on search - fix null error
  const filteredNotes = notes.filter((note) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const title = note.title || "";
    const content = note.content || "";
    return (
      title.toLowerCase().includes(searchLower) ||
      content.toLowerCase().includes(searchLower)
    );
  });

  const filteredLocalNotes = localNotes.filter((note) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    const title = note.title || "";
    const content = note.content || "";
    return (
      title.toLowerCase().includes(searchLower) ||
      content.toLowerCase().includes(searchLower)
    );
  });

  return (
    <AppLayout>
      <Head title="Notes" />

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">
              Manage your personal sticky notes
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={addLocalNote} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Local Note
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>

        {/* Create/Edit Form */}
        {(isCreating || editingNote) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingNote ? "Edit Note" : "Create New Note"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Note title..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Content (Markdown supported)</FormLabel>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setPreviewMode((prev) => ({
                                ...prev,
                                form: !prev.form,
                              }))
                            }
                          >
                            {previewMode.form ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            {previewMode.form ? "Edit" : "Preview"}
                          </Button>
                        </div>
                        <FormControl>
                          {previewMode.form ? (
                            <div className="min-h-[200px] rounded-md border p-3 bg-muted/50">
                              <MarkdownPreview content={field.value} />
                            </div>
                          ) : (
                            <Textarea
                              placeholder="Start typing your note... (supports **bold**, *italic*, `code`)"
                              className="min-h-[200px] font-mono text-sm"
                              {...field}
                            />
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Local Notes Section */}
        {filteredLocalNotes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Local Notes
              <Badge variant="secondary">{filteredLocalNotes.length}</Badge>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLocalNotes.map((note) => (
                <Card key={`local-${note.id}`} className="border-dashed">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Input
                        value={note.title}
                        onChange={(e) =>
                          updateLocalNote(note.id, { title: e.target.value })
                        }
                        className="font-semibold border-none p-0 h-auto bg-transparent"
                      />
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePreview(note.id)}
                        >
                          {previewMode[note.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => saveLocalNoteToDatabase(note)}
                          title="Save to database"
                        >
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteLocalNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(note.updated_at)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {previewMode[note.id] ? (
                      <MarkdownPreview content={note.content} />
                    ) : (
                      <Textarea
                        value={note.content}
                        onChange={(e) =>
                          updateLocalNote(note.id, { content: e.target.value })
                        }
                        className="min-h-[120px] border-none p-0 bg-transparent resize-none font-mono text-sm"
                      />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Saved Notes */}
        {filteredNotes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              Saved Notes
              <Badge variant="default">{filteredNotes.length}</Badge>
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{note.title}</CardTitle>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePreview(note.id)}
                        >
                          {previewMode[note.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(note)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {note.created_at !== note.updated_at
                        ? "Updated"
                        : "Created"}{" "}
                      {formatDate(note.updated_at)}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {previewMode[note.id] ? (
                      <MarkdownPreview content={note.content} />
                    ) : (
                      <div className="whitespace-pre-wrap text-sm font-mono bg-muted/30 p-3 rounded-md max-h-[200px] overflow-y-auto">
                        {note.content}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredNotes.length === 0 &&
          filteredLocalNotes.length === 0 &&
          !isCreating && (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <h3 className="text-lg font-semibold">No notes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? `No notes match "${searchTerm}". Try a different search term.`
                    : "Get started by creating your first note."}
                </p>
                {!searchTerm && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={addLocalNote} variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Local Note
                    </Button>
                    <Button onClick={handleCreate}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Note
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </AppLayout>
  );
}
