import { useState, useCallback } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import AppLayout from "@/layouts/app-layout";
import Can from "@/components/can";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  Code,
  Download,
  Save,
  Trash2,
  Copy,
  MoreHorizontal,
  FileText,
  Database,
  Zap,
  AlertTriangle,
} from "lucide-react";

interface MigrationGenerator {
  id: number;
  name: string;
  sql_schema: string;
  generated_migration: string;
  migration_file_path?: string;
  status: "generated" | "saved" | "error";
  status_color: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  creator?: {
    id: number;
    name: string;
  };
}

interface Props {
  migrations: {
    data: MigrationGenerator[];
    links: any[];
    meta?: {
      total?: number;
      current_page?: number;
      last_page?: number;
      per_page?: number;
      from?: number;
      to?: number;
    };
  };
}

export default function MigrationGeneratorIndex({ migrations }: Props) {
  const [selectedMigration, setSelectedMigration] =
    useState<MigrationGenerator | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveFileName, setSaveFileName] = useState("");
  const [processing, setProcessing] = useState(false);

  const {
    data,
    setData,
    post,
    processing: formProcessing,
    errors,
    reset,
  } = useForm({
    name: "",
    sql_schema: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route("tools.migration-generator.generate"), {
      onSuccess: () => {
        // Reset form on successful generation
        reset();
      },
    });
  };

  const handlePreview = useCallback((migration: MigrationGenerator) => {
    setSelectedMigration(migration);
    setShowPreview(true);
  }, []);

  const handleSave = useCallback((migration: MigrationGenerator) => {
    setSelectedMigration(migration);
    setSaveFileName(migration.name);
    setShowSaveDialog(true);
  }, []);

  const handleSaveConfirm = useCallback(() => {
    if (!selectedMigration || !saveFileName.trim()) return;

    setProcessing(true);
    router.post(
      route("tools.migration-generator.save", selectedMigration.id),
      { file_name: saveFileName },
      {
        onSuccess: () => {
          setShowSaveDialog(false);
          setSaveFileName("");
          setSelectedMigration(null);
        },
        onFinish: () => setProcessing(false),
      }
    );
  }, [selectedMigration, saveFileName]);

  const handleDownload = useCallback((migration: MigrationGenerator) => {
    window.open(
      route("tools.migration-generator.download", migration.id),
      "_blank"
    );
  }, []);

  const handleDuplicate = useCallback((migration: MigrationGenerator) => {
    setProcessing(true);
    router.post(
      route("tools.migration-generator.duplicate", migration.id),
      {},
      { onFinish: () => setProcessing(false) }
    );
  }, []);

  const handleDelete = useCallback((migration: MigrationGenerator) => {
    if (
      window.confirm(
        `Are you sure you want to delete the migration "${migration.name}"?`
      )
    ) {
      setProcessing(true);
      router.delete(route("tools.migration-generator.destroy", migration.id), {
        onFinish: () => setProcessing(false),
      });
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sqlExample = `CREATE TABLE users (
    id int not null auto_increment primary key,
    name varchar(255) not null,
    email varchar(255) not null unique,
    email_verified_at timestamp null,
    password varchar(255) not null,
    remember_token varchar(100) null,
    created_at timestamp null,
    updated_at timestamp null
);`;

  const breadcrumbs = [
    { title: "Tools", href: "#" },
    {
      title: "Migration Generator",
      href: route("tools.migration-generator.index"),
    },
  ];

  return (
    <ErrorBoundary>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="MySQL to Laravel Migration Generator" />

        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Migration Generator
              </h1>
              <p className="text-muted-foreground">
                Convert MySQL CREATE TABLE statements to Laravel migrations
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Database className="h-3 w-3" />
                MySQL to Laravel
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Generator Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Generate Migration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Migration Name *</Label>
                    <Input
                      id="name"
                      value={data.name}
                      onChange={(e) => setData("name", e.target.value)}
                      placeholder="e.g., users, posts, categories"
                      disabled={formProcessing}
                      autoFocus
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">{errors.name}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      This will be used for the migration class name
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sql_schema">
                      MySQL CREATE TABLE Statement *
                    </Label>
                    <Textarea
                      id="sql_schema"
                      value={data.sql_schema}
                      onChange={(e) => setData("sql_schema", e.target.value)}
                      placeholder={sqlExample}
                      rows={12}
                      disabled={formProcessing}
                      className="font-mono text-sm"
                    />
                    {errors.sql_schema && (
                      <p className="text-sm text-red-600">
                        {errors.sql_schema}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={data.notes}
                      onChange={(e) => setData("notes", e.target.value)}
                      placeholder="Add any notes about this migration..."
                      rows={3}
                      disabled={formProcessing}
                    />
                    {errors.notes && (
                      <p className="text-sm text-red-600">{errors.notes}</p>
                    )}
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-800 mb-1">
                          Security Notice
                        </p>
                        <p className="text-amber-700">
                          Only paste CREATE TABLE statements. Dangerous SQL
                          commands like DROP, DELETE, or TRUNCATE are
                          automatically blocked.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Can permission="migration.create">
                    <Button
                      type="submit"
                      disabled={formProcessing}
                      className="w-full"
                    >
                      {formProcessing ? "Generating..." : "Generate Migration"}
                    </Button>
                  </Can>
                </form>
              </CardContent>
            </Card>

            {/* Features & Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Supported Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Supported MySQL Types</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="space-y-1">
                      <Badge variant="outline">INT/INTEGER</Badge>
                      <Badge variant="outline">BIGINT</Badge>
                      <Badge variant="outline">VARCHAR</Badge>
                      <Badge variant="outline">TEXT</Badge>
                      <Badge variant="outline">DECIMAL</Badge>
                    </div>
                    <div className="space-y-1">
                      <Badge variant="outline">DATETIME</Badge>
                      <Badge variant="outline">TIMESTAMP</Badge>
                      <Badge variant="outline">BOOLEAN</Badge>
                      <Badge variant="outline">JSON</Badge>
                      <Badge variant="outline">ENUM</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Supported Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Primary keys and auto-increment</li>
                    <li>• Indexes and unique constraints</li>
                    <li>• Foreign key relationships</li>
                    <li>• Default values and nullable columns</li>
                    <li>• Column comments</li>
                    <li>• ON DELETE/UPDATE cascades</li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-2">Tips</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Use descriptive migration names</li>
                    <li>• Review generated code before saving</li>
                    <li>• Test migrations in development first</li>
                    <li>• Keep SQL statements clean and formatted</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generated Migrations List */}
          {migrations.data.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Migrations (
                  {migrations.meta?.total || migrations.data.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {migrations.data.map((migration) => (
                    <div
                      key={migration.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium truncate">
                            {migration.name}
                          </h3>
                          <Badge className={migration.status_color}>
                            {migration.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Created: {formatDate(migration.created_at)}</p>
                          {migration.creator && (
                            <p>By: {migration.creator.name}</p>
                          )}
                          {migration.notes && (
                            <p className="italic">"{migration.notes}"</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePreview(migration)}
                          disabled={processing}
                        >
                          <Code className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={processing}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDownload(migration)}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <Can permission="migration.create">
                              <DropdownMenuItem
                                onClick={() => handleSave(migration)}
                              >
                                <Save className="h-4 w-4 mr-2" />
                                Save to File
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDuplicate(migration)}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                            </Can>
                            <Can permission="migration.delete">
                              <DropdownMenuItem
                                onClick={() => handleDelete(migration)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </Can>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {migrations.links && migrations.links.length > 3 && (
                  <div className="flex items-center justify-center space-x-2 mt-6">
                    {migrations.links.map((link, index) => (
                      <Button
                        key={index}
                        variant={link.active ? "default" : "outline"}
                        size="sm"
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url || processing}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="sm:max-w-7xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Migration Preview: {selectedMigration?.name}
              </DialogTitle>
            </DialogHeader>
            {selectedMigration && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Original SQL:</Label>
                  <pre className="mt-2 p-4 bg-gray-100 rounded-lg text-sm overflow-x-auto">
                    {selectedMigration.sql_schema}
                  </pre>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Generated Laravel Migration:
                  </Label>
                  <pre className="mt-2 p-4 bg-gray-900 text-green-400 rounded-lg text-sm overflow-x-auto">
                    {selectedMigration.generated_migration}
                  </pre>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Save Dialog */}
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Migration File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fileName">File Name</Label>
                <Input
                  id="fileName"
                  value={saveFileName || ""}
                  onChange={(e) => setSaveFileName(e.target.value)}
                  placeholder="migration_file_name"
                  disabled={processing}
                  autoFocus
                />
                <p className="text-xs text-muted-foreground">
                  The file will be saved as: YYYY_MM_DD_HHMMSS_
                  {saveFileName || "filename"}.php
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={handleSaveConfirm}
                  disabled={processing || !saveFileName.trim()}
                  className="flex-1"
                >
                  {processing ? "Saving..." : "Save File"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </AppLayout>
    </ErrorBoundary>
  );
}
