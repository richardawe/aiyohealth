"""
Cervical Cancer Risk Prediction Algorithm
Based on the March 2021 risk assessment guidelines
"""

import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime
from fpdf import FPDF
import os

def calculate_age(dob_str):
    """Calculate age from date of birth string"""
    try:
        dob = datetime.strptime(dob_str, '%Y-%m-%d')
        today = datetime.now()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        return age
    except:
        return 0

def determine_scenario(abnormal_bleeding, abnormal_discharge, lower_abdominal_pain):
    """Determine which risk scenario applies based on primary symptoms"""
    if abnormal_bleeding and abnormal_discharge and lower_abdominal_pain:
        return 1
    elif abnormal_bleeding and abnormal_discharge and not lower_abdominal_pain:
        return 2
    elif abnormal_bleeding and not abnormal_discharge and not lower_abdominal_pain:
        return 3
    elif not abnormal_bleeding and abnormal_discharge and not lower_abdominal_pain:
        return 4
    elif not abnormal_bleeding and abnormal_discharge and lower_abdominal_pain:
        return 5
    elif abnormal_bleeding and not abnormal_discharge and lower_abdominal_pain:
        return 6
    elif not abnormal_bleeding and not abnormal_discharge and lower_abdominal_pain:
        return 7
    else:
        return 8

def calculate_base_risk(scenario, bleeding_type=None):
    """Calculate base risk percentage based on scenario"""
    if scenario == 1:
        return 95
    elif scenario == 2:
        if bleeding_type in ["post-coital", "postmenopausal"]:
            return 76
        else:
            return 50
    elif scenario == 3:
        if bleeding_type in ["post-coital", "postmenopausal"]:
            return 76
        else:
            return 50
    elif scenario == 4:
        return 40
    elif scenario == 5:
        return 45
    elif scenario == 6:
        if bleeding_type in ["post-coital", "postmenopausal"]:
            return 70
        else:
            return 50
    elif scenario == 7:
        return 30
    else:  # scenario 8
        return 0

def apply_age_modification(risk, age, scenario, bleeding_type=None, abnormal_bleeding=False, abnormal_discharge=False, lower_abdominal_pain=False):
    """Apply age-related risk modifications"""
    if age < 20:
        if scenario == 1:
            return risk  # Let scenario 1 calculations play out as intended
        elif scenario == 2 and bleeding_type == "post-coital":
            return risk  # Let calculations play out for post-coital bleeding
        else:
            return min(30, 10 + 2 * sum([1 for x in [abnormal_bleeding, abnormal_discharge, lower_abdominal_pain] if x]))
    else:
        # For all other age groups, let scenarios play out as calculated
        return risk

def apply_symptom_checklist_modifiers(risk, changed_periods, painful_intercourse, weight_loss, unusual_fatigue):
    """Apply modifiers based on additional symptoms"""
    if changed_periods:
        risk += 2
    
    if painful_intercourse:  # Dyspareunia
        risk += 5
    
    # Special case for weight loss and fatigue
    if weight_loss and unusual_fatigue:
        risk += 20
    else:
        if weight_loss:
            risk += 5
        if unusual_fatigue:
            risk += 5
    
    return min(risk, 99)

def apply_risk_factor_modifiers(risk, sexual_partners, smoking_status, cigarettes_per_day,
                             marital_status, contraceptive_use_years, first_intercourse_age,
                             abnormal_pap, parity, hiv_status):
    """Apply modifiers based on risk factors"""
    
    # Sexual partners
    if sexual_partners == "1-3":
        risk += 2
    elif sexual_partners == "4-7":
        risk += 5
    elif sexual_partners == ">8":
        risk += 10
    
    # Smoking
    if smoking_status == "Current":
        if cigarettes_per_day == "1-9":
            risk += 5
        elif cigarettes_per_day == "10-19":
            risk += 10
        elif cigarettes_per_day == ">20":
            risk += 15
    
    # Marital Status
    if marital_status in ["Single", "Divorced"]:
        risk += 2
    
    # Oral contraceptive use
    if contraceptive_use_years == "5-9 years":
        risk += 5
    elif contraceptive_use_years == ">10 years":
        risk += 10
    
    # Age at first intercourse
    if first_intercourse_age == "<16 years":
        risk += 10
    elif first_intercourse_age == "17-20 years":
        risk += 5
    elif first_intercourse_age == ">21 years":
        risk += 2
    
    # Previous abnormal pap smear
    if abnormal_pap:
        risk += 50
    
    # Parity
    if parity == ">5 children":
        risk += 5
    
    # HIV status
    if hiv_status == "Positive":
        risk = min(99, risk + (risk * 0.5))
    
    return min(risk, 99)

def get_risk_category(risk_percentage):
    """Categorize risk as Low, Medium, or High"""
    if risk_percentage < 40:
        return "Low Risk"
    elif risk_percentage < 65:
        return "Medium Risk" 
    else:
        return "High Risk"

def get_recommendation(risk_category):
    """Provide recommendation based on risk category"""
    if risk_category == "High Risk":
        return "Please consult a doctor within 1 week."
    elif risk_category == "Medium Risk":
        return "Consider scheduling a doctor's appointment for further evaluation."
    else:  # Low Risk
        return "Routine pap smear in 2 years is recommended."

# Streamlit UI
def main():
    st.title("Cervical Cancer Risk Assessment Tool")
    st.write("Based on the March 2021 risk assessment guidelines")
    
    # Create a unique session ID
    if 'session_id' not in st.session_state:
        st.session_state.session_id = np.random.randint(10000, 99999)
    
    # Demographics section
    st.header("Demographic Information")
    col1, col2 = st.columns(2)
    
    with col1:
        full_name = st.text_input("Full Name (including middle initial)")
        dob = st.date_input("Date of Birth", min_value=datetime(1900, 1, 1), max_value=datetime.now())
        age = calculate_age(dob.strftime('%Y-%m-%d'))
        st.write(f"Age: {age}")
    
    with col2:
        address = st.text_input("Address")
        ethnicity = st.selectbox("Ethnicity", 
                               ["", "Asian", "Black", "Hispanic", "White", "Other"])
    
    st.write(f"Unique ID: {st.session_state.session_id}")
    
    # Primary symptoms
    st.header("Primary Symptoms")
    abnormal_bleeding = st.checkbox("Do you have abnormal vaginal bleeding?")
    
    bleeding_type = None
    if abnormal_bleeding:
        bleeding_type = st.selectbox("What type of abnormal bleeding?", 
                                  ["", "intermenstrual", "post-coital", "heavier periods", "postmenopausal"])
    
    abnormal_discharge = st.checkbox("Do you have abnormal vaginal discharge?")
    lower_abdominal_pain = st.checkbox("Do you have lower abdominal pain?")
    
    # Additional symptoms
    st.header("Additional Symptoms")
    painful_intercourse = st.checkbox("Is sexual intercourse painful for you?")
    
    if age < 50:  # Assuming postmenopausal age is around 50
        changed_periods = st.checkbox("Are you experiencing a change in your menstrual periods?")
    else:
        changed_periods = False
        st.write("(Postmenopausal - period change question skipped)")
    
    weight_loss = st.checkbox("Are you having unexplained weight loss?")
    unusual_fatigue = st.checkbox("Are you experiencing unusual fatigue?")
    
    # Risk factors
    st.header("Risk Factors")
    
    # Pregnancy
    is_pregnant = st.checkbox("Are you currently pregnant?")
    
    # Sexual history
    sexual_partners = st.selectbox("Number of sexual partners in lifetime?", 
                                ["", "0", "1-3", "4-7", ">8"])
    
    first_intercourse_age = st.selectbox("How old were you when you first had intercourse?", 
                                      ["", "<16 years", "17-20 years", ">21 years", "Not applicable"])
    
    # Contraceptive use
    contraceptive_use = st.checkbox("Do you use or have you used hormonal contraceptives?")
    contraceptive_use_years = ""
    if contraceptive_use:
        contraceptive_use_years = st.selectbox("For how long?", 
                                            ["", "<5 years", "5-9 years", ">10 years"])
    
    # Smoking
    smoking_status = st.selectbox("Do you smoke?", ["", "Never", "Current", "Previous"])
    cigarettes_per_day = ""
    if smoking_status == "Current":
        cigarettes_per_day = st.selectbox("Cigarettes per day", ["", "1-9", "10-19", ">20"])
    
    # Medical history
    had_pap_smear = st.checkbox("Have you had a pap smear, HPV test or VIA test in the past?")
    abnormal_pap = False
    if had_pap_smear:
        pap_result = st.selectbox("Was the result normal or abnormal?", ["", "Normal", "Abnormal"])
        abnormal_pap = pap_result == "Abnormal"
    
    hiv_status = st.selectbox("What is your HIV status?", ["", "Negative", "Positive", "Unknown"])
    
    parity = st.selectbox("How many children have you given birth to?", 
                        ["", "<5 children", ">5 children"])
    
    marital_status = st.selectbox("What is your marital status?", 
                               ["", "Single", "Married", "Divorced"])
    
    # Calculate risk
    if st.button("Calculate Risk"):
        if not age:
            st.error("Please enter your date of birth")
        elif not (abnormal_bleeding or abnormal_discharge or lower_abdominal_pain):
            st.warning("Please indicate at least one primary symptom to assess risk")
        else:
            # Determine scenario
            scenario = determine_scenario(abnormal_bleeding, abnormal_discharge, lower_abdominal_pain)
            
            # Calculate base risk
            base_risk = calculate_base_risk(scenario, bleeding_type)
            
            # Apply age modification
            risk = apply_age_modification(base_risk, age, scenario, bleeding_type, abnormal_bleeding, abnormal_discharge, lower_abdominal_pain)
            
            # Apply primary symptom modifiers (2% per symptom)
            symptom_count = sum([abnormal_bleeding, abnormal_discharge, lower_abdominal_pain])
            risk = min(99, risk + (2 * symptom_count))
            
            # Apply symptom checklist modifiers
            risk = apply_symptom_checklist_modifiers(risk, changed_periods, painful_intercourse, 
                                                  weight_loss, unusual_fatigue)
            
            # Apply risk factor modifiers
            risk = apply_risk_factor_modifiers(risk, sexual_partners, smoking_status, cigarettes_per_day,
                                           marital_status, contraceptive_use_years, first_intercourse_age,
                                           abnormal_pap, parity, hiv_status)
            
            # Get risk category
            risk_category = get_risk_category(risk)
            recommendation = get_recommendation(risk_category)
            
            # Display results
            st.header("Risk Assessment Results")
            st.subheader(f"Risk Percentage: {risk:.1f}%")
            st.subheader(f"Risk Category: {risk_category}")
            st.subheader(f"Recommendation: {recommendation}")
            
            # Warning message
            st.warning("This tool is for informational purposes only and does not replace medical advice. " +
                     "Please consult with a healthcare provider for proper diagnosis and treatment.")
            
            # Generate report option
            if st.button("Generate PDF Report"):
                try:
                    # Create a PDF instance
                    pdf = FPDF()
                    pdf.add_page()
                    pdf.set_font("Arial", size=12)

                    # Add content to the PDF
                    pdf.cell(200, 10, txt="Cervical Cancer Risk Assessment Report", ln=True, align='C')
                    pdf.ln(10)
                    pdf.cell(200, 10, txt=f"Full Name: {full_name}", ln=True)
                    pdf.cell(200, 10, txt=f"Age: {age}", ln=True)
                    pdf.cell(200, 10, txt=f"Risk Percentage: {risk:.1f}%", ln=True)
                    pdf.cell(200, 10, txt=f"Risk Category: {risk_category}", ln=True)
                    pdf.cell(200, 10, txt=f"Recommendation: {recommendation}", ln=True)

                    # Save the PDF to a temporary file
                    pdf_path = os.path.join(os.getcwd(), "Risk_Assessment_Report.pdf")
                    pdf.output(pdf_path)

                    # Provide a download link
                    with open(pdf_path, "rb") as pdf_file:
                        st.download_button(
                            label="Download Report",
                            data=pdf_file,
                            file_name="Risk_Assessment_Report.pdf",
                            mime="application/pdf"
                        )
                except Exception as e:
                    st.error(f"An error occurred while generating the report: {e}")

if __name__ == "__main__":
    main()