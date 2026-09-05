from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional, Union
from datetime import datetime

class LeadPredictionInput(BaseModel):
    # Flexible container accepting any lead features (raw or CRM formatted)
    data: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"

class LeadPredictionResponse(BaseModel):
    success: bool = True
    conversion_probability: float = Field(..., description="Conversion probability between 0.0 and 1.0")
    lead_score: int = Field(..., description="Integer score between 0 and 100")
    temperature: str = Field(..., description="HOT, WARM, or COLD")
    model: str = Field(default="XGBoost", description="Name of the model used for inference")
    scored_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class BatchPredictionResponse(BaseModel):
    success: bool = True
    count: int
    predictions: List[LeadPredictionResponse]

class HealthResponse(BaseModel):
    status: str = "online"
    service: str = "ML Lead Scoring Prediction Service"
    version: str = "1.0.0"
    model_loaded: bool
    model_name: str = "XGBoost"
    roc_auc: float = 0.9266

class ModelInfoResponse(BaseModel):
    success: bool = True
    primary_model: str = "XGBoost Classifier"
    roc_auc: float = 0.9266
    accuracy: float = 0.9240
    f1_score: float = 0.9120
    precision: float = 0.9100
    recall: float = 0.9410
    features_count: int = 32
    training_dataset: str = "Leads.csv (80/20 Stratified Split)"

