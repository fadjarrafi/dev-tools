<?php

namespace App\Exports;

use App\Models\JobApplication;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class JobApplicationsExport implements FromCollection, WithHeadings, WithMapping, WithStyles, ShouldAutoSize
{
    protected $userId;
    protected $filters;

    public function __construct($userId, array $filters = [])
    {
        $this->userId = $userId;
        $this->filters = $filters;
    }

    /**
     * Get the collection of job applications to export.
     */
    public function collection()
    {
        $query = JobApplication::forUser($this->userId);

        // Apply filters
        if (!empty($this->filters['status'])) {
            $query->byStatus($this->filters['status']);
        }

        if (!empty($this->filters['company'])) {
            $query->where('company_name', 'like', '%' . $this->filters['company'] . '%');
        }

        if (!empty($this->filters['position'])) {
            $query->where('position_title', 'like', '%' . $this->filters['position'] . '%');
        }

        if (!empty($this->filters['job_type'])) {
            $query->where('job_type', $this->filters['job_type']);
        }

        if (!empty($this->filters['date_from'])) {
            $query->where('application_date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->where('application_date', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('application_date', 'desc')->get();
    }

    /**
     * Define the headings for the export.
     */
    public function headings(): array
    {
        return [
            'Company',
            'Position',
            'Location',
            'Salary Range',
            'Job Type',
            'Status',
            'Application Date',
            'Deadline',
            'Job Description',
            'Notes',
            'Created At',
            'Updated At',
        ];
    }

    /**
     * Map the data for each row.
     */
    public function map($jobApplication): array
    {
        return [
            $jobApplication->company_name,
            $jobApplication->position_title,
            $jobApplication->location,
            $jobApplication->salary_range,
            $jobApplication->job_type,
            $jobApplication->status,
            $jobApplication->application_date ? $jobApplication->application_date->format('Y-m-d') : '',
            $jobApplication->deadline ? $jobApplication->deadline->format('Y-m-d') : '',
            $jobApplication->job_description,
            $jobApplication->notes,
            $jobApplication->created_at->format('Y-m-d H:i:s'),
            $jobApplication->updated_at->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * Apply styles to the worksheet.
     */
    public function styles(Worksheet $sheet)
    {
        return [
            // Style the first row as bold header
            1 => ['font' => ['bold' => true]],
        ];
    }
}
