@extends('emails.layout', ['title' => 'New Lead Assigned to You'])

@section('content')
    <h2>Hello {{ $user->name }},</h2>
    
    <p>A new lead has been assigned to you. Please review the lead details below and follow up promptly.</p>
    
    <div class="detail-box">
        <div class="detail-row">
            <span class="detail-label">Lead Name:</span>
            <span class="detail-value">{{ $lead->first_name }} {{ $lead->last_name }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Company:</span>
            <span class="detail-value">{{ $lead->company }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span class="detail-value">{{ $lead->email }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Lead Source:</span>
            <span class="detail-value">{{ $lead->source ?? 'N/A' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Lead Score:</span>
            <span class="detail-value">{{ $lead->score ?? 0 }}%</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value" style="text-transform: capitalize;">{{ $lead->status }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Estimated Value:</span>
            <span class="detail-value">${{ number_format($lead->estimated_value ?? 0, 2) }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Assigned Date:</span>
            <span class="detail-value">{{ now()->format('M d, Y') }}</span>
        </div>
    </div>
    
    <div class="btn-container">
        <a href="{{ $leadUrl }}" class="btn">View Lead Details</a>
    </div>
    
    <p style="margin-top: 20px;">
        Please review and follow up with this lead.
    </p>
@endsection

