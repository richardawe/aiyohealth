import pandas as pd
import datetime
from app import calculate_risk_and_recommendations

def calculate_age(dob_str):
    """Calculate age from a date of birth string in format YYYY-MM-DD"""
    today = datetime.date(2025, 5, 19)  # Current date used in the simulation
    dob = datetime.datetime.strptime(dob_str, "%Y-%m-%d").date()
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

def test_model():
    # Test Case 1: High Risk (Scenario 6 equivalent - abnormal bleeding and lower abdominal pain)
    case1 = {
        "dob": "1980-01-01",  # Age 45
        "age": 45,  # Explicit age parameter
        "abnormal_vaginal_bleeding": "yes",
        "bleeding_type": "post-coital",
        "is_post_coital_or_post_menopausal": "yes",
        "abnormal_vaginal_discharge": "no",
        "lower_abdominal_pain": "yes",
        "change_in_periods": "yes",
        "dyspareunia": "yes",  # painful intercourse
        "weight_loss": "yes",
        "unusual_fatigue": "yes",
        "hiv_positive": "yes",
        "sexual_partners": "4-7",
        "smoking": "10-19/day",
        "marital_status": "single",
        "oral_contraceptive_use": "5-9 years",
        "age_first_intercourse": "17-20 years",
        "abnormal_pap_smear": "yes",
        "parity": 6,
        "high_parity": "yes"
    }
    result1 = calculate_risk_and_recommendations(case1)
    print("Test Case 1 (High Risk - Scenario 6):")
    print(f"Risk Score: {result1['risk_score']}%")
    print(f"Risk Category: {result1['risk_category']}")
    print(f"Predefined Recommendations: {result1.get('predefined_recommendations', '')[:100]}...")
    print(f"Personalized Recommendations: {result1.get('personalized_recommendations', '')}")
    
    # Expected calculations breakdown:
    expected1 = """
    Expected calculation for Case 1:
    - Base scenario 6: 70% (abnormal bleeding is post-coital with lower abdominal pain)
    - Additional symptoms: +2% (change in periods)
    - Additional symptoms: +5% (dyspareunia) 
    - Weight loss and unusual fatigue: +20%
    - Sexual partners (4-7): +5%
    - Smoking (10-19/day): +10%
    - Marital status (single): +2%
    - Oral contraceptive use (5-9 years): +5%
    - Age at first intercourse (17-20 years): +5%
    - Abnormal pap smear: +50%
    - High parity (>=5 children): +5%
    - HIV positive: +50% of current risk (capped at 99%)
    Total expected: 99% (capped)
    """
    print(expected1)
    print()

    # Test Case 2: Medium Risk (Scenario 7 - only lower abdominal pain)
    case2 = {
        "dob": "2005-01-01",  # Age 20
        "age": 20,
        "abnormal_vaginal_bleeding": "no",
        "bleeding_type": "",
        "is_post_coital_or_post_menopausal": "no",
        "abnormal_vaginal_discharge": "no",
        "lower_abdominal_pain": "yes",
        "change_in_periods": "yes",
        "dyspareunia": "yes",
        "weight_loss": "no",
        "unusual_fatigue": "no",
        "hiv_positive": "no",
        "sexual_partners": "1-3",
        "smoking": "non-smoker",
        "marital_status": "married",
        "oral_contraceptive_use": "<5 years",
        "age_first_intercourse": ">21 years",
        "abnormal_pap_smear": "no",
        "parity": 0,
        "high_parity": "no"
    }
    result2 = calculate_risk_and_recommendations(case2)
    print("Test Case 2 (Medium Risk - Scenario 7 with age modification):")
    print(f"Risk Score: {result2['risk_score']}%")
    print(f"Risk Category: {result2['risk_category']}")
    print(f"Predefined Recommendations: {result2.get('predefined_recommendations', '')[:100]}...")
    print(f"Personalized Recommendations: {result2.get('personalized_recommendations', '')}")
    
    # Expected calculations breakdown
    expected2 = """
    Expected calculation for Case 2:
    - Base scenario 7 for age <20: 10% (age modification applied)
    - Additional symptoms: +2% (change in periods)
    - Additional symptoms: +5% (dyspareunia)
    - Sexual partners (1-3): +2%
    - Age at first intercourse (>21 years): +2%
    Total expected: 21% (capped at 30% for age <20)
    """
    print(expected2)
    print()

    # Test Case 3: Low Risk (Scenario 8 - no primary symptoms)
    case3 = {
        "dob": "1990-01-01",  # Age 35
        "age": 35,
        "abnormal_vaginal_bleeding": "no",
        "bleeding_type": "",
        "is_post_coital_or_post_menopausal": "no",
        "abnormal_vaginal_discharge": "no",
        "lower_abdominal_pain": "no",
        "change_in_periods": "no",
        "dyspareunia": "no",
        "weight_loss": "no",
        "unusual_fatigue": "no",
        "hiv_positive": "no",
        "sexual_partners": "1-3",
        "smoking": "non-smoker",
        "marital_status": "married",
        "oral_contraceptive_use": "<5 years",
        "age_first_intercourse": ">21 years",
        "abnormal_pap_smear": "no",
        "parity": 2,
        "high_parity": "no"
    }
    result3 = calculate_risk_and_recommendations(case3)
    print("Test Case 3 (Low Risk - Scenario 8):")
    print(f"Risk Score: {result3['risk_score']}%")
    print(f"Risk Category: {result3['risk_category']}")
    print(f"Predefined Recommendations: {result3.get('predefined_recommendations', '')[:100]}...")
    print(f"Personalized Recommendations: {result3.get('personalized_recommendations', '')}")
    
    # Expected calculations breakdown
    expected3 = """
    Expected calculation for Case 3:
    - Base scenario 8: 0% (no primary symptoms)
    - Sexual partners (1-3): +2%
    - Age at first intercourse (>21 years): +2%
    Total expected: 4%
    """
    print(expected3)
    print()

    # Test Case 4: High Risk (Scenario 1 - all three main symptoms)
    case4 = {
        "dob": "1965-01-01",  # Age 60
        "age": 60,
        "abnormal_vaginal_bleeding": "yes",
        "bleeding_type": "post-menopausal",
        "is_post_coital_or_post_menopausal": "yes",
        "abnormal_vaginal_discharge": "yes",
        "lower_abdominal_pain": "yes",
        "change_in_periods": "yes",
        "dyspareunia": "no",
        "weight_loss": "yes",
        "unusual_fatigue": "yes",
        "hiv_positive": "no",
        "sexual_partners": ">8",
        "smoking": ">20/day",
        "marital_status": "divorced",
        "oral_contraceptive_use": ">10 years",
        "age_first_intercourse": "<16 years",
        "abnormal_pap_smear": "no",
        "parity": 3,
        "high_parity": "no"
    }
    result4 = calculate_risk_and_recommendations(case4)
    print("Test Case 4 (High Risk - Scenario 1):")
    print(f"Risk Score: {result4['risk_score']}%")
    print(f"Risk Category: {result4['risk_category']}")
    print(f"Predefined Recommendations: {result4.get('predefined_recommendations', '')[:100]}...")
    print(f"Personalized Recommendations: {result4.get('personalized_recommendations', '')}")
    
    # Expected calculations breakdown
    expected4 = """
    Expected calculation for Case 4:
    - Base scenario 1: 95% (all three main symptoms)
    - Additional symptoms: +2% (change in periods)
    - Weight loss and unusual fatigue: +20%
    - Sexual partners (>8): +10%
    - Smoking (>20/day): +15%
    - Marital status (divorced): +2%
    - Oral contraceptive use (>10 years): +10%
    - Age at first intercourse (<16 years): +10%
    Total expected: 99% (capped)
    """
    print(expected4)
    print()

if __name__ == "__main__":
    test_model()