import os
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

TARGET = "Converted"

DROP_COLUMNS = [
    "Converted",
    "Prospect ID",
    "Lead Number",
    "Lead Quality",
    "Tags"
]

def load_dataset(data_path: str = None) -> pd.DataFrame:
    if data_path and os.path.exists(data_path):
        return pd.read_csv(data_path)

    script_dir = os.path.dirname(os.path.abspath(__file__))
    candidates = [
        os.path.abspath(os.path.join(script_dir, '..', 'data', 'Lead Scoring.csv')),
        os.path.abspath(os.path.join(script_dir, '..', 'data', 'lead_scoring_dataset.csv')),
        'Lead Scoring.csv'
    ]

    for candidate in candidates:
        if os.path.exists(candidate):
            return pd.read_csv(candidate)

    raise FileNotFoundError("Could not find dataset 'Lead Scoring.csv'. Please place it in ml/data/")

def get_preprocessor(X: pd.DataFrame):
    numeric_features = X.select_dtypes(
        include=["int64", "float64", "int32", "float32"]
    ).columns.tolist()

    categorical_features = X.select_dtypes(
        include=["object", "category", "bool"]
    ).columns.tolist()

    numeric_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler())
        ]
    )

    categorical_transformer = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("encoder", OneHotEncoder(handle_unknown="ignore"))
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("numeric", numeric_transformer, numeric_features),
            ("categorical", categorical_transformer, categorical_features)
        ]
    )

    return preprocessor, numeric_features, categorical_features

def prepare_data(df: pd.DataFrame = None):
    if df is None:
        df = load_dataset()

    actual_drop = [col for col in DROP_COLUMNS if col in df.columns]
    X = df.drop(columns=actual_drop)
    y = df[TARGET]

    preprocessor, numeric_features, categorical_features = get_preprocessor(X)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    return {
        'X': X,
        'y': y,
        'X_train': X_train,
        'X_test': X_test,
        'y_train': y_train,
        'y_test': y_test,
        'preprocessor': preprocessor,
        'numeric_features': numeric_features,
        'categorical_features': categorical_features,
        'dropped_columns': actual_drop
    }

