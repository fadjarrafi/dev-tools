import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/layouts/app-layout";
import { Head, Link } from "@inertiajs/react";
import { ArrowLeft, TrendingUp, Users, CheckCircle } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface MonthlyStats {
  month: string;
  count: number;
}

interface StatusBreakdown {
  status: string;
  count: number;
  color: string;
}

interface Props {
  monthlyStats: MonthlyStats[];
  statusBreakdown: StatusBreakdown[];
  totalApplications: number;
  inProgressApplications: number;
  completedApplications: number;
}

const CHART_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#10b981", // green
  "#f59e0b", // yellow
  "#8b5cf6", // purple
  "#ec4899", // pink
];

export default function JobsStatistics({
  monthlyStats,
  statusBreakdown,
  totalApplications,
  inProgressApplications,
  completedApplications,
}: Props) {
  const breadcrumbs = [
    { title: "Job Applications", href: route("jobs.index") },
    { title: "Statistics", href: route("jobs.statistics") },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Job Application Statistics" />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Application Statistics
            </h1>
            <p className="text-muted-foreground">
              Overview of your job application activity
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href={route("jobs.index")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Applications
            </Link>
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                All time applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressApplications}</div>
              <p className="text-xs text-muted-foreground">
                Currently active applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedApplications}</div>
              <p className="text-xs text-muted-foreground">
                Finished applications
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Applications Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Applications Over Time</CardTitle>
              <p className="text-sm text-muted-foreground">
                Number of applications per month (last 12 months)
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="month"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-3 border rounded-lg shadow-lg">
                              <p className="font-medium">{label}</p>
                              <p className="text-blue-600">
                                Applications: {payload[0].value}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Status Breakdown Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Status Breakdown</CardTitle>
              <p className="text-sm text-muted-foreground">
                Distribution of application statuses
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {statusBreakdown.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="count"
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-3 border rounded-lg shadow-lg">
                                <p className="font-medium">{data.status}</p>
                                <p className="text-blue-600">
                                  Count: {data.count}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Legend */}
        {statusBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Status Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {statusBreakdown.map((item, index) => (
                  <div key={item.status} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_COLORS[index % CHART_COLORS.length],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item.status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} applications
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Data State */}
        {totalApplications === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <TrendingUp className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">No Applications Yet</h3>
                  <p className="text-muted-foreground">
                    Start tracking your job applications to see statistics here
                  </p>
                </div>
                <Button asChild>
                  <Link href={route("jobs.create")}>
                    Add Your First Application
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
