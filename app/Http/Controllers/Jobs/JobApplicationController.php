<?php

namespace App\Http\Controllers\Jobs;

use App\Http\Controllers\Controller;
use App\Http\Requests\Jobs\StoreJobApplicationRequest;
use App\Http\Requests\Jobs\UpdateJobApplicationRequest;
use App\Models\JobApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\JobApplicationsExport;

class JobApplicationController extends Controller
{
    /**
     * Display a listing of job applications.
     */
    public function index(Request $request): InertiaResponse
    {
        Gate::authorize('jobs.view');

        $query = JobApplication::forUser(auth()->id())
            ->with('histories');

        // Apply filters
        if ($request->filled('status')) {
            $query->byStatus($request->status);
        }

        if ($request->filled('company')) {
            $query->where('company_name', 'like', '%' . $request->company . '%');
        }

        if ($request->filled('position')) {
            $query->where('position_title', 'like', '%' . $request->position . '%');
        }

        if ($request->filled('job_type')) {
            $query->where('job_type', $request->job_type);
        }

        if ($request->filled('date_from')) {
            $query->where('application_date', '>=', $request->date_from);
        }

        if ($request->filled('date_to')) {
            $query->where('application_date', '<=', $request->date_to);
        }

        // Apply sorting
        $sortBy = $request->get('sort_by', 'application_date');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $applications = $query->paginate(15)->withQueryString();

        return Inertia::render('jobs/index', [
            'applications' => $applications,
            'filters' => $request->only(['status', 'company', 'position', 'job_type', 'date_from', 'date_to']),
            'sorting' => ['sort_by' => $sortBy, 'sort_order' => $sortOrder],
            'statuses' => JobApplication::STATUSES,
            'jobTypes' => JobApplication::JOB_TYPES,
        ]);
    }

    /**
     * Display statistics dashboard.
     */
    public function statistics(): InertiaResponse
    {
        Gate::authorize('jobs.view');

        $userId = auth()->id();

        // Get applications per month for the last 12 months
        $monthlyStats = collect();
        for ($i = 11; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $count = JobApplication::forUser($userId)
                ->whereYear('application_date', $date->year)
                ->whereMonth('application_date', $date->month)
                ->count();

            $monthlyStats->push([
                'month' => $date->format('M Y'),
                'count' => $count,
            ]);
        }

        // Get status breakdown
        $statusBreakdown = JobApplication::forUser($userId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                    'color' => (new JobApplication(['status' => $item->status]))->status_color,
                ];
            });

        // Overall statistics
        $totalApplications = JobApplication::forUser($userId)->count();
        $inProgressApplications = JobApplication::forUser($userId)
            ->whereIn('status', ['Applied', 'Technical Interview', 'Final Interview'])
            ->count();
        $completedApplications = JobApplication::forUser($userId)
            ->whereIn('status', ['Offer', 'Rejected', 'Withdrawn'])
            ->count();

        return Inertia::render('jobs/statistics', [
            'monthlyStats' => $monthlyStats,
            'statusBreakdown' => $statusBreakdown,
            'totalApplications' => $totalApplications,
            'inProgressApplications' => $inProgressApplications,
            'completedApplications' => $completedApplications,
        ]);
    }

    /**
     * Show the form for creating a new job application.
     */
    public function create(): InertiaResponse
    {
        Gate::authorize('jobs.create');

        return Inertia::render('jobs/create', [
            'statuses' => JobApplication::STATUSES,
            'jobTypes' => JobApplication::JOB_TYPES,
        ]);
    }

    /**
     * Store a newly created job application.
     */
    public function store(StoreJobApplicationRequest $request): RedirectResponse
    {
        Gate::authorize('jobs.create');

        $validated = $request->validated();
        $validated['user_id'] = auth()->id();

        JobApplication::create($validated);

        return redirect()->route('jobs.index')
            ->with('success', 'Job application created successfully.');
    }

    /**
     * Display the specified job application.
     */
    public function show(JobApplication $jobApplication): InertiaResponse
    {
        Gate::authorize('jobs.view');

        // Ensure user can only view their own applications
        if ($jobApplication->user_id !== auth()->id()) {
            abort(403);
        }

        $jobApplication->load('histories');

        return Inertia::render('jobs/show', [
            'application' => $jobApplication,
        ]);
    }

    /**
     * Show the form for editing the specified job application.
     */
    public function edit(JobApplication $jobApplication): InertiaResponse
    {
        Gate::authorize('jobs.edit');

        // Ensure user can only edit their own applications
        if ($jobApplication->user_id !== auth()->id()) {
            abort(403);
        }

        return Inertia::render('jobs/edit', [
            'application' => $jobApplication,
            'statuses' => JobApplication::STATUSES,
            'jobTypes' => JobApplication::JOB_TYPES,
        ]);
    }

    /**
     * Update the specified job application.
     */
    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): RedirectResponse
    {
        Gate::authorize('jobs.edit');

        // Ensure user can only update their own applications
        if ($jobApplication->user_id !== auth()->id()) {
            abort(403);
        }

        $jobApplication->update($request->validated());

        return redirect()->route('jobs.index')
            ->with('success', 'Job application updated successfully.');
    }

    /**
     * Remove the specified job application.
     */
    public function destroy(JobApplication $jobApplication): RedirectResponse
    {
        Gate::authorize('jobs.delete');

        // Ensure user can only delete their own applications
        if ($jobApplication->user_id !== auth()->id()) {
            abort(403);
        }

        $jobApplication->delete();

        return redirect()->route('jobs.index')
            ->with('success', 'Job application deleted successfully.');
    }

    /**
     * Export job applications to CSV.
     */
    public function exportCsv(Request $request): BinaryFileResponse
    {
        Gate::authorize('jobs.view');

        return Excel::download(
            new JobApplicationsExport(auth()->id(), $request->all()),
            'job-applications.csv',
            \Maatwebsite\Excel\Excel::CSV
        );
    }

    /**
     * Export job applications to Excel.
     */
    public function exportExcel(Request $request): BinaryFileResponse
    {
        Gate::authorize('jobs.view');

        return Excel::download(
            new JobApplicationsExport(auth()->id(), $request->all()),
            'job-applications.xlsx'
        );
    }
}
