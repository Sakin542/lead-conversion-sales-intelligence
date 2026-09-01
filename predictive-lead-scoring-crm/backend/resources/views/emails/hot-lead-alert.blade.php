@extends('emails.layout', ['title' => '🔥 Hot Lead Alert'])

@section('content')
    <div style="background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 14px; margin-bottom: 20px;">
        <h2 style="color: #f87171; margin: 0; font-size: 16px; font-weight: 800;">
            🔥 HOT LEAD ALERT &mdash; Immediate Follow-up Recommended
        </h2>
    </div>
    
    <p>Hello {{ $user->name }},</p>
    
    <p><strong>{{ $lead->first_name }} {{ $lead->last_name }}</strong> from <strong>{{ $lead->company }}</strong> has been identified by the ML Engine as a high-priority conversion lead.</p>
    
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
            <span class="detail-label">Conversion Probability:</span>
            <span class="detail-value" style="color: #34d399;">{{ $lead->score }}%</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Lead Score:</span>
            <span class="detail-value">{{ $lead->score }}/100</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Estimated Deal Value:</span>
            <span class="detail-value">${{ number_format($lead->estimated_value ?? 0, 2) }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Lead Source:</span>
            <span class="detail-value">{{ $lead->source ?? 'N/A' }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Recommended Action:</span>
            <span class="detail-value" style="color: #fcd34d;">Contact lead within 24 hours</span>
        </div>
    </div>
    
    <div class="btn-container">
        <a href="{{ $leadUrl }}" class="btn" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">View Hot Lead</a>
    </div>
    
    <p style="margin-top: 20px;">
        High purchasing intent detected. Strike while buyer interest is at its peak!
    </p>
@endsection

