# ML Prediction Service (FastAPI)

This directory contains the machine learning prediction microservice and training pipelines for the **AI-Powered Lead Conversion & Sales Intelligence System**.

## Directory Structure

```text
ml/
├── api/
│   ├── main.py          # FastAPI application entry point
│   ├── schemas.py       # Pydantic request/response schemas
│   └── predictor.py     # Inference engine with feature normalization
├── models/
│   ├── best_model.pkl   # Serialized XGBoost model bundle (92.66% ROC-AUC)
│   └── lead_conversion_model.pkl
├── src/
│   ├── preprocessing.py # Data loading and ColumnTransformer
│   ├── train_xgboost.py # XGBoost model training
│   ├── evaluate.py      # Model comparison and ROC-AUC evaluation
│   └── predict.py       # Standalone CLI inference helper
├── requirements.txt
└── README.md
```

## Running the ML Prediction API Standalone

```bash
cd ml/api
python main.py
```
Or with Uvicorn directly:
```bash
uvicorn ml.api.main:app --host 0.0.0.0 --port 8001
```

## API Endpoints

- **`GET /health`** — Service health status and model availability.
- **`GET /model-info`** — Model performance metrics and training metadata.
- **`POST /predict`** — Computes conversion probability, lead score (0–100), and temperature (`HOT`/`WARM`/`COLD`).
- **`POST /predict-batch`** — High-throughput batch lead scoring.

