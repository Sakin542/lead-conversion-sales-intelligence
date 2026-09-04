from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

def train_random_forest(preprocessor, X_train, y_train):
    """
    Trains Random Forest Classifier matching Colab notebook configuration.
    """
    model_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=300,
                    max_depth=None,
                    min_samples_split=5,
                    min_samples_leaf=2,
                    class_weight="balanced",
                    random_state=42,
                    n_jobs=-1
                )
            )
        ]
    )
    model_pipeline.fit(X_train, y_train)
    return model_pipeline

