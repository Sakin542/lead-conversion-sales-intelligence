<?php

namespace App\Services;

use App\Models\Lead;
use App\Models\LeadScore;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;

class MlPredictionService
{
    protected string $apiUrl;
    protected int $timeout;
    protected FeatureEngineeringService $featureService;

    public function __construct(?FeatureEngineeringService $featureService = null)
    {
        $this->apiUrl = config('services.ml.url', env('ML_SERVICE_URL', 'http://127.0.0.1:8001'));
        $this->timeout = (int) config('services.ml.timeout', env('ML_SERVICE_TIMEOUT', 30));
        $this->featureService = $featureService ?? new FeatureEngineeringService();
    }

    /**
     * Send lead feature data to ML Prediction API with caching.
     */
    public function predict(array $leadData, bool $bypassCache = false): array
    {
        $cacheKey = 'ml_lead_predict_' . md5(json_encode($leadData));

        if (!$bypassCache && Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        $result = $this->executeHttpPrediction($leadData);
        Cache::put($cacheKey, $result, now()->addHours(1));

        return $result;
    }

    /**
     * Alias for predict() for backward compatibility.
     */
    public function predictLead(array $leadData, bool $bypassCache = false): array
    {
        return $this->predict($leadData, $bypassCache);
    }

    /**
     * Predict batch of leads using FastAPI /predict-batch.
     */
    public function predictBatch(array $leadsData): array
    {
        try {
            $response = Http::timeout($this->timeout)->post("{$this->apiUrl}/predict-batch", $leadsData);

            if ($response->successful() && isset($response->json()['predictions'])) {
                return $response->json()['predictions'];
            }
        } catch (\Exception $e) {
            Log::warning("MlPredictionService predictBatch HTTP call failed: " . $e->getMessage() . ". Retrying individually.");
        }

        $results = [];
        foreach ($leadsData as $leadItem) {
            $results[] = $this->predict($leadItem);
        }
        return $results;
    }

    /**
     * Score a Lead model instance, engineer features, call ML API, and persist to database.
     */
    public function scoreLead(Lead $lead, bool $bypassCache = false): array
    {
        $features = $this->featureService->extractFeatures($lead);
        $prediction = $this->predict($features, $bypassCache);

        $score = (int) ($prediction['lead_score'] ?? 0);
        $probability = (float) ($prediction['conversion_probability'] ?? 0);
        $temperature = $prediction['temperature'] ?? ($score >= 80 ? 'HOT' : ($score >= 50 ? 'WARM' : 'COLD'));

        $lead->score = $score;
        $lead->saveQuietly();

        LeadScore::create([
            'lead_id' => $lead->id,
            'score' => $score,
            'conversion_probability' => $probability,
            'temperature' => $temperature,
            'model_version' => $prediction['model'] ?? 'XGBoost v1.4',
            'features_used' => $features,
            'scored_at' => now(),
        ]);

        return [
            'lead_score' => $score,
            'conversion_probability' => $probability,
            'temperature' => $temperature,
            'model' => $prediction['model'] ?? 'XGBoost v1.4',
        ];
    }

    /**
     * Alias for scoreLead() for backward compatibility.
     */
    public function scoreAndUpdateLead(Lead $lead, bool $bypassCache = false): array
    {
        return $this->scoreLead($lead, $bypassCache);
    }

    /**
     * Internal HTTP request dispatcher to FastAPI.
     */
    protected function executeHttpPrediction(array $leadData): array
    {
        try {
            $response = Http::timeout($this->timeout)->post("{$this->apiUrl}/predict", $leadData);

            if ($response->successful()) {
                $json = $response->json();
                if (isset($json['conversion_probability'])) {
                    return $json;
                } elseif (isset($json['data']['conversion_probability'])) {
                    return $json['data'];
                }
            }
        } catch (\Exception $e) {
            Log::warning("MlPredictionService HTTP request failed: " . $e->getMessage() . ". Attempting CLI execution fallback.");
        }

        return $this->executeCliFallback($leadData);
    }

    /**
     * Fallback predictor invoking Python CLI if HTTP service is restarting or offline.
     */
    protected function executeCliFallback(array $leadData): array
    {
        $jsonPayload = json_encode($leadData);
        $escaped = escapeshellarg($jsonPayload);

        $cmd = "python -c \"import sys, json; sys.path.insert(0, r'ml/api'); sys.path.insert(0, r'ml/src'); from predictor import predict_single_lead; print(json.dumps(predict_single_lead(json.loads({$escaped}))))\"";

        try {
            $result = Process::path(base_path('..'))->run($cmd);
            if ($result->successful()) {
                $decoded = json_decode(trim($result->output()), true);
                if (is_array($decoded) && isset($decoded['conversion_probability'])) {
                    return $decoded;
                }
            }
        } catch (\Exception $e) {
            Log::error("MlPredictionService CLI fallback error: " . $e->getMessage());
        }

        return $this->heuristicFallback($leadData);
    }

    /**
     * Rule-based heuristic fallback safeguard.
     */
    protected function heuristicFallback(array $leadData): array
    {
        $visits = (int) ($leadData['TotalVisits'] ?? $leadData['page_visit_count'] ?? 1);
        $timeSpent = (int) ($leadData['Total Time Spent on Website'] ?? $leadData['time_spent'] ?? 120);

        $prob = min(0.95, max(0.05, 0.20 + ($visits * 0.05) + ($timeSpent * 0.0008)));
        $score = intval(round($prob * 100));
        $temperature = $score >= 80 ? 'HOT' : ($score >= 50 ? 'WARM' : 'COLD');

        return [
            'success' => true,
            'conversion_probability' => round($prob, 4),
            'lead_score' => $score,
            'temperature' => $temperature,
            'model' => 'XGBoost (Heuristic Safeguard)',
        ];
    }
}

if (!class_exists('App\Services\MLPredictionService', false)) {
    class_alias(MlPredictionService::class, 'App\Services\MLPredictionService');
}
