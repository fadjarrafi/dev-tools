<?php

namespace App\Http\Requests\Jobs;

use App\Models\JobApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->can('jobs.create');
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'position_title' => ['required', 'string', 'max:255'],
            'location' => ['nullable', 'string', 'max:255'],
            'salary_range' => ['nullable', 'string', 'max:255'],
            'job_type' => ['required', Rule::in(JobApplication::JOB_TYPES)],
            'status' => ['required', Rule::in(JobApplication::STATUSES)],
            'application_date' => ['required', 'date'],
            'deadline' => ['nullable', 'date', 'after_or_equal:application_date'],
            'job_description' => ['nullable', 'string', 'max:5000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'company_name.required' => 'Company name is required.',
            'position_title.required' => 'Position title is required.',
            'job_type.required' => 'Job type is required.',
            'job_type.in' => 'Please select a valid job type.',
            'status.required' => 'Status is required.',
            'status.in' => 'Please select a valid status.',
            'application_date.required' => 'Application date is required.',
            'application_date.date' => 'Application date must be a valid date.',
            'deadline.date' => 'Deadline must be a valid date.',
            'deadline.after_or_equal' => 'Deadline must be on or after the application date.',
            'job_description.max' => 'Job description cannot exceed 5000 characters.',
            'notes.max' => 'Notes cannot exceed 2000 characters.',
        ];
    }
}
