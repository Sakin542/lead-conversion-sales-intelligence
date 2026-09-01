<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDealRequest;
use App\Http\Requests\UpdateDealRequest;
use App\Http\Requests\UpdateDealStageRequest;
use App\Models\Deal;
use App\Models\PipelineStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DealController extends Controller
{
    /**
     * Get overall pipeline board with stages, user's deals, and summary statistics.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Retrieve all pipeline stages ordered by position
        $stages = PipelineStage::orderBy('position', 'asc')->get();

        // Query user deals with lead information
        $dealsQuery = $user->deals()->with('lead:id,first_name,last_name,email,company');

        // Optional filtering
        if ($stageId = $request->query('pipeline_stage_id')) {
            $dealsQuery->where('pipeline_stage_id', $stageId);
        }

        if ($stageSlug = $request->query('stage')) {
            $dealsQuery->whereHas('pipelineStage', function ($q) use ($stageSlug) {
                $q->where('slug', $stageSlug);
            });
        }

        if ($minValue = $request->query('min_value')) {
            $dealsQuery->where('value', '>=', (float) $minValue);
        }

        if ($maxValue = $request->query('max_value')) {
            $dealsQuery->where('value', '<=', (float) $maxValue);
        }

        $allDeals = $dealsQuery->get();

        // Calculate summary metrics
        $wonStage = $stages->firstWhere('slug', 'won');
        $lostStage = $stages->firstWhere('slug', 'lost');

        $wonStageId = $wonStage ? $wonStage->id : null;
        $lostStageId = $lostStage ? $lostStage->id : null;

        $openDeals = $allDeals->reject(function ($deal) use ($wonStageId, $lostStageId) {
            return $deal->pipeline_stage_id === $wonStageId || $deal->pipeline_stage_id === $lostStageId;
        });

        $totalPipelineValue = (float) $openDeals->sum('value');
        $openDealsCount = $openDeals->count();
        $wonDealsCount = $wonStageId ? $allDeals->where('pipeline_stage_id', $wonStageId)->count() : 0;
        $lostDealsCount = $lostStageId ? $allDeals->where('pipeline_stage_id', $lostStageId)->count() : 0;

        // Group deals by stage id
        $dealsByStage = $allDeals->groupBy('pipeline_stage_id');

        $stagesData = $stages->map(function ($stage) use ($dealsByStage) {
            $stageDeals = $dealsByStage->get($stage->id, collect());
            return [
                'id' => $stage->id,
                'name' => $stage->name,
                'slug' => $stage->slug,
                'position' => $stage->position,
                'deals_count' => $stageDeals->count(),
                'total_value' => (float) $stageDeals->sum('value'),
                'deals' => $stageDeals->values(),
            ];
        });

        return response()->json([
            'success' => true,
            'message' => 'Pipeline data retrieved successfully',
            'summary' => [
                'total_pipeline_value' => $totalPipelineValue,
                'open_deals_count' => $openDealsCount,
                'won_deals_count' => $wonDealsCount,
                'lost_deals_count' => $lostDealsCount,
                'total_deals_count' => $allDeals->count(),
            ],
            'stages' => $stagesData,
            'all_deals' => $allDeals,
        ]);
    }

    /**
     * Store a newly created deal.
     */
    public function store(StoreDealRequest $request): JsonResponse
    {
        $data = $request->validated();
        $deal = $request->user()->deals()->create($data);
        $deal->load(['lead:id,first_name,last_name,email,company', 'pipelineStage']);

        return response()->json([
            'success' => true,
            'message' => 'Deal created successfully',
            'data' => $deal,
        ], 201);
    }

    /**
     * Display the specified deal.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $deal = $request->user()->deals()->with(['lead', 'pipelineStage'])->find($id);

        if (!$deal) {
            return response()->json([
                'success' => false,
                'message' => 'Deal not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Deal retrieved successfully',
            'data' => $deal,
        ]);
    }

    /**
     * Update the specified deal.
     */
    public function update(UpdateDealRequest $request, string $id): JsonResponse
    {
        $deal = $request->user()->deals()->find($id);

        if (!$deal) {
            return response()->json([
                'success' => false,
                'message' => 'Deal not found',
            ], 404);
        }

        $deal->update($request->validated());
        $deal->load(['lead:id,first_name,last_name,email,company', 'pipelineStage']);

        return response()->json([
            'success' => true,
            'message' => 'Deal updated successfully',
            'data' => $deal,
        ]);
    }

    /**
     * Update only the pipeline stage of a deal (stage movement).
     */
    public function updateStage(UpdateDealStageRequest $request, string $id): JsonResponse
    {
        $deal = $request->user()->deals()->find($id);

        if (!$deal) {
            return response()->json([
                'success' => false,
                'message' => 'Deal not found',
            ], 404);
        }

        $deal->update(['pipeline_stage_id' => $request->validated('pipeline_stage_id')]);
        $deal->load(['lead:id,first_name,last_name,email,company', 'pipelineStage']);

        return response()->json([
            'success' => true,
            'message' => 'Deal stage updated successfully',
            'data' => $deal,
        ]);
    }

    /**
     * Remove the specified deal from storage.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $deal = $request->user()->deals()->find($id);

        if (!$deal) {
            return response()->json([
                'success' => false,
                'message' => 'Deal not found',
            ], 404);
        }

        $deal->delete();

        return response()->json([
            'success' => true,
            'message' => 'Deal deleted successfully',
        ]);
    }
}

