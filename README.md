# AI-Powered Lead Conversion & Sales Intelligence System

An intelligent CRM and sales analytics platform that uses **Machine Learning** to predict the probability of lead conversion and helps sales representatives prioritize high-potential leads.

The system combines **Laravel CRM**, **Machine Learning**, **Redis**, **Laravel Horizon**, and a **Filament/Nova dashboard** to automate lead scoring and improve sales decision-making. The ML component has been prototyped end-to-end in a Google Colab notebook (`Lead_Conversion_Prediction.ipynb`) and is summarized below.

---

## Project Overview

Traditional CRM systems store lead information but often require sales teams to manually determine which leads deserve immediate attention.

This project solves that problem by analyzing lead information and user behavior such as:

* Email opens
* Website visits
* Page views
* Form submissions
* Demo requests
* Previous interactions
* Lead source
* Recent activity

Machine Learning models analyze these features and generate a **conversion probability score** for each lead.

Based on the score, leads can be categorized as:

* **Hot Lead** — High conversion probability
* **Warm Lead** — Medium conversion probability
* **Cold Lead** — Low conversion probability

Sales representatives can then prioritize Hot Leads first.

---

## Objectives

The main objectives of this project are:

1. Predict whether a sales lead is likely to convert.
2. Generate a conversion probability score.
3. Track lead behavior and interactions.
4. Automatically update lead scores.
5. Provide a centralized CRM platform.
6. Help sales representatives prioritize high-potential leads.
7. Reduce manual lead analysis.
8. Improve sales team efficiency.

---

## Dataset

The model was trained on the **Lead Scoring** dataset (`Lead Scoring.csv`), a real-world lead-generation dataset from an online education company (X Education).

| Property | Value |
|---|---|
| Rows | 9,240 |
| Columns | 37 |
| Target column | `Converted` (1 = converted, 0 = not converted) |
| Overall conversion rate | **38.54%** |
| Duplicate rows | 0 |

**Class balance**

| Class | Count | % |
|---|---|---|
| Not Converted (0) | 5,679 | 61.46% |
| Converted (1) | 3,561 | 38.54% |

Several columns had "Select" / "Not Specified" placeholder values that were standardized to proper missing values (`NaN`) before training, and columns with high missingness or leakage risk (`Prospect ID`, `Lead Number`, `Lead Quality`, `Tags`) were dropped prior to modeling.

---

## Exploratory Data Analysis

### Conversion Distribution

<img width="626" height="470" alt="conversion_distribution" src="https://github.com/user-attachments/assets/3b38e2c7-bfb6-4a7f-b0ba-df77cdcf038e" />


### Feature Correlation Heatmap

<img width="1223" height="1023" alt="correlation_heatmap" src="https://github.com/user-attachments/assets/5415ebbe-88e1-4cd2-bd68-94dae6072789" />


### Conversion Rate by Lead Source

Top-converting lead sources in the dataset:

| Lead Source | Conversion Rate |
|---|---|
| Live Chat | 100.00% |
| WeLearn | 100.00% |
| NC_EDM | 100.00% |
| Welingak Website | 98.59% |
| Reference | 91.76% |
| Click2call | 75.00% |
| Social Media | 50.00% |
| Google | 39.99% |
| Organic Search | 37.78% |
| Direct Traffic | 32.17% |

<img width="876" height="560" alt="conversion_by_lead_source" src="https://github.com/user-attachments/assets/334b3b9e-e28a-4a83-b1da-8393ae51d9c6" />


---

## Machine Learning

This project is formulated as a **Supervised Binary Classification** problem.

### Target

```text
1 → Lead converted
0 → Lead did not convert
```

### Feature Engineering & Preprocessing

* **Numeric features** (imputed with median, then standardized): `TotalVisits`, `Total Time Spent on Website`, `Page Views Per Visit`, `Asymmetrique Activity Score`, `Asymmetrique Profile Score`
* **Categorical features** (imputed with most-frequent value, then one-hot encoded): `Lead Origin`, `Lead Source`, `Do Not Email`, `Do Not Call`, `Last Activity`, `Country`, `Specialization`, `City`, and 19 other categorical columns
* Preprocessing is implemented with a scikit-learn `ColumnTransformer` + `Pipeline`, so it is applied consistently at both training and inference time
* **Train/Test split:** 80% / 20%, stratified on the target (7,392 training rows, 1,848 test rows)
* Final feature matrix after one-hot encoding: **167 engineered features**

### Machine Learning Models

Three classification algorithms were trained and compared:

| Model | Purpose |
|---|---|
| Logistic Regression | Baseline and interpretable classification (`class_weight="balanced"`) |
| Random Forest | Handles nonlinear relationships and feature interactions (300 trees) |
| XGBoost | High-performance gradient boosting model (400 trees, `scale_pos_weight` tuned for class imbalance) |

### Model Results

Evaluated on the held-out test set (1,848 leads):

| Model | Accuracy | Precision (Converted) | Recall (Converted) | F1-Score (Converted) |
|---|---|---|---|---|
| Logistic Regression | 0.82 | 0.74 | 0.81 | 0.77 |
| Random Forest | 0.82 | 0.75 | 0.81 | 0.78 |
| **XGBoost** | **0.83** | **0.76** | **0.83** | **0.80** |

**XGBoost was selected as the best-performing / production model**, with a **ROC-AUC of 0.9086**.

<img width="1001" height="547" alt="model_comparison" src="https://github.com/user-attachments/assets/8c15d16f-6d2e-4099-bca8-14ac03d6ff75" />


### Example Prediction (from the notebook)

Running the saved XGBoost model on a held-out test lead:

```text
==================================================
       LEAD CONVERSION PREDICTION
==================================================
Conversion Probability : 0.8634
Lead Score              : 86.34
Lead Temperature        : HOT
Predicted Class         : 1
==================================================
```

A reusable `predict_lead(lead_data, model)` helper function was also built in the notebook so any lead (as a dictionary of raw feature values) can be scored and classified into HOT / WARM / COLD directly.

Example:

```text
Email Opens       → 8
Page Visits       → 15
Form Submissions  → 2
Demo Request      → Yes
Last Activity     → 1 day ago

             ↓

      ML Prediction

             ↓

Conversion Probability → 87%
Lead Classification    → HOT
```

### Model Artifacts

The notebook saves the following artifacts (used by the prediction API in production):

```text
saved_models/
├── lead_conversion_model.pkl     # Full sklearn Pipeline (preprocessing + XGBoost)
└── model_metadata.json           # Model name, target, feature lists, ROC-AUC
```

---

## System Architecture

```text
                    ┌──────────────────────┐
                    │    Sales Rep/User    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Filament / Nova      │
                    │ Sales Dashboard      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Laravel CRM Backend  │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
        MySQL Database    Activity Tracking   API
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Laravel Scheduler    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Redis Queue          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Laravel Horizon      │
                    │ Queue Workers        │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ ML Prediction API    │
                    │ Python               │
                    │ LR / RF / XGBoost    │
                    └──────────┬───────────┘
                               │
                               ▼
                    Conversion Probability
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Update Lead Score    │
                    └──────────┬───────────┘
                               │
                               ▼
                    Sales Dashboard
```

---

## Technology Stack

### Backend / CRM

* PHP
* Laravel
* Laravel Scheduler
* Laravel Queue
* Laravel Horizon
* REST API

### Admin Dashboard

* Filament or Laravel Nova
* Blade / Livewire

### Database

* MySQL

### Queue & Background Processing

* Redis
* Laravel Horizon

### Machine Learning

* Python
* pandas
* NumPy
* scikit-learn
* XGBoost
* Matplotlib / Seaborn (EDA & result visualization)
* Google Colab (model development/training environment)

### ML API

* FastAPI or Flask

### Development Tools

* Git
* GitHub
* Composer
* npm
* Python virtual environment

---

## System Workflow

### Step 1 — Lead Creation

A new lead enters the CRM through a website form, campaign, sales representative, or other source.

```text
New Lead
   ↓
Laravel CRM
   ↓
Database
```

### Step 2 — Activity Tracking

The system records lead activities.

```text
Email Open
Page Visit
Form Submission
Demo Request
   ↓
Activity Database
```

### Step 3 — Feature Preparation

Recent lead information and behavioral activities are converted into ML features (numeric scaling + categorical one-hot encoding, matching the preprocessing pipeline used during training).

### Step 4 — ML Prediction

The trained XGBoost model calculates the probability that the lead will convert.

```text
Lead Features
     ↓
ML Model (XGBoost, ROC-AUC 0.91)
     ↓
Conversion Probability
```

### Step 5 — Lead Scoring

The probability is converted into a lead score.

Example:

```text
92% → HOT
78% → WARM
35% → COLD
```

### Step 6 — Dashboard

The updated score is displayed in the sales dashboard.

### Step 7 — Sales Prioritization

Sales representatives focus their efforts on high-potential leads first.

---

## Redis & Laravel Horizon

Lead scoring can be computationally expensive when many leads need to be processed.

Instead of processing everything synchronously, Laravel can create background jobs.

```text
Laravel Scheduler
       ↓
Create Scoring Jobs
       ↓
Redis Queue
       ↓
Laravel Horizon
       ↓
Queue Worker
       ↓
ML Prediction
       ↓
Update Database
```

This allows the CRM application to remain responsive while scoring jobs are processed in the background.

---

## Sales Pipeline

The CRM can organize leads into different sales stages:

```text
New
 ↓
Contacted
 ↓
Qualified
 ↓
Proposal
 ↓
Negotiation
 ↓
Won / Lost
```

The ML score provides an additional signal for deciding which leads should receive attention first.

---

## Example Dashboard

```text
╔════════════════════════════════════════════╗
║        SALES INTELLIGENCE DASHBOARD       ║
╠════════════════════════════════════════════╣
║                                            ║
║ Total Leads       : 1,250                  ║
║ Hot Leads         : 180                    ║
║ Warm Leads        : 420                    ║
║ Cold Leads        : 650                    ║
║                                            ║
╠════════════════════════════════════════════╣
║ Lead       Company       Score    Status   ║
╠════════════════════════════════════════════╣
║ John       ABC Ltd.      94%      HOT      ║
║ Sarah      XYZ Corp.     87%      HOT      ║
║ David      Tech Ltd.     64%      WARM     ║
║ Mike       Demo Inc.     21%      COLD     ║
╚════════════════════════════════════════════╝
```

---

## Suggested Database Structure

### `users`

Stores system users and sales representatives.

### `leads`

Stores potential customer information.

```text
id
name
email
phone
company
source
status
pipeline_stage_id
created_at
updated_at
```

### `lead_activities`

Stores behavioral interactions.

```text
id
lead_id
activity_type
metadata
occurred_at
```

### `lead_scores`

Stores ML predictions.

```text
id
lead_id
model_version
probability
score
classification
scored_at
```

### `pipeline_stages`

Stores sales pipeline stages.

```text
id
name
position
```

---

## Suggested Project Structure

```text
ai-powered-lead-conversion-sales-intelligence/
│
├── backend/
│   └── Laravel CRM
│
├── ml/
│   ├── data/
│   │   └── Lead Scoring.csv
│   ├── notebooks/
│   │   └── Lead_Conversion_Prediction.ipynb
│   ├── preprocessing/
│   ├── training/
│   ├── models/
│   │   └── saved_models/
│   │       ├── lead_conversion_model.pkl
│   │       └── model_metadata.json
│   └── prediction_api/
│
├── docs/
│   ├── architecture/
│   ├── database/
│   └── screenshots/
│       ├── conversion_distribution.png
│       ├── correlation_heatmap.png
│       ├── conversion_by_lead_source.png
│       └── model_comparison.png
│
├── README.md
├── .gitignore
└── docker-compose.yml
```

---

## Example ML Prediction API

Laravel can send lead features to the ML service:

```json
{
  "email_opens": 8,
  "email_clicks": 4,
  "page_visits": 15,
  "form_submissions": 2,
  "demo_requested": 1,
  "days_since_last_activity": 1
}
```

The ML service can return:

```json
{
  "conversion_probability": 0.87,
  "score": 87,
  "classification": "HOT"
}
```

Laravel then stores this prediction in the `lead_scores` table.

---

##  Security Considerations

The system should implement:

* Authentication
* Role-based access control
* Input validation
* API authentication
* CSRF protection
* Secure password hashing
* Environment variables for credentials
* Database access controls
* Protection of customer/lead information

Sensitive configuration should never be committed to GitHub.

```text
.env
```

should be included in `.gitignore`.

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/ai-powered-lead-conversion-sales-intelligence.git
cd ai-powered-lead-conversion-sales-intelligence
```

### 2. Install Laravel dependencies

```bash
composer install
```

### 3. Configure environment

```bash
cp .env.example .env
```

Configure your database, Redis, and other environment variables.

### 4. Generate Laravel application key

```bash
php artisan key:generate
```

### 5. Run migrations

```bash
php artisan migrate
```

### 6. Install frontend dependencies

```bash
npm install
npm run build
```

### 7. Start Laravel

```bash
php artisan serve
```

### 8. Start Redis

Make sure Redis is running on your system or through Docker.

### 9. Start Laravel Horizon

```bash
php artisan horizon
```

### 10. Start the ML API

Example:

```bash
cd ml/prediction_api
python -m venv venv
```

Activate the virtual environment and install dependencies:

```bash
pip install -r requirements.txt
```

Then start the API according to the selected framework.

### 11. (Optional) Retrain the model

Open `ml/notebooks/Lead_Conversion_Prediction.ipynb` in Google Colab or Jupyter, upload `Lead Scoring.csv`, and run all cells. This will:

1. Load and clean the dataset
2. Run EDA (distribution, correlation, conversion-by-source charts)
3. Train Logistic Regression, Random Forest, and XGBoost
4. Compare models on Accuracy / Precision / Recall / F1 / ROC-AUC
5. Save the best model (`lead_conversion_model.pkl`) and its metadata

---

## Model Training Workflow

```text
Historical Lead Data (Lead Scoring.csv — 9,240 rows)
        ↓
Data Cleaning (duplicates, "Select"/"Not Specified" → NaN)
        ↓
Feature Engineering (drop leakage columns, impute, scale, one-hot encode → 167 features)
        ↓
Train/Test Split (80/20, stratified)
        ↓
Model Training
        ↓
Logistic Regression   →  Acc 0.82 | ROC-AUC —
Random Forest         →  Acc 0.82 | ROC-AUC —
XGBoost               →  Acc 0.83 | ROC-AUC 0.9086
        ↓
Model Evaluation (classification report + comparison chart)
        ↓
Best Model Selection → XGBoost
        ↓
Save Model (lead_conversion_model.pkl + model_metadata.json)
        ↓
Prediction API (predict_lead() → probability, score, HOT/WARM/COLD)
```

---

## Expected Benefits

### For Sales Representatives

* Quickly identify high-value leads
* Reduce time spent on low-potential leads
* Prioritize follow-ups
* Make data-driven decisions

### For Management

* Better visibility into sales pipeline
* Improved lead conversion analysis
* Automated scoring
* Centralized CRM data
* Scalable sales operations

---

## Future Improvements

Possible future features include:

* Real-time lead scoring
* Explainable AI / feature importance dashboards (SHAP values for the XGBoost model)
* Lead conversion trend analytics
* Automated follow-up recommendations
* Email response prediction
* Sales forecasting
* Customer lifetime value prediction
* Model monitoring and drift detection
* Automatic model retraining
* A/B testing for sales campaigns
* AI-generated sales recommendations
* Hyperparameter tuning (GridSearch/Optuna) to push ROC-AUC beyond 0.91

---

## Target Users

* Sales Representatives
* Sales Managers
* CRM Administrators
* Business Development Teams
* Marketing Teams

---

## Project Status

**Development**

The ML model has been trained and validated in Colab (XGBoost, ROC-AUC 0.9086). The Laravel CRM, dashboard, and production prediction API integration are still under development. Features and architecture may evolve as the system is implemented and tested.

---

## License

This project is developed for educational and academic purposes.

---

## Author

**Your Name**

GitHub: `https://github.com/Sakin542`

---

## Project Summary

> **AI-Powered Lead Conversion & Sales Intelligence System** combines Machine Learning and CRM automation to predict lead conversion probability, automatically score leads, and help sales representatives prioritize the most promising opportunities. The current XGBoost model achieves **83% accuracy** and a **0.91 ROC-AUC** on held-out lead data.
