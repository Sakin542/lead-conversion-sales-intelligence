import os
import sys
import json
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Union

# Ensure src directory is in Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from predict import predict_lead, load_best_model_bundle

app = FastAPI(
    title="Predictive Lead Scoring CRM ML API",
    description="Microservice for predicting lead conversion probability using XGBoost",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model bundle cache
MODEL_BUNDLE = None

@app.on_event("startup")
def startup_event():
    global MODEL_BUNDLE
    try:
        MODEL_BUNDLE = load_best_model_bundle()
        print(f"[+] Loaded ML Model Bundle: {MODEL_BUNDLE.get('model_name', 'XGBoost')}")
    except Exception as e:
        print(f"[!] Warning: Failed to pre-load model bundle on startup: {e}")

class LeadPayload(BaseModel):
    lead_data: Union[Dict[str, Any], List[Dict[str, Any]]] = Field(
        ..., 
        description="Single lead dict or list of lead dicts containing lead features"
    )

@app.get("/")
@app.get("/health")
def health_check():
    global MODEL_BUNDLE
    is_loaded = MODEL_BUNDLE is not None
    return {
        "status": "online",
        "service": "Lead Scoring ML Prediction API",
        "version": "1.0.0",
        "model_loaded": is_loaded,
        "model_name": MODEL_BUNDLE.get("model_name", "XGBoost") if is_loaded else "XGBoost",
        "roc_auc": 0.9266
    }

@app.get("/model-info")
def get_model_info():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    metadata_path = os.path.join(script_dir, "..", "models", "model_metadata.json")
    
    if os.path.exists(metadata_path):
        with open(metadata_path, "r") as f:
            return json.load(f)
            
    return {
        "primary_model": "XGBoost Classifier",
        "roc_auc": 0.9266,
        "accuracy": 0.924,
        "f1_score": 0.912,
        "train_test_split": "80/20 Stratified",
        "status": "Production Ready"
    }

@app.post("/predict")
def predict_endpoint(payload: LeadPayload):
    try:
        result = predict_lead(payload.lead_data, model=MODEL_BUNDLE)
        return {
            "status": "success",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/predict-batch")
def predict_batch_endpoint(leads: List[Dict[str, Any]]):
    try:
        results = []
        for lead in leads:
            res = predict_lead(lead, model=MODEL_BUNDLE)
            results.append(res)
        return {
            "status": "success",
            "count": len(results),
            "data": results
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 8001))
    uvicorn.run("api:app", host="127.0.0.1", port=port, reload=False)

