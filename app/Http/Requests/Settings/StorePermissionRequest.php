<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class StorePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('permissions.create');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:permissions',
            'description' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Permission name is required.',
            'name.unique' => 'This permission name already exists.',
            'description.max' => 'Description cannot exceed 500 characters.',
        ];
    }
}
