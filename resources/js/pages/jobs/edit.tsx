import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Calendar } from "lucide-react";
import { FormEventHandler } from "react";

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
}

interface Props {
  application: JobApplication;
  statuses: string[];
  jobTypes: string[];
}

interface FormData {
  company_name: string;
  position_title: string;
  location: string;
  salary_range: string;
  job_type: string;
  status: string;
  application_date: string;
  deadline: string;
  job_description: string;
  notes: string;
}

export default function JobsEdit({ application, statuses, jobTypes }: Props) {
  const { data, setData, put, processing, errors } = useForm<FormData>({
    company_name: application.company_name,
    position_title: application.position_title,
    location: application.location || "",
    salary_range: application.salary_range || "",
    job_type: application.job_type,
    status: application.status,
    application_date: application.application_date,
    deadline: application.deadline || "",
    job_description: application.job_description || "",
    notes: application.notes || "",
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    put(route("jobs.update", application.id));
  };

  const breadcrumbs = [
    { title: "Job Applications", href: route("jobs.index") },
    {
      title: `${application.company_name} - ${application.position_title}`,
      href: route("jobs.show", application.id),
    },
    { title: "Edit", href: route("jobs.edit", application.id) },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head
        title={`Edit ${application.position_title} at ${application.company_name}`}
      />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Edit Job Application
            </h1>
            <p className="text-muted-foreground">
              Update your job application details
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={route("jobs.show", application.id)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Application
            </Link>
          </Button>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name *</Label>
                    <Input
                      id="company_name"
                      value={data.company_name}
                      onChange={(e) => setData("company_name", e.target.value)}
                      placeholder="Enter company name..."
                      disabled={processing}
                      autoFocus
                    />
                    {errors.company_name && (
                      <p className="text-sm text-red-600">
                        {errors.company_name}
                      </p>
                    )}
                  </div>

                  {/* Position Title */}
                  <div className="space-y-2">
                    <Label htmlFor="position_title">Position Title *</Label>
                    <Input
                      id="position_title"
                      value={data.position_title}
                      onChange={(e) =>
                        setData("position_title", e.target.value)
                      }
                      placeholder="Enter position title..."
                      disabled={processing}
                    />
                    {errors.position_title && (
                      <p className="text-sm text-red-600">
                        {errors.position_title}
                      </p>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={data.location}
                      onChange={(e) => setData("location", e.target.value)}
                      placeholder="Enter location..."
                      disabled={processing}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-600">{errors.location}</p>
                    )}
                  </div>

                  {/* Salary Range */}
                  <div className="space-y-2">
                    <Label htmlFor="salary_range">Salary Range</Label>
                    <Input
                      id="salary_range"
                      value={data.salary_range}
                      onChange={(e) => setData("salary_range", e.target.value)}
                      placeholder="e.g., 5,000,000 - 7,000,000"
                      disabled={processing}
                    />
                    {errors.salary_range && (
                      <p className="text-sm text-red-600">
                        {errors.salary_range}
                      </p>
                    )}
                  </div>

                  {/* Job Type */}
                  <div className="space-y-2">
                    <Label>Job Type *</Label>
                    <Select
                      value={data.job_type}
                      onValueChange={(value) => setData("job_type", value)}
                      disabled={processing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job type" />
                      </SelectTrigger>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.job_type && (
                      <p className="text-sm text-red-600">{errors.job_type}</p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label>Status *</Label>
                    <Select
                      value={data.status}
                      onValueChange={(value) => setData("status", value)}
                      disabled={processing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>

                  {/* Application Date */}
                  <div className="space-y-2">
                    <Label htmlFor="application_date">Application Date *</Label>
                    <div className="relative">
                      <Input
                        id="application_date"
                        type="date"
                        value={data.application_date}
                        onChange={(e) =>
                          setData("application_date", e.target.value)
                        }
                        disabled={processing}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.application_date && (
                      <p className="text-sm text-red-600">
                        {errors.application_date}
                      </p>
                    )}
                  </div>

                  {/* Deadline */}
                  <div className="space-y-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <div className="relative">
                      <Input
                        id="deadline"
                        type="date"
                        value={data.deadline}
                        onChange={(e) => setData("deadline", e.target.value)}
                        disabled={processing}
                      />
                      <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.deadline && (
                      <p className="text-sm text-red-600">{errors.deadline}</p>
                    )}
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-2">
                  <Label htmlFor="job_description">Job Description</Label>
                  <Textarea
                    id="job_description"
                    value={data.job_description}
                    onChange={(e) => setData("job_description", e.target.value)}
                    placeholder="Enter job description..."
                    rows={6}
                    disabled={processing}
                  />
                  {errors.job_description && (
                    <p className="text-sm text-red-600">
                      {errors.job_description}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={data.notes}
                    onChange={(e) => setData("notes", e.target.value)}
                    placeholder="Enter any additional notes..."
                    rows={4}
                    disabled={processing}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-600">{errors.notes}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={processing}>
                    {processing ? "Updating..." : "Update Application"}
                  </Button>
                  <Button type="button" variant="outline" asChild>
                    <Link href={route("jobs.show", application.id)}>
                      Cancel
                    </Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
