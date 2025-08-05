import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Can from "@/components/can";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import {
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useState } from "react";

interface JobApplication {
  id: number;
  company_name: string;
  position_title: string;
  location: string | null;
  salary_range: string | null;
  job_type: string;
  status: string;
  application_date: string;
  deadline: string | null;
  job_description: string | null;
  notes: string | null;
  status_color: string;
  created_at: string;
  updated_at: string;
}

interface PaginatedData {
  data: JobApplication[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
}

interface Props {
  applications: PaginatedData;
  filters: {
    status?: string;
    company?: string;
    position?: string;
    job_type?: string;
    date_from?: string;
    date_to?: string;
  };
  sorting: {
    sort_by: string;
    sort_order: string;
  };
  statuses: string[];
  jobTypes: string[];
}

export default function JobsIndex({
  applications,
  filters,
  sorting,
  statuses,
  jobTypes,
}: Props) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleSort = (column: string) => {
    const newOrder =
      sorting.sort_by === column && sorting.sort_order === "asc"
        ? "desc"
        : "asc";

    router.get(
      route("jobs.index"),
      {
        ...filters,
        sort_by: column,
        sort_order: newOrder,
      },
      { preserveState: true }
    );
  };

  const handleFilter = () => {
    router.get(route("jobs.index"), localFilters, { preserveState: true });
  };

  const clearFilters = () => {
    setLocalFilters({});
    router.get(route("jobs.index"), {}, { preserveState: true });
  };

  const handleDelete = (application: JobApplication) => {
    if (
      window.confirm(
        `Are you sure you want to delete the application for ${application.position_title} at ${application.company_name}?`
      )
    ) {
      router.delete(route("jobs.destroy", application.id));
    }
  };

  const getSortIcon = (column: string) => {
    if (sorting.sort_by !== column) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sorting.sort_order === "asc" ? (
      <ArrowUp className="h-4 w-4" />
    ) : (
      <ArrowDown className="h-4 w-4" />
    );
  };

  const breadcrumbs = [
    { title: "Job Applications", href: route("jobs.index") },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Job Applications" />

      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Job Applications
            </h1>
            <p className="text-muted-foreground">
              Track and manage your job applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href={route("jobs.statistics")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistics
              </Link>
            </Button>
            <Can permission="jobs.create">
              <Button asChild>
                <Link href={route("jobs.create")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Application
                </Link>
              </Button>
            </Can>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            {Object.keys(filters).some(
              (key) => filters[key as keyof typeof filters]
            ) && (
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => {
                      const params = new URLSearchParams(
                        filters as Record<string, string>
                      ).toString();
                      const url =
                        route("jobs.export.csv") + (params ? `?${params}` : "");
                      window.open(url, "_blank");
                    }}
                  >
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const params = new URLSearchParams(
                        filters as Record<string, string>
                      ).toString();
                      const url =
                        route("jobs.export.excel") +
                        (params ? `?${params}` : "");
                      window.open(url, "_blank");
                    }}
                  >
                    Export as Excel
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Search company..."
                  value={localFilters.company || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  placeholder="Search position..."
                  value={localFilters.position || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      position: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={localFilters.status || "all"}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      status: value === "all" ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {statuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={localFilters.job_type || "all"}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      job_type: value === "all" ? undefined : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    {jobTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_from">Date From</Label>
                <Input
                  id="date_from"
                  type="date"
                  value={localFilters.date_from || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      date_from: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_to">Date To</Label>
                <Input
                  id="date_to"
                  type="date"
                  value={localFilters.date_to || ""}
                  onChange={(e) =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      date_to: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="flex items-end col-span-full">
                <Button onClick={handleFilter}>
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Applications Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("company_name")}
                >
                  <div className="flex items-center gap-2">
                    Company
                    {getSortIcon("company_name")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("position_title")}
                >
                  <div className="flex items-center gap-2">
                    Position
                    {getSortIcon("position_title")}
                  </div>
                </TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Salary</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort("application_date")}
                >
                  <div className="flex items-center gap-2">
                    Applied
                    {getSortIcon("application_date")}
                  </div>
                </TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">
                        No job applications found
                      </p>
                      <Can permission="jobs.create">
                        <Button asChild>
                          <Link href={route("jobs.create")}>
                            Add your first application
                          </Link>
                        </Button>
                      </Can>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                applications.data.map((application) => (
                  <TableRow key={application.id}>
                    <TableCell className="font-medium">
                      {application.company_name}
                    </TableCell>
                    <TableCell>{application.position_title}</TableCell>
                    <TableCell>{application.location || "-"}</TableCell>
                    <TableCell>{application.salary_range || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{application.job_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={application.status_color}>
                        {application.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDate(application.application_date)}
                    </TableCell>
                    <TableCell>
                      {application.deadline
                        ? formatDate(application.deadline)
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={route("jobs.show", application.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <Can permission="jobs.edit">
                            <DropdownMenuItem asChild>
                              <Link href={route("jobs.edit", application.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                          </Can>
                          <Can permission="jobs.delete">
                            <DropdownMenuItem
                              onClick={() => handleDelete(application)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </Can>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {applications.last_page > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              {(applications.current_page - 1) * applications.per_page + 1} to{" "}
              {Math.min(
                applications.current_page * applications.per_page,
                applications.total
              )}{" "}
              of {applications.total} applications
            </div>
            <div className="flex items-center gap-1">
              {applications.links.map((link, index) => (
                <Button
                  key={index}
                  variant={link.active ? "default" : "outline"}
                  size="sm"
                  disabled={!link.url}
                  onClick={() => link.url && router.get(link.url)}
                  dangerouslySetInnerHTML={{ __html: link.label }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
