@extends('emails.layout', ['title' => 'Sales Follow-Up Reminder'])

@section('content')
    <h2>Hello {{ $user->name }},</h2>
    
    <p>This is a scheduled reminder for an upcoming sales follow-up task.</p>
    
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
            <span class="detail-label">Follow-up Type:</span>
            <span class="detail-value" style="text-transform: uppercase;">{{ $followUp->type }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Scheduled Time:</span>
            <span class="detail-value" style="color: #fcd34d;">{{ $followUp->scheduled_at->format('M d, Y &mdash; h:i A') }}</span>
        </div>
        @if($followUp->note)
        <div class="detail-row">
            <span class="detail-label">Note:</span>
            <span class="detail-value">{{ $followUp->note }}</span>
        </div>
        @endif
    </div>
    
    <div class="btn-container">
        <a href="{{ $leadUrl }}" class="btn">View Lead</a>
    </div>
    
    <p style="margin-top: 20px;">
        Make sure to update the follow-up status in your CRM dashboard once completed.
    </p>
@endsection

