import os
import joblib
import pandas as pd
import numpy as np
from typing import Dict, Any, List, Union

MODEL_BUNDLE = None

# Mapping standard CRM attribute aliases to trained dataset feature names
CRM_TO_MODEL_FEATURE_MAP = {
    "source": "Lead Source",
    "lead_source": "Lead Source",
    "lead_origin": "Lead Origin",
    "total_visits": "TotalVisits",
    "page_visit_count": "TotalVisits",
    "time_spent": "Total Time Spent on Website",
    "total_time_spent_on_website": "Total Time Spent on Website",
    "page_views_per_visit": "Page Views Per Visit",
    "last_activity": "Last Activity",
    "do_not_email": "Do Not Email",
    "do_not_call": "Do Not Call",
    "country": "Country",
    "specialization": "Specialization",
    "occupation": "What is your current occupation",
    "current_occupation": "What is your current occupation",
    "city": "City",
}

def load_model_bundle():
    global MODEL_BUNDLE
    if MODEL_BUNDLE is not None:
        return MODEL_BUNDLE

    current_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(current_dir, '..', 'models', 'lead_conversion_model.pkl')),
        os.path.abspath(os.path.join(current_dir, '..', 'models', 'best_model.pkl')),
        os.path.abspath(os.path.join(current_dir, '..', 'saved_models', 'lead_conversion_model.pkl')),
    ]

    for candidate in candidates:
        if os.path.exists(candidate):
            try:
                bundle = joblib.load(candidate)
                if isinstance(bundle, dict) and 'model' in bundle and 'preprocessor' in bundle:
                    MODEL_BUNDLE = bundle
                    return MODEL_BUNDLE
                elif hasattr(bundle, 'predict_proba'):
                    MODEL_BUNDLE = {
                        'model_name': 'XGBoost',
                        'pipeline': bundle,
                        'model': bundle.named_steps['model'] if hasattr(bundle, 'named_steps') else bundle,
                        'preprocessor': bundle.named_steps['preprocessor'] if hasattr(bundle, 'named_steps') else None
                    }
                    return MODEL_BUNDLE
            except Exception as e:
                print(f"[!] Failed to load model from {candidate}: {e}")

    # Fallback to loading via src
    try:
        from src.predict import load_best_model_bundle
        MODEL_BUNDLE = load_best_model_bundle()
        return MODEL_BUNDLE
    except Exception as e:
        raise RuntimeError(f"Could not load ML model bundle: {e}")

def normalize_lead_dict(raw_data: Dict[str, Any], preprocessor) -> Dict[str, Any]:
    """
    Normalizes input feature dictionary to match the exact feature names expected by the ColumnTransformer.
    """
    normalized = {}

    # 1. Map known CRM aliases
    for key, value in raw_data.items():
        lower_key = key.lower().replace(" ", "_").replace("-", "_")
        if key in CRM_TO_MODEL_FEATURE_MAP:
            normalized[CRM_TO_MODEL_FEATURE_MAP[key]] = value
        elif lower_key in CRM_TO_MODEL_FEATURE_MAP:
            normalized[CRM_TO_MODEL_FEATURE_MAP[lower_key]] = value
        else:
            normalized[key] = value

    # 2. Heuristics for CRM activity counts if provided
    if "email_open_count" in raw_data or "form_submission_count" in raw_data or "demo_request_count" in raw_data:
        total_acts = (
            raw_data.get("page_visit_count", 0)
            + raw_data.get("email_open_count", 0)
            + raw_data.get("form_submission_count", 0)
            + raw_data.get("demo_request_count", 0)
            + raw_data.get("call_count", 0)
        )
        if "TotalVisits" not in normalized or normalized["TotalVisits"] is None:
            normalized["TotalVisits"] = max(1, raw_data.get("page_visit_count", 1))
        if "Total Time Spent on Website" not in normalized or normalized["Total Time Spent on Website"] is None:
            normalized["Total Time Spent on Website"] = raw_data.get("time_spent", total_acts * 45)

        if raw_data.get("demo_request_count", 0) > 0:
            normalized["Last Activity"] = "SMS Sent"
        elif raw_data.get("email_open_count", 0) > 0:
            normalized["Last Activity"] = "Email Opened"

    # 3. Ensure all expected feature columns exist
    if hasattr(preprocessor, "feature_names_in_"):
        for expected_col in preprocessor.feature_names_in_:
            if expected_col not in normalized:
                normalized[expected_col] = None

    return normalized

def predict_single_lead(lead_data: Dict[str, Any]) -> Dict[str, Any]:
    bundle = load_model_bundle()
    preproc = bundle.get("preprocessor")
    model = bundle.get("model")
    model_name = bundle.get("model_name", "XGBoost")

    normalized_data = normalize_lead_dict(lead_data, preproc)
    lead_df = pd.DataFrame([normalized_data])

    if hasattr(preproc, "feature_names_in_"):
        lead_df = lead_df[preproc.feature_names_in_]

    if preproc is not None:
        X_processed = preproc.transform(lead_df)
        probabilities = model.predict_proba(X_processed)[:, 1]
    else:
        probabilities = model.predict_proba(lead_df)[:, 1]

    prob = float(probabilities[0])
    score = int(round(prob * 100))

    if score >= 80:
        temperature = "HOT"
    elif score >= 50:
        temperature = "WARM"
    else:
        temperature = "COLD"

    return {
        "success": True,
        "conversion_probability": round(prob, 4),
        "lead_score": score,
        "temperature": temperature,
        "model": model_name
    }

def predict_batch_leads(leads_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    bundle = load_model_bundle()
    preproc = bundle.get("preprocessor")
    model = bundle.get("model")
    model_name = bundle.get("model_name", "XGBoost")

    normalized_list = [normalize_lead_dict(l, preproc) for l in leads_list]
    leads_df = pd.DataFrame(normalized_list)

    if hasattr(preproc, "feature_names_in_"):
        for col in preproc.feature_names_in_:
            if col not in leads_df.columns:
                leads_df[col] = None
        leads_df = leads_df[preproc.feature_names_in_]

    if preproc is not None:
        X_processed = preproc.transform(leads_df)
        probabilities = model.predict_proba(X_processed)[:, 1]
    else:
        probabilities = model.predict_proba(leads_df)[:, 1]

    results = []
    for prob_val in probabilities:
        prob = float(prob_val)
        score = int(round(prob * 100))
        temp = "HOT" if score >= 80 else ("WARM" if score >= 50 else "COLD")
        results.append({
            "success": True,
            "conversion_probability": round(prob, 4),
            "lead_score": score,
            "temperature": temp,
            "model": model_name
        })

    return results

