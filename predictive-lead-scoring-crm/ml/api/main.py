import os
import sys
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Union

# Ensure api directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from schemas import (
    LeadPredictionResponse,
    BatchPredictionResponse,
    HealthResponse,
    ModelInfoResponse
)
from predictor import (
    load_model_bundle,
    predict_single_lead,
    predict_batch_leads
)

app = FastAPI(
    title="AI-Powered Lead Conversion & Sales Intelligence ML Prediction API",
    description="Production FastAPI service for predicting lead conversion probability and lead score using trained XGBoost model",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    try:
        bundle = load_model_bundle()
        print(f"[+] Loaded ML Model: {bundle.get('model_name', 'XGBoost')} successfully.")
    except Exception as e:
        print(f"[!] Warning: Failed to pre-load ML model during startup: {e}")

@app.get("/health", response_model=HealthResponse)
def health_check():
    try:
        bundle = load_model_bundle()
        is_loaded = bundle is not None
        model_name = bundle.get("model_name", "XGBoost") if is_loaded else "XGBoost"
    except Exception:
        is_loaded = False
        model_name = "XGBoost"

    return HealthResponse(
        status="online",
        service="ML Lead Scoring Prediction Service",
        version="1.0.0",
        model_loaded=is_loaded,
        model_name=model_name,
        roc_auc=0.9263
    )

@app.get("/model-info", response_model=ModelInfoResponse)
def model_info():
    return ModelInfoResponse(
        success=True,
        primary_model="XGBoost Classifier",
        roc_auc=0.9263,
        accuracy=0.8555,
        f1_score=0.8204,
        precision=0.7871,
        recall=0.8567,
        features_count=32,
        training_dataset="Lead Scoring.csv (7,392 Train / 1,848 Test Stratified Split)"
    )

@app.post("/predict", response_model=LeadPredictionResponse)
async def predict_endpoint(request: Request):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload provided.")

    if not isinstance(payload, dict):
        raise HTTPException(status_code=422, detail="Request payload must be a JSON object.")

    # Unpack nested 'lead_data' or 'data' if passed, else use top-level keys
    lead_features = payload.get("lead_data") or payload.get("data") or payload

    if not isinstance(lead_features, dict):
        raise HTTPException(status_code=422, detail="Lead features must be a dictionary.")

    try:
        result = predict_single_lead(lead_features)
        return LeadPredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction inference failed: {str(e)}")

@app.post("/predict-batch", response_model=BatchPredictionResponse)
async def predict_batch_endpoint(request: Request):
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    leads_list = payload if isinstance(payload, list) else payload.get("leads", [])

    if not isinstance(leads_list, list) or len(leads_list) == 0:
        raise HTTPException(status_code=422, detail="Expected non-empty array of lead objects.")

    try:
        predictions = predict_batch_leads(leads_list)
        return BatchPredictionResponse(
            success=True,
            count=len(predictions),
            predictions=[LeadPredictionResponse(**p) for p in predictions]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

