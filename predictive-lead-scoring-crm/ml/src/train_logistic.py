from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression

def train_logistic_regression(preprocessor, X_train, y_train):
    """
    Trains Logistic Regression Classifier matching Colab notebook configuration.
    """
    model_pipeline = Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                LogisticRegression(
                    max_iter=2000,
                    class_weight="balanced",
                    random_state=42
                )
            )
        ]
    )
    model_pipeline.fit(X_train, y_train)
    return model_pipeline

