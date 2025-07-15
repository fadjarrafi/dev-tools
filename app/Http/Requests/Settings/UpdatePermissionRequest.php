<?php

namespace App\Http\Requests\Settings;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePermissionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('permissions.edit');
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255|unique:permissions,name,' . $this->route('permission')->id,
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
