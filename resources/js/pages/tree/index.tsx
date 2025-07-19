import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem } from "@/types";
import { Head, router } from "@inertiajs/react";
import { Copy, Save, Trash2, Edit, FolderTree } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface Tree {
  id: number;
  title: string;
  content: string;
  generated_tree: string;
  created_at: string;
  updated_at: string;
}

interface TreeGeneratorProps {
  savedTrees: Tree[];
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: "Dashboard", href: "/dashboard" },
  { title: "Tree Generator", href: "/tree" },
];

export default function TreeGenerator({ savedTrees }: TreeGeneratorProps) {
  const [content, setContent] = useState("");
  const [generatedTree, setGeneratedTree] = useState("");
  const [saveTitle, setSaveTitle] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingTree, setEditingTree] = useState<Tree | null>(null);
  const [trees, setTrees] = useState<Tree[]>(savedTrees);

  // Load from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem("tree-generator-content");
    if (savedContent) {
      setContent(savedContent);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem("tree-generator-content", content);
  }, [content]);

  // Generate tree from content
  const generateTree = useCallback((input: string) => {
    if (!input.trim()) {
      setGeneratedTree("");
      return;
    }

    const lines = input.split("\n").filter((line) => line.trim());
    if (lines.length === 0) {
      setGeneratedTree("");
      return;
    }

    let result = "";
    const stack: Array<{ level: number; isLast: boolean }> = [];

    lines.forEach((line, index) => {
      const level = line.search(/\S/); // Count leading whitespace
      const name = line.trim();

      if (!name) return;

      // Determine if this is the last item at this level
      const isLast =
        index === lines.length - 1 ||
        lines.slice(index + 1).every((nextLine) => {
          const nextLevel = nextLine.search(/\S/);
          return nextLevel <= level;
        });

      // Clean up stack for current level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      // Build prefix
      let prefix = "";
      stack.forEach((item) => {
        prefix += item.isLast ? "    " : "│   ";
      });

      // Add current item
      const connector = isLast ? "└── " : "├── ";
      result += prefix + connector + name + "\n";

      // Add to stack
      stack.push({ level, isLast });
    });

    setGeneratedTree(result);
  }, []);

  // Generate tree when content changes
  useEffect(() => {
    generateTree(content);
  }, [content, generateTree]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedTree);
      toast("Tree structure copied to clipboard");
    } catch (err) {
      toast("Failed to copy to clipboard");
    }
  };

  const handleSave = async () => {
    if (!saveTitle.trim()) {
      toast("Please enter a title");
      return;
    }

    try {
      router.post(
        route("tree.store"),
        {
          title: saveTitle,
          content: content,
          generated_tree: generatedTree,
        },
        {
          preserveScroll: true,
          onSuccess: (page) => {
            // Update the trees list with the new data from the server
            setTrees(page.props.savedTrees || []);
            setSaveTitle("");
            setShowSaveDialog(false);
            toast("Tree saved successfully");
          },
          onError: (errors) => {
            const errorMessage = Object.values(errors).flat().join(", ");
            toast(errorMessage || "Failed to save tree");
          },
        }
      );
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to save tree");
    }
  };

  const handleUpdate = async (tree: Tree) => {
    if (!saveTitle.trim()) {
      toast("Please enter a title");
      return;
    }

    try {
      router.put(
        route("tree.update", tree.id),
        {
          title: saveTitle,
          content: content,
          generated_tree: generatedTree,
        },
        {
          preserveScroll: true,
          onSuccess: (page) => {
            // Update the trees list with the new data from the server
            setTrees(page.props.savedTrees || []);
            setSaveTitle("");
            setEditingTree(null);
            setShowSaveDialog(false);
            toast("Tree updated successfully");
          },
          onError: (errors) => {
            const errorMessage = Object.values(errors).flat().join(", ");
            toast(errorMessage || "Failed to update tree");
          },
        }
      );
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to update tree");
    }
  };

  const handleDelete = async (tree: Tree) => {
    if (!confirm("Are you sure you want to delete this tree?")) return;

    try {
      router.delete(route("tree.destroy", tree.id), {
        preserveScroll: true,
        onSuccess: (page) => {
          // Update the trees list with the new data from the server
          setTrees(page.props.savedTrees || []);
          toast("Tree deleted successfully");
        },
        onError: (errors) => {
          const errorMessage = Object.values(errors).flat().join(", ");
          toast(errorMessage || "Failed to delete tree");
        },
      });
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to delete tree");
    }
  };

  const loadTree = (tree: Tree) => {
    setContent(tree.content);
    setGeneratedTree(tree.generated_tree);
  };

  const openSaveDialog = () => {
    setSaveTitle("");
    setEditingTree(null);
    setShowSaveDialog(true);
  };

  const openEditDialog = (tree: Tree) => {
    setSaveTitle(tree.title);
    setEditingTree(tree);
    setShowSaveDialog(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Tree Generator" />

      <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4 overflow-x-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            <h1 className="text-xl font-semibold">Tree Generator</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={openSaveDialog}
              disabled={!content.trim() || !generatedTree}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save Tree
            </Button>
          </div>
        </div>

        {/* ROW 1: Saved Trees - Full Width at Top */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Trees</CardTitle>
            <CardDescription>
              Your previously saved tree structures
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-[300px] overflow-y-auto">
              {trees.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No saved trees yet
                </p>
              ) : (
                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {trees.map((tree) => (
                    <div
                      key={tree.id}
                      className="flex flex-col rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0 mb-3">
                        <button
                          onClick={() => loadTree(tree)}
                          className="text-left w-full"
                        >
                          <p className="font-medium text-sm truncate mb-1">
                            {tree.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tree.updated_at).toLocaleDateString()}
                          </p>
                        </button>
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(tree)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(tree)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ROW 2: Input and Output - 2 Columns at Bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Input Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Input Structure</CardTitle>
              <CardDescription>
                Type your folder structure. Use tabs or spaces to indent child
                folders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="my-project
    src
        components
        utils
    public
        images
        css
    README.md"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
              />
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Generated Tree</CardTitle>
                  <CardDescription>ASCII tree structure output</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={!generatedTree}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="min-h-[400px] rounded-md border bg-muted p-4 text-sm font-mono overflow-x-auto">
                  {generatedTree || "Generated tree will appear here..."}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTree ? "Update Tree" : "Save Tree"}
              </DialogTitle>
              <DialogDescription>
                {editingTree
                  ? "Update the title for this tree structure."
                  : "Give your tree structure a name to save it."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Enter tree title..."
                  className="mt-1"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={
                  editingTree ? () => handleUpdate(editingTree) : handleSave
                }
                disabled={!saveTitle.trim()}
              >
                {editingTree ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
