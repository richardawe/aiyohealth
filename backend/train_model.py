import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
import joblib
from sklearn.metrics import accuracy_score, mean_squared_error, classification_report, mean_absolute_error

# Load data
data = pd.read_csv("cervical_cancer_synthetic_data_20250519_171741.csv")

# Rename risk_percent to risk_score for consistency
data = data.rename(columns={'risk_percent': 'risk_score'})

# Print data information for verification
print("Dataset shape:", data.shape)
print("\nColumns in dataset:", data.columns.tolist())
print("\nSample data:")
print(data.head())

# Identify feature types
numerical_features = ['age', 'parity']
categorical_features = [
    'abnormal_vaginal_bleeding', 'abnormal_vaginal_discharge', 'lower_abdominal_pain',
    'is_post_coital_or_post_menopausal', 'change_in_periods', 'dyspareunia', 
    'weight_loss', 'unusual_fatigue', 'sexual_partners', 'smoking', 
    'marital_status', 'oral_contraceptive_use', 'age_first_intercourse', 
    'abnormal_pap_smear', 'high_parity', 'hiv_positive'
]

# Handle bleeding type separately since it can be None
data['bleeding_type'] = data['bleeding_type'].fillna('none')

# Add bleeding_type to categorical features
categorical_features.append('bleeding_type')

# Features and targets
X = data.drop(['patient_id', 'risk_score', 'risk_category'], axis=1)
y_category = data['risk_category']
y_score = data['risk_score']

# Verify feature set
print("\nFeatures used:", X.columns.tolist())
print("Target categories:", y_category.unique())
print("Risk score range:", y_score.min(), "to", y_score.max())

# Check for missing values
print("\nMissing values in features:")
print(X.isna().sum())

# Print value counts for categorical features
print("\nValue counts for selected categorical features:")
for col in ['abnormal_vaginal_bleeding', 'abnormal_vaginal_discharge', 'lower_abdominal_pain']:
    print(f"\n{col}:")
    print(X[col].value_counts())

# Print risk category distribution
print("\nRisk category distribution:")
print(y_category.value_counts())

# Create preprocessing pipeline
# For numerical features - impute missing values with mean
numerical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='mean'))
])

# For categorical features - impute missing values and then one-hot encode
categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

# Combine transformers in a column transformer
preprocessor = ColumnTransformer(
    transformers=[
        ('num', numerical_transformer, numerical_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Split data
X_train, X_test, y_category_train, y_category_test, y_score_train, y_score_test = train_test_split(
    X, y_category, y_score, test_size=0.2, random_state=42)

# Create and train classifier pipeline for risk category
clf_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42))
])

clf_pipeline.fit(X_train, y_category_train)

# Create and train regressor pipeline for risk score
reg_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', RandomForestRegressor(n_estimators=100, random_state=42))
])

reg_pipeline.fit(X_train, y_score_train)

# Evaluate models
y_category_pred = clf_pipeline.predict(X_test)
y_score_pred = reg_pipeline.predict(X_test)

print("\nClassifier Results:")
print("Accuracy:", accuracy_score(y_category_test, y_category_pred))
print("\nClassification Report:")
print(classification_report(y_category_test, y_category_pred))

print("\nRegressor Results:")
print("Mean Squared Error:", mean_squared_error(y_score_test, y_score_pred))
print("Mean Absolute Error:", mean_absolute_error(y_score_test, y_score_pred))
print("Root Mean Squared Error:", np.sqrt(mean_squared_error(y_score_test, y_score_pred)))

# Feature importance for classifier
if hasattr(clf_pipeline.named_steps['classifier'], 'feature_importances_'):
    # Get feature names after preprocessing
    cat_features = clf_pipeline.named_steps['preprocessor'].transformers_[1][1].named_steps['onehot'].get_feature_names_out(categorical_features)
    feature_names = list(numerical_features) + list(cat_features)
    
    # Get feature importances
    importances = clf_pipeline.named_steps['classifier'].feature_importances_
    
    # Handle potential length mismatch
    if len(importances) == len(feature_names):
        # Create a DataFrame for feature importances
        feature_importance_df = pd.DataFrame({
            'Feature': feature_names,
            'Importance': importances
        }).sort_values(by='Importance', ascending=False)
        
        print("\nTop 10 Features for Classification:")
        print(feature_importance_df.head(10))
    else:
        print("\nCouldn't match feature importances to feature names. Shapes:", 
              len(importances), len(feature_names))

# Save models
joblib.dump(clf_pipeline, "rf_classifier_pipeline.pkl")
joblib.dump(reg_pipeline, "rf_regressor_pipeline.pkl")

print("\nModels saved as rf_classifier_pipeline.pkl and rf_regressor_pipeline.pkl")

# Test prediction on a sample data point
sample = X_test.iloc[0:1]
print("\nSample patient data:")
print(sample)

predicted_category = clf_pipeline.predict(sample)[0]
predicted_score = reg_pipeline.predict(sample)[0]

print(f"\nPredicted risk category: {predicted_category}")
print(f"Predicted risk score: {predicted_score:.2f}")
print(f"Actual risk category: {y_category_test.iloc[0]}")
print(f"Actual risk score: {y_score_test.iloc[0]:.2f}")