@extends('emails.layout', ['title' => 'Reset Your CRM Password'])

@section('content')
    <h2>Hello {{ $user->name }},</h2>
    
    <p>We received a request to reset your <strong>{{ config('app.name') }}</strong> password. Click the button below to set a new password for your account:</p>
    
    <div class="btn-container" style="margin: 28px 0; text-align: center;">
        <a href="{{ $resetUrl }}" class="btn" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block;">Reset Password</a>
    </div>
    
    <p style="font-size: 13px; color: #94a3b8; word-break: break-all;">
        If the button doesn't work, copy and paste this link into your browser:<br>
        <a href="{{ $resetUrl }}" style="color: #818cf8;">{{ $resetUrl }}</a>
    </p>
    
    <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        If you did not request a password reset, no further action is required and you can safely ignore this email.
    </p>
    
    <p style="margin-top: 24px;">
        Regards,<br>
        <strong>{{ config('app.name') }} Team</strong>
    </p>
@endsection

