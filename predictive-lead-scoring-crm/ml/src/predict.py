import os
import joblib
import pandas as pd

def load_best_model_bundle():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.abspath(os.path.join(script_dir, '..', 'models'))
    saved_models_dir = os.path.abspath(os.path.join(script_dir, '..', 'saved_models'))

    candidates = [
        os.path.join(models_dir, 'lead_conversion_model.pkl'),
        os.path.join(models_dir, 'best_model.pkl'),
        os.path.join(saved_models_dir, 'lead_conversion_model.pkl')
    ]

    for candidate in candidates:
        if os.path.exists(candidate):
            try:
                obj = joblib.load(candidate)
                if isinstance(obj, dict) and 'model' in obj and 'preprocessor' in obj:
                    return obj
                elif hasattr(obj, 'predict_proba'):
                    return {
                        'model_name': 'XGBoost',
                        'pipeline': obj,
                        'model': obj.named_steps['model'] if hasattr(obj, 'named_steps') else obj,
                        'preprocessor': obj.named_steps['preprocessor'] if hasattr(obj, 'named_steps') else None
                    }
            except Exception as e:
                print(f"[!] Could not load {candidate}: {e}")

    # Fallback to automated pipeline execution
    from evaluate import run_pipeline
    run_pipeline()
    return joblib.load(candidates[0])

def predict_lead(lead_data, model=None):
    """
    CRM Lead Scoring Function - directly matching Colab notebook implementation.
    Accepts lead_data dict, list of dicts, or DataFrame.
    """
    bundle = None
    if model is None:
        bundle = load_best_model_bundle()
        if 'pipeline' in bundle:
            model = bundle['pipeline']

    if isinstance(lead_data, dict):
        lead_df = pd.DataFrame([lead_data])
    elif isinstance(lead_data, list):
        lead_df = pd.DataFrame(lead_data)
    elif isinstance(lead_data, pd.DataFrame):
        lead_df = lead_data
    else:
        raise ValueError("lead_data must be a dict, list of dicts, or pandas DataFrame")

    if bundle and 'preprocessor' in bundle and bundle['preprocessor'] is not None:
        preproc = bundle['preprocessor']
        cls_model = bundle['model']

        # Ensure all expected features are present in input DataFrame
        if hasattr(preproc, 'feature_names_in_'):
            for col in preproc.feature_names_in_:
                if col not in lead_df.columns:
                    lead_df[col] = None
            lead_df = lead_df[preproc.feature_names_in_]

        X_processed = preproc.transform(lead_df)
        probabilities = cls_model.predict_proba(X_processed)[:, 1]
    else:
        probabilities = model.predict_proba(lead_df)[:, 1]

    probability = float(probabilities[0])
    score = probability * 100.0

    if score >= 80.0:
        temperature = "HOT"
    elif score >= 50.0:
        temperature = "WARM"
    else:
        temperature = "COLD"

    return {
        "conversion_probability": round(probability, 4),
        "lead_score": round(score, 2),
        "temperature": temperature
    }

if __name__ == '__main__':
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.abspath(os.path.join(script_dir, '..', 'data', 'Lead Scoring.csv'))

    if os.path.exists(dataset_path):
        df_data = pd.read_csv(dataset_path)
        sample_lead = df_data.drop(columns=['Converted', 'Prospect ID', 'Lead Number', 'Lead Quality', 'Tags'], errors='ignore').iloc[0].to_dict()
    else:
        sample_lead = {
            'Lead Origin': 'Landing Page Submission',
            'Lead Source': 'Google',
            'Do Not Email': 'No',
            'Do Not Call': 'No',
            'TotalVisits': 5,
            'Total Time Spent on Website': 600,
            'Page Views Per Visit': 3.0,
            'Last Activity': 'Email Opened'
        }

    result = predict_lead(sample_lead)
    print("=" * 50)
    print("CRM LEAD SCORING RESULT")
    print("=" * 50)
    print("Conversion Probability:", result["conversion_probability"])
    print("Lead Score:", result["lead_score"])
    print("Temperature:", result["temperature"])
    print("=" * 50)

