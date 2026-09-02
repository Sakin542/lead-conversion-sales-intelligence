@extends('emails.layout', ['title' => 'CRM Account Invitation'])

@section('content')
    <h2>Welcome to {{ config('app.name') }}, {{ $user->name }}!</h2>
    <p>You have been invited to join the CRM as a <strong>{{ str_replace('_', ' ', $user->role) }}</strong> by {{ $inviterName }}.</p>

    <div class="detail-box">
        <div class="detail-row">
            <span class="detail-label">Account Email</span>
            <span class="detail-value">{{ $user->email }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Assigned Role</span>
            <span class="detail-value">{{ str_replace('_', ' ', $user->role) }}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Invitation Expiration</span>
            <span class="detail-value">{{ $expiresAt }}</span>
        </div>
    </div>

    <p>To activate your CRM account and set your password, please click the button below:</p>

    <div class="btn-container">
        <a href="{{ $invitationUrl }}" class="btn">Set Password & Activate Account</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
        If you did not expect this invitation, you can safely ignore this email. The link will expire automatically.
    </p>
@endsection

