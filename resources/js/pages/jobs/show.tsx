import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Can from "@/components/can";
import AppLayout from "@/layouts/app-layout";
import { Head, Link, router } from "@inertiajs/react";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  FileText,
  StickyNote,
  History,
} from "lucide-react";

interface JobApplicationHistory {
  id: number;
  field_changed: string;
  old_value: string | null;
  new_value: string | null;
  changed_at: string;
  formatted_field_name: string;
  formatted_old_value: string;
  formatted_new_value: string;
}

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
  histories: JobApplicationHistory[];
}

interface Props {
  application: JobApplication;
}

export default function JobsShow({ application }: Props) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete the application for ${application.position_title} at ${application.company_name}?`
      )
    ) {
      router.delete(route("jobs.destroy", application.id));
    }
  };

  const breadcrumbs = [
    { title: "Job Applications", href: route("jobs.index") },
    {
      title: `${application.company_name} - ${application.position_title}`,
      href: route("jobs.show", application.id),
    },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head
        title={`${application.position_title} at ${application.company_name}`}
      />

      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={route("jobs.index")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Applications
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {application.position_title}
            </h1>
            <p className="text-xl text-muted-foreground">
              {application.company_name}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={application.status_color}>
                {application.status}
              </Badge>
              <Badge variant="outline">{application.job_type}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Can permission="jobs.edit">
              <Button variant="outline" asChild>
                <Link href={route("jobs.edit", application.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </Can>
            <Can permission="jobs.delete">
              <Button variant="outline" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </Can>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Applied On
                      </p>
                      <p className="font-medium">
                        {formatDate(application.application_date)}
                      </p>
                    </div>
                  </div>

                  {application.deadline && (
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Deadline
                        </p>
                        <p className="font-medium">
                          {formatDate(application.deadline)}
                        </p>
                      </div>
                    </div>
                  )}

                  {application.location && (
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Location
                        </p>
                        <p className="font-medium">{application.location}</p>
                      </div>
                    </div>
                  )}

                  {application.salary_range && (
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Salary Range
                        </p>
                        <p className="font-medium">
                          {application.salary_range}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Job Type</p>
                      <p className="font-medium">{application.job_type}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Description */}
            {application.job_description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm">
                      {application.job_description}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes */}
            {application.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap text-sm">
                    {application.notes}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={application.status_color}>
                    {application.status}
                  </Badge>
                </div>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-sm font-medium">
                    {formatDateTime(application.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-sm font-medium">
                    {formatDateTime(application.updated_at)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Application History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {application.histories.length > 0 ? (
                  <div className="space-y-4">
                    {application.histories.map((history) => (
                      <div key={history.id} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">
                            {history.formatted_field_name} Changed
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(history.changed_at)}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <span className="line-through">
                            {history.formatted_old_value}
                          </span>
                          {" → "}
                          <span className="font-medium">
                            {history.formatted_new_value}
                          </span>
                        </div>
                        {history !==
                          application.histories[
                            application.histories.length - 1
                          ] && <Separator className="mt-3" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">
                      No changes recorded yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
