<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreLeadActivityRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in([
                'email_open',
                'page_visit',
                'form_submission',
                'email_click',
                'demo_request',
                'call',
                'meeting',
            ])],
            'description' => ['required', 'string'],
            'metadata' => ['nullable', 'array'],
            'occurred_at' => ['nullable', 'date'],
        ];
    }
}

