import pandas as pd
import numpy as np
import random
from datetime import datetime

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Number of synthetic patients to generate
num_patients = 10000

def generate_synthetic_data():
    """
    Generate synthetic patient data based on the cervical cancer prediction algorithm.
    """
    data = []
    
    for i in range(num_patients):
        patient = {}
        
        # Generate a patient ID
        patient['patient_id'] = f'P{i+1:04d}'
        
        # Generate age (distribution skewed towards middle age)
        age_group = np.random.choice(['<20', '20-40', '40-60', '60-69', '>69'], 
                                    p=[0.05, 0.3, 0.4, 0.2, 0.05])
        if age_group == '<20':
            patient['age'] = np.random.randint(15, 20)
        elif age_group == '20-40':
            patient['age'] = np.random.randint(20, 41)
        elif age_group == '40-60':
            patient['age'] = np.random.randint(40, 61)
        elif age_group == '60-69':
            patient['age'] = np.random.randint(60, 70)
        else:
            patient['age'] = np.random.randint(70, 90)
        
        # Generate primary symptoms
        # Adjust probabilities based on age groups
        if patient['age'] < 20:
            abnormal_bleeding_prob = 0.1
            abnormal_discharge_prob = 0.2
            lower_abdominal_pain_prob = 0.3
        elif patient['age'] >= 70:
            abnormal_bleeding_prob = 0.4
            abnormal_discharge_prob = 0.3
            lower_abdominal_pain_prob = 0.4
        else:
            abnormal_bleeding_prob = 0.3
            abnormal_discharge_prob = 0.35
            lower_abdominal_pain_prob = 0.3
        
        patient['abnormal_vaginal_bleeding'] = np.random.choice([True, False], p=[abnormal_bleeding_prob, 1-abnormal_bleeding_prob])
        patient['abnormal_vaginal_discharge'] = np.random.choice([True, False], p=[abnormal_discharge_prob, 1-abnormal_discharge_prob])
        patient['lower_abdominal_pain'] = np.random.choice([True, False], p=[lower_abdominal_pain_prob, 1-lower_abdominal_pain_prob])
        
        # For patients with abnormal bleeding, specify the type
        if patient['abnormal_vaginal_bleeding']:
            bleeding_types = ['post-coital', 'post-menopausal', 'intermenstrual', 'longer periods']
            
            # Adjust probabilities based on age
            if patient['age'] < 20:
                bleeding_probs = [0.2, 0.0, 0.5, 0.3]  # Young patients unlikely to have post-menopausal bleeding
            elif patient['age'] > 50:
                bleeding_probs = [0.2, 0.6, 0.1, 0.1]  # Older patients more likely to have post-menopausal bleeding
            else:
                bleeding_probs = [0.3, 0.0, 0.4, 0.3]  # Middle-aged patients
                
            bleeding_type = np.random.choice(bleeding_types, p=bleeding_probs)
            patient['bleeding_type'] = bleeding_type
            
            # Determine if it's post-coital or post-menopausal
            patient['is_post_coital_or_post_menopausal'] = bleeding_type in ['post-coital', 'post-menopausal']
        else:
            patient['bleeding_type'] = None
            patient['is_post_coital_or_post_menopausal'] = False
            
        # Additional symptoms (checklist)
        patient['change_in_periods'] = np.random.choice([True, False], p=[0.3, 0.7])
        patient['dyspareunia'] = np.random.choice([True, False], p=[0.2, 0.8])
        patient['weight_loss'] = np.random.choice([True, False], p=[0.15, 0.85])
        patient['unusual_fatigue'] = np.random.choice([True, False], p=[0.25, 0.75])
        
        # Risk factors
        # Sexual partners
        sexual_partners_category = np.random.choice(['1-3', '4-7', '>8'], p=[0.7, 0.2, 0.1])
        patient['sexual_partners'] = sexual_partners_category
        
        # Smoking status
        smoking_category = np.random.choice(['non-smoker', '1-9/day', '10-19/day', '>20/day'], p=[0.7, 0.1, 0.1, 0.1])
        patient['smoking'] = smoking_category
        
        # Marital status
        marital_status = np.random.choice(['single', 'married', 'divorced'], p=[0.3, 0.6, 0.1])
        patient['marital_status'] = marital_status
        
        # Oral contraceptive use
        if patient['age'] < 15 or patient['age'] > 60:
            contraceptive_category = 'none'
        else:
            contraceptive_category = np.random.choice(['none', '<5 years', '5-9 years', '>10 years'], p=[0.4, 0.3, 0.2, 0.1])
        patient['oral_contraceptive_use'] = contraceptive_category
        
        # Age at first intercourse
        if patient['age'] < 16:
            first_intercourse = None  # Too young
        else:
            intercourse_category = np.random.choice(['<16 years', '17-20 years', '>21 years'], p=[0.2, 0.5, 0.3])
            patient['age_first_intercourse'] = intercourse_category
        
        # Previous abnormal pap smear
        patient['abnormal_pap_smear'] = np.random.choice([True, False], p=[0.1, 0.9])
        
        # Parity (number of children)
        if patient['age'] < 18:
            parity = 0
        elif patient['age'] < 30:
            parity = np.random.randint(0, 3)
        else:
            parity = np.random.randint(0, 8)
        patient['parity'] = parity
        patient['high_parity'] = parity > 5
        
        # HIV status
        patient['hiv_positive'] = np.random.choice([True, False], p=[0.02, 0.98])
        
        # Calculate risk based on algorithm
        risk_percent = calculate_risk(patient)
        patient['risk_percent'] = risk_percent
        
        # Determine risk category
        if risk_percent < 40:
            risk_category = 'Low risk'
        elif risk_percent < 65:
            risk_category = 'Medium risk'
        else:
            risk_category = 'High risk'
        patient['risk_category'] = risk_category
        
        data.append(patient)
    
    return pd.DataFrame(data)

def calculate_risk(patient):
    """
    Calculate the risk percentage based on the algorithm.
    """
    # Baseline risk based on scenario
    if patient['abnormal_vaginal_bleeding'] and patient['abnormal_vaginal_discharge'] and patient['lower_abdominal_pain']:
        # Scenario 1
        risk = 95.0
    elif patient['abnormal_vaginal_bleeding'] and patient['abnormal_vaginal_discharge'] and not patient['lower_abdominal_pain']:
        # Scenario 2
        if patient['is_post_coital_or_post_menopausal']:
            risk = 76.0
        else:
            risk = 50.0
    elif patient['abnormal_vaginal_bleeding'] and not patient['abnormal_vaginal_discharge'] and not patient['lower_abdominal_pain']:
        # Scenario 3
        if patient['is_post_coital_or_post_menopausal']:
            risk = 76.0
        else:
            risk = 50.0
    elif not patient['abnormal_vaginal_bleeding'] and patient['abnormal_vaginal_discharge'] and not patient['lower_abdominal_pain']:
        # Scenario 4
        risk = 40.0
    elif not patient['abnormal_vaginal_bleeding'] and patient['abnormal_vaginal_discharge'] and patient['lower_abdominal_pain']:
        # Scenario 5
        risk = 45.0
    elif patient['abnormal_vaginal_bleeding'] and not patient['abnormal_vaginal_discharge'] and patient['lower_abdominal_pain']:
        # Scenario 6
        if patient['is_post_coital_or_post_menopausal']:
            risk = 70.0
        else:
            risk = 50.0
    elif not patient['abnormal_vaginal_bleeding'] and not patient['abnormal_vaginal_discharge'] and patient['lower_abdominal_pain']:
        # Scenario 7
        risk = 30.0
    else:
        # Scenario 8
        risk = 0.0
    
    # Age effect modification
    if patient['age'] < 20:
        if risk == 95.0:  # Scenario 1
            pass  # Let scenario 1 calculations play out as intended
        elif patient['abnormal_vaginal_bleeding'] and patient['is_post_coital_or_post_menopausal']:
            pass  # Let scenario 2 calculations play out
        else:
            risk = 10.0  # Baseline risk is low for young patients
    
    # Additional symptoms modifiers (checklist - add 2%)
    if patient['change_in_periods']:
        risk += 2.0
    
    # Additional symptoms checklist (add 5%)
    if patient['dyspareunia']:
        risk += 5.0
    
    # Weight loss and fatigue
    if patient['weight_loss'] and patient['unusual_fatigue']:
        risk += 20.0  # Add 20% if both are present
    else:
        if patient['weight_loss']:
            risk += 5.0
        if patient['unusual_fatigue']:
            risk += 5.0
    
    # Risk factor modifiers
    # Sexual partners
    if patient['sexual_partners'] == '1-3':
        risk += 2.0
    elif patient['sexual_partners'] == '4-7':
        risk += 5.0
    elif patient['sexual_partners'] == '>8':
        risk += 10.0
    
    # Smoking
    if patient['smoking'] == '1-9/day':
        risk += 5.0
    elif patient['smoking'] == '10-19/day':
        risk += 10.0
    elif patient['smoking'] == '>20/day':
        risk += 15.0
    
    # Marital status
    if patient['marital_status'] in ['single', 'divorced']:
        risk += 2.0
    
    # Oral contraceptive use
    if patient['oral_contraceptive_use'] == '5-9 years':
        risk += 5.0
    elif patient['oral_contraceptive_use'] == '>10 years':
        risk += 10.0
    
    # Age at first intercourse
    if 'age_first_intercourse' in patient:
        if patient['age_first_intercourse'] == '<16 years':
            risk += 10.0
        elif patient['age_first_intercourse'] == '17-20 years':
            risk += 5.0
        elif patient['age_first_intercourse'] == '>21 years':
            risk += 2.0
    
    # Previous abnormal pap smear
    if patient['abnormal_pap_smear']:
        risk += 50.0
    
    # Parity
    if patient['high_parity']:
        risk += 5.0
    
    # HIV status
    if patient['hiv_positive']:
        risk += min(risk * 0.5, 99.0 - risk)  # Add 50% of current risk, but max out at 99%
    
    # Cap at 99%
    risk = min(risk, 99.0)
    
    # Cap at 30% for young patients (except for scenario 1 or post-coital bleeding)
    if patient['age'] < 20:
        scenario_1 = patient['abnormal_vaginal_bleeding'] and patient['abnormal_vaginal_discharge'] and patient['lower_abdominal_pain']
        post_coital_bleeding = patient['abnormal_vaginal_bleeding'] and patient['is_post_coital_or_post_menopausal']
        
        if not (scenario_1 or post_coital_bleeding):
            risk = min(risk, 30.0)
    
    return risk

# Generate the synthetic data
synthetic_data = generate_synthetic_data()

# Export to CSV
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
filename = f"cervical_cancer_synthetic_data_{timestamp}.csv"
synthetic_data.to_csv(filename, index=False)

print(f"Generated {len(synthetic_data)} synthetic patient records and saved to {filename}")

# Display summary statistics for verification
print("\nData Summary:")
print(f"Number of patients: {len(synthetic_data)}")
print(f"Age distribution: \n{synthetic_data['age'].describe()}")
print(f"\nRisk category distribution: \n{synthetic_data['risk_category'].value_counts(normalize=True).round(2)}")
print(f"\nSymptom prevalence:")
print(f"Abnormal vaginal bleeding: {synthetic_data['abnormal_vaginal_bleeding'].mean().round(2)}")
print(f"Abnormal vaginal discharge: {synthetic_data['abnormal_vaginal_discharge'].mean().round(2)}")
print(f"Lower abdominal pain: {synthetic_data['lower_abdominal_pain'].mean().round(2)}")

# Sample rows from each risk category
print("\nSample high risk patient:")
high_risk = synthetic_data[synthetic_data['risk_category'] == 'High risk'].iloc[0].to_dict()
print(high_risk)

print("\nSample medium risk patient:")
medium_risk = synthetic_data[synthetic_data['risk_category'] == 'Medium risk'].iloc[0].to_dict()
print(medium_risk)

print("\nSample low risk patient:")
low_risk = synthetic_data[synthetic_data['risk_category'] == 'Low risk'].iloc[0].to_dict()
print(low_risk)