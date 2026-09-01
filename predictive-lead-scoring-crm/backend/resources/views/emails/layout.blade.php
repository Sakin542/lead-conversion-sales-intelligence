<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? config('app.name') }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #0f172a;
            color: #f8fafc;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }
        .wrapper {
            width: 100%;
            background-color: #0f172a;
            padding: 30px 15px;
            box-sizing: border-box;
        }
        .main-card {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e293b;
            border: 1px solid #334155;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
        }
        .header {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            padding: 24px 32px;
            text-align: left;
        }
        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.5px;
        }
        .header p {
            color: #e0e7ff;
            margin: 4px 0 0 0;
            font-size: 12px;
            font-weight: 500;
        }
        .content {
            padding: 32px;
            color: #e2e8f0;
            font-size: 15px;
            line-height: 1.6;
        }
        .content h2 {
            color: #ffffff;
            font-size: 18px;
            margin-top: 0;
            margin-bottom: 16px;
        }
        .detail-box {
            background-color: #0f172a;
            border: 1px solid #334155;
            border-radius: 12px;
            padding: 18px;
            margin: 20px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px solid #1e293b;
            font-size: 14px;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            color: #94a3b8;
            font-weight: 600;
        }
        .detail-value {
            color: #f8fafc;
            font-weight: 700;
            text-align: right;
        }
        .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
        }
        .badge-hot {
            background-color: rgba(245, 158, 11, 0.2);
            color: #fcd34d;
            border: 1px solid rgba(245, 158, 11, 0.4);
        }
        .badge-warm {
            background-color: rgba(99, 102, 241, 0.2);
            color: #a5b4fc;
            border: 1px solid rgba(99, 102, 241, 0.4);
        }
        .badge-cold {
            background-color: rgba(148, 163, 184, 0.2);
            color: #cbd5e1;
            border: 1px solid rgba(148, 163, 184, 0.4);
        }
        .btn-container {
            margin: 28px 0 16px 0;
            text-align: left;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
            color: #ffffff !important;
            font-weight: 700;
            font-size: 14px;
            padding: 12px 28px;
            border-radius: 10px;
            text-decoration: none;
            box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
        }
        .footer {
            background-color: #0f172a;
            padding: 20px 32px;
            border-top: 1px solid #334155;
            text-align: center;
            font-size: 12px;
            color: #64748b;
        }
        .footer a {
            color: #818cf8;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-card">
            <div class="header">
                <h1>{{ config('app.name') }}</h1>
                <p>Predictive Lead Scoring & CRM Sales Intelligence</p>
            </div>
            <div class="content">
                @yield('content')
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.</p>
                <p>Automated CRM Notification System &bull; <a href="{{ env('FRONTEND_URL', 'http://localhost:5173') }}">Visit Portal</a></p>
            </div>
        </div>
    </div>
</body>
</html>

