import os
import json
import joblib
import pandas as pd
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score,
    f1_score, roc_auc_score, classification_report
)

from preprocessing import prepare_data
from train_logistic import train_logistic_regression
from train_random_forest import train_random_forest
from train_xgboost import train_xgboost

def evaluate_model(model_pipeline, X_test, y_test):
    y_pred = model_pipeline.predict(X_test)
    y_probability = model_pipeline.predict_proba(X_test)[:, 1]

    metrics = {
        'accuracy': round(accuracy_score(y_test, y_pred), 4),
        'precision': round(precision_score(y_test, y_pred, zero_division=0), 4),
        'recall': round(recall_score(y_test, y_pred, zero_division=0), 4),
        'f1_score': round(f1_score(y_test, y_pred, zero_division=0), 4),
        'roc_auc': round(roc_auc_score(y_test, y_probability), 4)
    }
    return metrics, y_pred

def run_pipeline():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.abspath(os.path.join(script_dir, '..', 'models'))
    saved_models_dir = os.path.abspath(os.path.join(script_dir, '..', 'saved_models'))
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(saved_models_dir, exist_ok=True)

    print("--- 8. Data Preprocessing & Train-Test Split ---")
    data_dict = prepare_data()

    X = data_dict['X']
    X_train = data_dict['X_train']
    X_test = data_dict['X_test']
    y_train = data_dict['y_train']
    y_test = data_dict['y_test']
    preprocessor = data_dict['preprocessor']
    numeric_features = data_dict['numeric_features']
    categorical_features = data_dict['categorical_features']
    dropped_columns = data_dict['dropped_columns']

    print(f"Training data: {X_train.shape}")
    print(f"Testing data: {X_test.shape}")

    print("\n--- Training Models ---")
    print("Training Logistic Regression...")
    logistic_model = train_logistic_regression(preprocessor, X_train, y_train)

    print("Training Random Forest...")
    rf_model = train_random_forest(preprocessor, X_train, y_train)

    print("Training XGBoost...")
    xgb_model = train_xgboost(preprocessor, X_train, y_train)

    models = {
        "Logistic Regression": logistic_model,
        "Random Forest": rf_model,
        "XGBoost": xgb_model
    }

    results = {}
    print("\n" + "=" * 60)
    print("13. MODEL EVALUATION")
    print("=" * 60)

    for name, model_pipeline in models.items():
        metrics, y_pred = evaluate_model(model_pipeline, X_test, y_test)
        results[name] = metrics

        print("\n" + "=" * 60)
        print(name)
        print("=" * 60)
        print(classification_report(
            y_test, y_pred,
            target_names=["Not Converted", "Converted"],
            zero_division=0
        ))

    print("\n--- 14. MODEL COMPARISON ---")
    comp_df = pd.DataFrame([
        {'Model': name, **m} for name, m in results.items()
    ]).sort_values(by="roc_auc", ascending=False)
    print(comp_df.to_string(index=False))

    # Production Model: XGBoost (Colab notebook selection)
    selected_name = "XGBoost"
    selected_model_pipeline = xgb_model
    selected_metrics = results["XGBoost"]

    print("\n" + "=" * 60)
    print(f"16. SAVE BEST MODEL ({selected_name})")
    print("=" * 60)

    metadata = {
        "model_name": selected_name,
        "target": "Converted",
        "feature_columns": X.columns.tolist(),
        "numeric_features": numeric_features,
        "categorical_features": categorical_features,
        "dropped_columns": dropped_columns,
        "metrics": selected_metrics,
        "roc_auc": selected_metrics["roc_auc"]
    }

    # Save model metadata
    meta_path = os.path.join(saved_models_dir, "model_metadata.json")
    with open(meta_path, "w") as f:
        json.dump(metadata, f, indent=4)
    print(f"Model metadata saved successfully to: {meta_path}")

    # Serialize pipeline bundle
    bundle = {
        'model_name': selected_name,
        'metrics': selected_metrics,
        'model': selected_model_pipeline.named_steps['model'],
        'preprocessor': selected_model_pipeline.named_steps['preprocessor'],
        'pipeline': selected_model_pipeline
    }

    model_target_path = os.path.join(models_dir, "lead_conversion_model.pkl")
    best_target_path = os.path.join(models_dir, "best_model.pkl")
    colab_target_path = os.path.join(saved_models_dir, "lead_conversion_model.pkl")

    joblib.dump(bundle, model_target_path)
    joblib.dump(bundle, best_target_path)
    joblib.dump(selected_model_pipeline, colab_target_path)

    print(f"Model saved successfully to:\n - {model_target_path}\n - {best_target_path}\n - {colab_target_path}")

    return results, selected_name

if __name__ == '__main__':
    run_pipeline()

