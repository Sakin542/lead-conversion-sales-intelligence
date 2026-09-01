@extends('emails.layout', ['title' => 'Lead Score Updated'])

@section('content')
    <h2>Hello {{ $user->name }},</h2>
    
    <p>The ML scoring engine has updated the score for <strong>{{ $lead->first_name }} {{ $lead->last_name }}</strong> ({{ $lead->company }}).</p>
    
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
            <span class="detail-label">Previous Score:</span>
            <span class="detail-value">{{ $previousScore }}%</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">New Score:</span>
            <span class="detail-value" style="color: #60a5fa;">{{ $newScore }}%</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Score Change:</span>
            <span class="detail-value" style="color: {{ $scoreChange >= 0 ? '#34d399' : '#f87171' }};">
                {{ $scoreChange >= 0 ? '+' : '' }}{{ $scoreChange }}%
            </span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Previous Classification:</span>
            <span class="detail-value">{{ $previousClassification }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">New Classification:</span>
            <span class="detail-value">
                @if($newClassification === 'Hot')
                    <span class="badge badge-hot">Hot</span>
                @elseif($newClassification === 'Warm')
                    <span class="badge badge-warm">Warm</span>
                @else
                    <span class="badge badge-cold">Cold</span>
                @endif
            </span>
        </div>
    </div>
    
    <div class="btn-container">
        <a href="{{ $leadUrl }}" class="btn">View Lead Details</a>
    </div>
    
    <p style="margin-top: 20px;">
        Review recent activity logs and intent signals on the lead profile.
    </p>
@endsection

