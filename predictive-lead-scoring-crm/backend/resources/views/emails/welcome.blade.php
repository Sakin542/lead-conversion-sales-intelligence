@extends('emails.layout', ['title' => 'Welcome to Predictive Lead Scoring CRM'])

@section('content')
    <h2>Hello {{ $user->name }},</h2>
    
    <p>Welcome to <strong>{{ config('app.name') }}</strong>!</p>
    
    <p>Your account has been successfully created. You can now log in and start managing your leads, activities, sales pipeline, and AI conversion analytics.</p>
    
    <div class="detail-box">
        <div class="detail-row">
            <span class="detail-label">Account Name:</span>
            <span class="detail-value">{{ $user->name }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Email Address:</span>
            <span class="detail-value">{{ $user->email }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Registration Date:</span>
            <span class="detail-value">{{ $user->created_at->format('M d, Y') }}</span>
        </div>
    </div>
    
    <div class="btn-container">
        <a href="{{ $loginUrl }}" class="btn">Login to CRM</a>
    </div>
    
    <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        If you have any questions or need support getting started, feel free to contact our team.
    </p>
    
    <p style="margin-top: 20px;">
        Regards,<br>
        <strong>{{ config('app.name') }} Team</strong>
    </p>
@endsection

