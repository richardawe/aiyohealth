import os
from flask import Flask, request, jsonify, make_response, redirect, url_for, flash, render_template, session, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect, validate_csrf, ValidationError, ValidationError as CSRFValidationError, generate_csrf 
from werkzeug.security import generate_password_hash, check_password_hash
from flask_cors import CORS  # Import Flask-CORS
from datetime import datetime, timedelta
import secrets
from dateutil.relativedelta import relativedelta
import pdfkit 
#from weasyprint import HTML
import pandas as pd
import joblib
import numpy as np
import logging
import re
from functools import wraps
import bcrypt


app = Flask(__name__, instance_relative_config=True)



# Configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config.update(
    SQLALCHEMY_DATABASE_URI=os.getenv('DATABASE_URI', f'sqlite:///{os.path.join(app.instance_path, "aiyo.db")}'),
    SQLALCHEMY_TRACK_MODIFICATIONS=False,
    SECRET_KEY=os.getenv('FLASK_SECRET_KEY', '6trygfyjhf5f6fuihui'),  # Use env variable
    PERMANENT_SESSION_LIFETIME=timedelta(days=30),
    SESSION_COOKIE_PATH='/',      # Ensure cookie applies to all routes
    SESSION_COOKIE_DOMAIN=None,   # Explicitly set to None for local development
    SESSION_PERMANENT=True,
    WTF_CSRF_ENABLED=True,
    WTF_CSRF_CHECK_DEFAULT=False,  # Only apply CSRF to relevant routes
)

# Dynamic session cookie settings based on FLASK_ENV
if os.getenv('FLASK_ENV') == 'production':
    app.config.update(
        SESSION_COOKIE_SECURE=True,
        SESSION_COOKIE_SAMESITE='None',
        SESSION_COOKIE_DOMAIN='.inspiriasoft.com'
    )
else:
    # Development settings
    app.config.update(
        SESSION_COOKIE_SECURE=False,
        SESSION_COOKIE_SAMESITE='Lax'
    )

# Ensure instance folder exists
os.makedirs(app.instance_path, exist_ok=True)


UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure database - Railway sets DATABASE_URL automatically
database_url = os.environ.get('DATABASE_URL')
if not database_url:
    # Fallback to your specific Railway URL if DATABASE_URL isn't set
    database_url = 'postgresql://postgres:KpuuvQOPeNZcurCyOaOrEMqjQXxgokBO@postgres.railway.internal:5432/railway'

app.config['SQLALCHEMY_DATABASE_URI'] = database_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db = SQLAlchemy(app)
csrf = CSRFProtect(app)

CORS(app, resources={
    r"/api/*": {
        "origins": [
            "capacitor://localhost",      # For Capacitor mobile apps
            "capacitor://com.aiyo.app", # For your specific Android app
            "ionic://localhost",          # For Ionic specific features
            "http://localhost:5173",      # For local development
            "http://localhost:8000",      # For local development
            "http://localhost:3000",
            "http://localhost",
            "https://aiyohealth-frontend-production.up.railway.app",           # For Capacitor Android
  # Your production domain
            
        ],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "X-CSRF-Token", "X-Requested-With", "Authorization"],
        "supports_credentials": True,     # Important for session cookies
        "expose_headers": ["Set-Cookie"], # Allow cookies in responses
    }
})


# Logging setup
logging.basicConfig(level=logging.INFO, filename='app.log')
logger = logging.getLogger(__name__)

# Load machine learning models
MODEL_DIR = os.path.join(BASE_DIR, "models")
try:
    clf = joblib.load(os.path.join(MODEL_DIR, "rf_classifier_pipeline.pkl"))
    reg = joblib.load(os.path.join(MODEL_DIR, "rf_regressor_pipeline.pkl"))
    le = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))
    MODELS_AVAILABLE = True
    logger.info("Machine learning models loaded successfully")
except Exception as e:
    logger.error(f"Error loading models: {e}")
    MODELS_AVAILABLE = False

# Database models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    state = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    contact_number = db.Column(db.String(20), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    occupation = db.Column(db.String(100), nullable=False)
    has_cancer = db.Column(db.String(3), nullable=False)
    is_aware = db.Column(db.String(3), nullable=False)
    has_screening = db.Column(db.String(3), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='user')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'state': self.state,
            'city': self.city,
            'contact_number': self.contact_number,
            'email': self.email,
            'occupation': self.occupation,
            'has_cancer': self.has_cancer,
            'is_aware': self.is_aware,
            'has_screening': self.has_screening,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class PasswordResetRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(128), unique=True, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending') # pending, approved, denied
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)

    def __init__(self, user_id):
        self.user_id = user_id
        self.token = secrets.token_urlsafe(32)
        self.expires_at = datetime.utcnow() + timedelta(hours=1)


class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    resource_type = db.Column(db.String(50), nullable=False, default='pdf') # 'pdf' or 'link'
    filename = db.Column(db.String(255)) # Nullable for links
    url = db.Column(db.String(2048)) # For external links
    thumbnail = db.Column(db.String(255)) # For link thumbnails
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'))

    def to_dict(self):
        base_url = url_for('index', _external=True)
        thumbnail_url = f"{base_url}api/uploads/{self.thumbnail}" if self.thumbnail else None
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'type': self.resource_type,
            'filename': self.filename,
            'url': self.url,
            'thumbnailUrl': thumbnail_url,
            'uploaded_at': self.uploaded_at.isoformat(),
        }
        
        
class SymptomHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    dob = db.Column(db.Date, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(50), nullable=False)
    ethnicity = db.Column(db.String(100))
    ethnicity_other_input = db.Column(db.String(100))
    abnormal_bleeding = db.Column(db.String(10), nullable=False)
    bleeding_type = db.Column(db.String(50))
    post_coital_or_post_menopausal = db.Column(db.String(10))
    abnormal_discharge = db.Column(db.String(10), nullable=False)
    pelvic_pain = db.Column(db.String(10), nullable=False)
    painful_intercourse = db.Column(db.String(10), nullable=False)
    menstrual_changes = db.Column(db.String(10), nullable=False)
    weight_loss = db.Column(db.String(10), nullable=False)
    fatigue = db.Column(db.String(10), nullable=False)
    pregnant = db.Column(db.String(10), nullable=False)
    num_sexual_partners = db.Column(db.String(20), nullable=False)
    age_first_intercourse = db.Column(db.String(50), nullable=False)
    contraceptive_use = db.Column(db.String(10), nullable=False)
    contraceptive_duration = db.Column(db.String(20))
    smoking_status = db.Column(db.String(20), nullable=False)
    cigarettes_per_day = db.Column(db.String(20))
    pap_smear_history = db.Column(db.String(10), nullable=False)
    abnormal_pap_result = db.Column(db.String(10))
    hiv_status = db.Column(db.String(20), nullable=False)
    hiv_positive = db.Column(db.String(10))
    parity = db.Column(db.String(20), nullable=False)
    high_parity = db.Column(db.String(10))
    marital_status = db.Column(db.String(20), nullable=False)
    risk_score = db.Column(db.Float, nullable=False)
    risk_category = db.Column(db.String(20), nullable=False)
    scenario = db.Column(db.Text)
    predefined_recommendations = db.Column(db.Text)
    personalized_recommendations = db.Column(db.Text)
    feedback_text = db.Column(db.Text, nullable=True)
    feedback_submitted = db.Column(db.Boolean, default=False)
    logged_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'dob': self.dob.isoformat() if self.dob else None,
            'age': self.age,
            'gender': self.gender,
            'ethnicity': self.ethnicity,
            'ethnicity_other_input': self.ethnicity_other_input,
            'abnormal_bleeding': self.abnormal_bleeding,
            'bleeding_type': self.bleeding_type,
            'post_coital_or_post_menopausal': self.post_coital_or_post_menopausal,
            'abnormal_discharge': self.abnormal_discharge,
            'pelvic_pain': self.pelvic_pain,
            'painful_intercourse': self.painful_intercourse,
            'menstrual_changes': self.menstrual_changes,
            'weight_loss': self.weight_loss,
            'fatigue': self.fatigue,
            'pregnant': self.pregnant,
            'num_sexual_partners': self.num_sexual_partners,
            'age_first_intercourse': self.age_first_intercourse,
            'contraceptive_use': self.contraceptive_use,
            'contraceptive_duration': self.contraceptive_duration,
            'smoking_status': self.smoking_status,
            'cigarettes_per_day': self.cigarettes_per_day,
            'pap_smear_history': self.pap_smear_history,
            'abnormal_pap_result': self.abnormal_pap_result,
            'hiv_status': self.hiv_status,
            'hiv_positive': self.hiv_positive,
            'parity': self.parity,
            'high_parity': self.high_parity,
            'marital_status': self.marital_status,
            'risk_score': self.risk_score,
            'risk_category': self.risk_category,
            'scenario': self.scenario,
            'predefined_recommendations': self.predefined_recommendations,
            'personalized_recommendations': (self.personalized_recommendations or '').split('\n') if self.personalized_recommendations else [],
            'feedback_text': self.feedback_text,
            'feedback_submitted': self.feedback_submitted,
            'logged_at': self.logged_at.isoformat()
        }

# Role-based access control decorator
def role_required(allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                user_id = session.get('user_id')
                logger.info(f"Checking role for user_id: {user_id}, required roles: {allowed_roles}")
                if not user_id:
                    logger.warning("No user_id in session")
                    flash('Please log in to access this resource.', 'error')
                    return redirect(url_for('login')) if not request.path.startswith('/api/') else jsonify({'success': False, 'message': 'Please log in'}), 401
                
                user = User.query.get(user_id)
                if not user:
                    logger.warning(f"User not found for user_id: {user_id}")
                    session.pop('user_id', None)
                    flash('Please log in to access this resource.', 'error')
                    return redirect(url_for('login')) if not request.path.startswith('/api/') else jsonify({'success': False, 'message': 'User not found'}), 404
                
                if user.role not in allowed_roles:
                    logger.warning(f"User {user.username} (role: {user.role}) access denied to {request.path}")
                    flash('Access denied: Insufficient permissions.', 'error')
                    return redirect(url_for('home')) if not request.path.startswith('/api/') else jsonify({'success': False, 'message': 'Insufficient permissions'}), 403
                
                return f(*args, **kwargs)
            except Exception as e:
                logger.error(f"Role check error: {str(e)}")
                return jsonify({'success': False, 'message': 'Server error'}), 500
        return decorated_function
    return decorator

# Risk calculation functions (unchanged)
def calculate_risk_and_recommendations(patient_data):
    processed_data = preprocess_patient_data(patient_data)
    risk_score, scenario = calculate_risk_score(processed_data)
    risk_category = "Low risk" if risk_score < 40 else "Medium risk" if risk_score < 65 else "High risk"
    recommendations = generate_recommendations(risk_category, processed_data)
    return {
        "risk_score": risk_score,
        "risk_category": risk_category,
        "predefined_recommendations": recommendations["general"],
        "personalized_recommendations": recommendations["personalized"],
        "scenario": scenario
    }

def preprocess_patient_data(patient_data):
    processed = {}
    boolean_fields = ["abnormal_vaginal_bleeding", "abnormal_vaginal_discharge", 
                      "lower_abdominal_pain", "change_in_periods", "dyspareunia",
                      "weight_loss", "unusual_fatigue", "is_post_coital_or_post_menopausal",
                      "hiv_positive", "abnormal_pap_smear", "high_parity"]
    for field in boolean_fields:
        if field in patient_data:
            processed[field] = str(patient_data[field]).lower() in ["yes", "true", "1", "y"]
    
    if "age" in patient_data:
        processed["age"] = int(patient_data["age"])
    elif "dob" in patient_data:
        processed["age"] = calculate_age(patient_data["dob"])
    
    if "parity" in patient_data:
        try:
            processed["parity"] = int(patient_data["parity"])
        except ValueError:
            processed["parity"] = 5 if ">=5" in str(patient_data["parity"]) else 0
    
    text_fields = ["bleeding_type", "sexual_partners", "smoking", 
                   "marital_status", "oral_contraceptive_use", "age_first_intercourse"]
    for field in text_fields:
        if field in patient_data:
            processed[field] = patient_data[field]
    
    return processed

def calculate_age(dob):
    """Calculate age from a date string (YYYY-MM-DD) or a datetime.date object."""
    today = datetime.today().date()
    if isinstance(dob, str):
        try:
            dob = datetime.strptime(dob, "%Y-%m-%d").date()
        except ValueError:
            return 35
    elif not hasattr(dob, 'year'):
        return 35
    return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

# Helper function for age calculation (if not already defined)
def calculate_age(birth_date):
    """Calculate age from birth date string"""
    if isinstance(birth_date, str):
        birth_date = datetime.strptime(birth_date, "%Y-%m-%d").date()
    today = datetime.now().date()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))

@app.route('/api/session-debug', methods=['GET'])
def session_debug():
    """Debug route to check session status"""
    try:
        user_id = session.get('user_id')
        session_keys = list(session.keys())
        
        debug_info = {
            'user_id': user_id,
            'session_keys': session_keys,
            'session_permanent': session.permanent,
            'cookies_received': dict(request.cookies),
            'headers': dict(request.headers)
        }
        
        if user_id:
            user = User.query.get(user_id)
            debug_info['user_exists'] = user is not None
            debug_info['username'] = user.username if user else None
        
        return jsonify({
            'success': True,
            'debug_info': debug_info
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def calculate_risk_score(data):
    has_bleeding = data.get("abnormal_vaginal_bleeding", False)
    has_discharge = data.get("abnormal_vaginal_discharge", False)
    has_pain = data.get("lower_abdominal_pain", False)
    bleeding_type = data.get("bleeding_type", "")
    is_post_coital_or_post_menopausal = data.get("is_post_coital_or_post_menopausal", False)
    if not is_post_coital_or_post_menopausal and bleeding_type:
        is_post_coital_or_post_menopausal = any(type_str in str(bleeding_type).lower() 
                                               for type_str in ["post-coital", "post-menopausal", "postcoital", "postmenopausal"])
    
    scenario = ""
    if has_bleeding and has_discharge and has_pain:
        risk = 95.0
        scenario = "Scenario 1: All three primary symptoms present"
    elif has_bleeding and has_discharge and not has_pain:
        risk = 76.0 if is_post_coital_or_post_menopausal else 50.0
        scenario = "Scenario 2: Bleeding and discharge without pain"
    elif has_bleeding and not has_discharge and not has_pain:
        risk = 76.0 if is_post_coital_or_post_menopausal else 50.0
        scenario = "Scenario 3: Bleeding only"
    elif not has_bleeding and has_discharge and not has_pain:
        risk = 40.0
        scenario = "Scenario 4: Discharge only"
    elif not has_bleeding and has_discharge and has_pain:
        risk = 45.0
        scenario = "Scenario 5: Discharge and pain without bleeding"
    elif has_bleeding and not has_discharge and has_pain:
        risk = 70.0 if is_post_coital_or_post_menopausal else 50.0
        scenario = "Scenario 6: Bleeding and pain without discharge"
    elif not has_bleeding and not has_discharge and has_pain:
        risk = 30.0
        scenario = "Scenario 7: Pain only"
    else:
        risk = 0.0
        scenario = "Scenario 8: No primary symptoms"
    
    age = data.get("age", 35)
    if age < 20:
        scenario_1 = has_bleeding and has_discharge and has_pain
        post_coital_bleeding = has_bleeding and is_post_coital_or_post_menopausal
        if not (scenario_1 or post_coital_bleeding):
            risk = 10.0
            scenario += " (modified for young age)"
    
    risk_modifiers = []
    if data.get("change_in_periods", False):
        risk += 2.0
        risk_modifiers.append("Change in periods (+2%)")
    if data.get("dyspareunia", False):
        risk += 5.0
        risk_modifiers.append("Painful intercourse (+5%)")
    if data.get("weight_loss", False) and data.get("unusual_fatigue", False):
        risk += 20.0
        risk_modifiers.append("Weight loss and fatigue (+20%)")
    else:
        if data.get("weight_loss", False):
            risk += 5.0
            risk_modifiers.append("Weight loss (+5%)")
        if data.get("unusual_fatigue", False):
            risk += 5.0
            risk_modifiers.append("Unusual fatigue (+5%)")
    
    sexual_partners = data.get("sexual_partners", "")
    if "1-3" in str(sexual_partners):
        risk += 2.0
        risk_modifiers.append("1-3 sexual partners (+2%)")
    elif "4-7" in str(sexual_partners):
        risk += 5.0
        risk_modifiers.append("4-7 sexual partners (+5%)")
    elif ">8" in str(sexual_partners) or "8+" in str(sexual_partners):
        risk += 10.0
        risk_modifiers.append(">8 sexual partners (+10%)")
    
    smoking = data.get("smoking", "")
    if "1-9/day" in str(smoking):
        risk += 5.0
        risk_modifiers.append("Smoking 1-9/day (+5%)")
    elif "10-19/day" in str(smoking):
        risk += 10.0
        risk_modifiers.append("Smoking 10-19/day (+10%)")
    elif ">20/day" in str(smoking) or "20+" in str(smoking):
        risk += 15.0
        risk_modifiers.append("Smoking 20+/day (+15%)")
    
    marital_status = str(data.get("marital_status", "")).lower()
    if "single" in marital_status or "divorced" in marital_status:
        risk += 2.0
        risk_modifiers.append(f"Marital status: {marital_status} (+2%)")
    
    contraceptive_use = str(data.get("oral_contraceptive_use", ""))
    if "5-9 years" in contraceptive_use:
        risk += 5.0
        risk_modifiers.append("Oral contraceptive use 5-9 years (+5%)")
    elif ">10 years" in contraceptive_use or "10+" in contraceptive_use:
        risk += 10.0
        risk_modifiers.append("Oral contraceptive use 10+ years (+10%)")
    
    first_intercourse_age = str(data.get("age_first_intercourse", ""))
    if "<16 years" in first_intercourse_age:
        risk += 10.0
        risk_modifiers.append("First intercourse <16 years (+10%)")
    elif "17-20 years" in first_intercourse_age:
        risk += 5.0
        risk_modifiers.append("First intercourse 17-20 years (+5%)")
    elif ">21 years" in first_intercourse_age:
        risk += 2.0
        risk_modifiers.append("First intercourse >21 years (+2%)")
    
    if data.get("abnormal_pap_smear", False):
        risk += 50.0
        risk_modifiers.append("Abnormal pap smear history (+50%)")
    
    if data.get("high_parity", False) or data.get("parity", 0) >= 5:
        risk += 5.0
        risk_modifiers.append("High parity (5+ births) (+5%)")
    
    if data.get("hiv_positive", False):
        hiv_modifier = min(risk * 0.5, 99.0 - risk)
        risk += hiv_modifier
        risk_modifiers.append(f"HIV positive (+{hiv_modifier:.1f}%)")
    
    risk = min(risk, 99.0)
    if age < 20:
        scenario_1 = has_bleeding and has_discharge and has_pain
        post_coital_bleeding = has_bleeding and is_post_coital_or_post_menopausal
        if not (scenario_1 or post_coital_bleeding):
            if risk > 30.0:
                risk = 30.0
                risk_modifiers.append("Risk capped at 30% for young patients")
    
    if risk_modifiers:
        scenario += " | Modifiers: " + ", ".join(risk_modifiers)
    
    return round(risk, 1), scenario

def generate_recommendations(risk_category, patient_data):
    recommendations = {
        "general": "",
        "personalized": []
    }
    age = patient_data.get("age", 35)
    
    if risk_category == "Low risk":
        recommendations["general"] = """
        Based on your responses, your risk of cervical cancer is low.
        
        Over 99% of cervical cancer cases are caused by the human papillomavirus (HPV). The good news is that HPV is preventable.
        
        To protect yourself:
        • Get the HPV vaccine if you haven't already and you are under 45
        • Use condoms every time you have sex to lower your risk of infection
        • Keep healthy habits—exercise, don't smoke, eat well, treat STIs early
        • If you notice unusual vaginal bleeding, discharge, or pain, see your doctor right away
        
        If you're aged 21 to 65 and haven't been screened for cervical cancer, it's time to take that step. Screening options include:
        • HPV DNA test
        • Pap test
        • VIA (Visual Inspection with Acetic Acid)
        
        If it's been over 3 years since your last Pap test or over 5 years since your last VIA or HPV DNA test, you're due for another one.
        
        Next step: Please book a check-up with your doctor to review your symptoms and get screened if needed. It's quick, and it will make a big difference in your health.
        
        Small prevention dey save big wahala.
        """
        
    elif risk_category == "Medium risk":
        recommendations["general"] = """
        Based on your responses, your risk of cervical cancer is medium.
        
        We recommend that you schedule an appointment with your healthcare provider within the next 2-4 weeks. Discuss your symptoms and risk factors with your doctor.
        • You may need further testing such as a pelvic exam, HPV test, or colposcopy
        
        Over 99% of cervical cancer cases are caused by the human papillomavirus (HPV). The good news is that HPV is preventable.
        
        To protect yourself:
        • Get the HPV vaccine if you haven't already and you are under 45
        • Use condoms every time you have sex to lower your risk of infection
        • Keep healthy habits—exercise, don't smoke, eat well, treat STIs early
        • If you notice unusual vaginal bleeding, discharge, or pain, see your doctor right away
        
        If you're aged 21 to 65 and haven't been screened for cervical cancer, it's time to take that step. Screening options include:
        • HPV DNA test
        • Pap test
        • VIA (Visual Inspection with Acetic Acid)
        
        If it's been over 3 years since your last Pap test or over 5 years since your last VIA or HPV DNA test, you're due for another one.
        
        Next step: Please book a check-up with your doctor to review your symptoms and get screened if needed. It's quick, and it will make a big difference in your health.
        
        Small prevention dey save big wahala.
        """
        
    else:  # High risk
        recommendations["general"] = """
        Based on your responses, your risk for cervical cancer is high.
        
        While other causes of your symptoms are possible, we strongly recommend that you contact your healthcare provider immediately (within the next week) for a full evaluation. A referral to a gynecologist may be necessary, and diagnostic testing such as a VIA, pap, colposcopy or biopsy is recommended. 
        
        Taking action now helps you get answers faster—and gives you the best chance at staying healthy. Early diagnosis can significantly improve outcomes.
        """
    
    # Generate personalized recommendations based on patient data
    personalized = []
    
    # Existing personalized logic maintained
    if patient_data.get("abnormal_pap_smear", False):
        personalized.append("Follow up on your abnormal Pap test results with your healthcare provider")
    
    if patient_data.get("hiv_positive", False):
        personalized.append("As an HIV-positive individual, you should receive more frequent cervical screening. Consult your HIV care provider")
    
    smoking = patient_data.get("smoking", "")
    # Only add smoking cessation advice if user actually smokes
    if smoking and str(smoking).lower() not in ["", "no", "non-smoker", "never", "none"]:
        if any(keyword in str(smoking).lower() for keyword in ["yes", "smoke", "smoker", "cigarette", "tobacco"]):
            personalized.append("Consider smoking cessation as smoking increases cervical cancer risk")
    
    # Updated HPV vaccine recommendation to align with new guidelines (under 45)
    if age < 45:
        personalized.append("If you haven't received the HPV vaccine, discuss this option with your healthcare provider")
    
    if patient_data.get("abnormal_vaginal_bleeding", False) and patient_data.get("is_post_coital_or_post_menopausal", False):
        personalized.append("Post-coital or post-menopausal bleeding requires prompt medical evaluation")
    
    if patient_data.get("weight_loss", False) and patient_data.get("unusual_fatigue", False):
        personalized.append("Your weight loss and fatigue should be evaluated by a healthcare provider")
    

    
    recommendations["personalized"] = personalized
    return recommendations
    
    
# CSRF token endpoint
@app.route('/api/get-csrf-token', methods=['GET'])
def get_csrf_token():
    try:
        token = generate_csrf()
        app.logger.debug(f"Generated CSRF token: {token}")
        return jsonify({'csrf_token': token})
    except Exception as e:
        app.logger.error(f"Error generating CSRF token: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


# Current user endpoint
@app.route('/api/current-user', methods=['GET'])
def get_current_user():
    try:
        user_id = session.get('user_id')
        if not user_id:
            app.logger.debug("No user_id in session")
            return jsonify({'success': False, 'message': 'Not authenticated'}), 401
        user = User.query.get(user_id)
        if not user:
            app.logger.debug(f"User not found for user_id: {user_id}")
            return jsonify({'success': False, 'message': 'User not found'}), 404
        app.logger.debug(f"User found: {user.username}")
        return jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'state': user.state,
                'city': user.city,
                'contact_number': user.contact_number,
                'occupation': user.occupation,
                'has_cancer': user.has_cancer,
                'is_aware': user.is_aware,
                'has_screening': user.has_screening,
                'role': user.role
            }
        })
    except Exception as e:
        app.logger.error(f"Error in current-user: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500
        

# Routes

@app.route("/", methods=["GET"])
def index():
    """Main index route - redirect based on authentication status"""
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing / with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session, redirecting to login")
            return redirect(url_for('login_page'))
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            return redirect(url_for('login_page'))
        
        logger.info(f"User {user.username} (user_id={user_id}) redirected to /home")
        return redirect(url_for('home'))
    
    except Exception as e:
        logger.error(f"Error accessing /: {str(e)}")
        flash('Authentication error. Please log in again.', 'error')
        return redirect(url_for('login_page'))
        
        

@app.route('/api/register', methods=['POST'])
def register():
    try:
        # Extract data from the request
        data = request.form
        username = data.get('username')
        password = data.get('password')
        state = data.get('state')
        city = data.get('city')
        contact_number = data.get('contact_number')
        if contact_number == '':
            contact_number = None
        email = data.get('email')
        occupation = data.get('occupation')
        has_cancer = data.get('has_cancer')
        is_aware = data.get('is_aware')
        has_screening = data.get('has_screening')

        # Validate required fields
        if not all([username, password, state, city, email, occupation, has_cancer, is_aware, has_screening]):
            return jsonify({'success': False, 'message': 'All fields are required!'}), 400

        # Check for existing username or email
        if User.query.filter_by(username=username).first():
            return jsonify({'success': False, 'message': 'Username already exists!'}), 400
        if User.query.filter_by(email=email).first():
            return jsonify({'success': False, 'message': 'Email already exists!'}), 400

        # Hash the password
        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        # Create a new user instance
        new_user = User(
            username=username,
            password=hashed_password,
            state=state,
            city=city,
            contact_number=contact_number,
            email=email,
            occupation=occupation,
            has_cancer=has_cancer,
            is_aware=is_aware,
            has_screening=has_screening,
            role='user'
        )

        # Save the user to the database
        db.session.add(new_user)
        db.session.commit()

        # Return success response
        return jsonify({
            'success': True,
            'message': 'Registration successful! Please log in.',
            'redirect_url': url_for('login', _external=True)
        }), 200

    except Exception as e:
        # Handle server errors
        app.logger.error(f"Error during registration: {e}")
        db.session.rollback()
        return jsonify({'success': False, 'message': 'Registration failed due to server error.'}), 500
        
        

@app.route('/api/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            username = request.form.get('username', '').strip()
            password = request.form.get('password', '')
            
            if not username or not password:
                return jsonify({
                    'success': False,
                    'message': "Username and password are required"
                }), 400

            user = User.query.filter_by(username=username).first()
            
            if not user or not check_password_hash(user.password, password):
                return jsonify({
                    'success': False,
                    'message': 'Invalid username or password'
                }), 401

            session['user_id'] = user.id
            session.permanent = True
            
            # Convert user object to dictionary
            user_data = {
                'id': user.id,
                'username': user.username,
                'role': user.role,
                'email': user.email
            }
            
            logger.info(f"Login successful for user={username}, user_id={user.id}")
            return jsonify({
                'success': True,
                'message': 'Login successful',
                'user': user_data
            }), 200
            
        except Exception as e:
            error_msg = f'Error during login: {str(e)}'
            logger.error(error_msg)
            return jsonify({
                'success': False,
                'message': error_msg
            }), 500
    
    return jsonify({
        'success': False,
        'message': 'Method not allowed'
    }), 405
    
    
@app.route('/api/profile', methods=['GET'])
def profile():
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /profile with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': False, 'message': 'Please log in'}), 401
            flash('Please log in to access your profile.', 'error')
            return redirect(url_for('login'))
        
        user = User.query.get_or_404(user_id)
        logger.info(f"User found: {user.username}, role: {user.role}")

        assessment_exists = SymptomHistory.query.filter_by(user_id=user_id).first()
        if not assessment_exists:
            logger.info(f"No assessment found for user_id: {user_id}, redirecting to home")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({
                    'success': False,
                    'message': 'Please complete the symptom assessment before viewing your profile.'
                }), 403
            flash('Please complete the symptom assessment before viewing your profile.', 'error')
            return redirect(url_for('home'))

        history = SymptomHistory.query.filter_by(user_id=user_id).order_by(SymptomHistory.logged_at.desc()).all()
        logger.info(f"Fetched {len(history)} history records for user_id: {user_id}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True,
                'user': user.to_dict(),
                'history': [record.to_dict() for record in history],
                'assessment_exists': bool(assessment_exists)
            }), 200
        return render_template('profile.html', user=user, history=history, assessment_exists=assessment_exists)
    
    except Exception as e:
        logger.error(f"Error accessing /profile: {str(e)}")
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500
        flash('Authentication error. Please log in again.', 'error')
        return redirect(url_for('login'))

# --- Health Resource Endpoints ---
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'pdf', 'png', 'jpg', 'jpeg', 'gif'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/admin/resources', methods=['POST'])
@role_required(['admin'])
def upload_resource():
    try:
        resource_type = request.form.get('type', 'pdf')
        title = request.form.get('title', '').strip()
        description = request.form.get('description', '').strip()
        user_id = session.get('user_id')

        if not title:
            return jsonify({'success': False, 'message': 'Title is required.'}), 400

        if resource_type == 'pdf':
            if 'file' not in request.files:
                return jsonify({'success': False, 'message': 'No file part'}), 400
            file = request.files['file']
            if file.filename == '' or not allowed_file(file.filename):
                return jsonify({'success': False, 'message': 'A valid PDF file is required.'}), 400
            
            filename = secure_filename(f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{file.filename}")
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
            
            resource = Resource(
                title=title, 
                description=description, 
                filename=filename, 
                resource_type='pdf',
                uploaded_by=user_id
            )
        elif resource_type == 'link':
            url = request.form.get('url', '').strip()
            if not url:
                return jsonify({'success': False, 'message': 'URL is required for link resources.'}), 400
            
            thumbnail_filename = None
            if 'thumbnail' in request.files:
                thumbnail_file = request.files['thumbnail']
                if thumbnail_file and allowed_file(thumbnail_file.filename):
                    thumbnail_filename = secure_filename(f"thumb_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{thumbnail_file.filename}")
                    thumbnail_file.save(os.path.join(app.config['UPLOAD_FOLDER'], thumbnail_filename))

            resource = Resource(
                title=title,
                description=description,
                url=url,
                thumbnail=thumbnail_filename,
                resource_type='link',
                uploaded_by=user_id
            )
        else:
            return jsonify({'success': False, 'message': 'Invalid resource type.'}), 400

        db.session.add(resource)
        db.session.commit()
        return jsonify({'success': True, 'resource': resource.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        logger.error(f"Resource upload error: {str(e)}")
        return jsonify({'success': False, 'message': 'Upload failed.'}), 500

@app.route('/api/admin/resources/<int:resource_id>', methods=['PUT', 'DELETE'])
@role_required(['admin'])
def manage_resource(resource_id):
    resource = Resource.query.get_or_404(resource_id)

    if request.method == 'PUT':
        try:
            resource.title = request.form.get('title', resource.title).strip()
            resource.description = request.form.get('description', resource.description).strip()

            if resource.resource_type == 'link':
                resource.url = request.form.get('url', resource.url).strip()
                if 'thumbnail' in request.files:
                    thumbnail_file = request.files['thumbnail']
                    if thumbnail_file and allowed_file(thumbnail_file.filename):
                        if resource.thumbnail and os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], resource.thumbnail)):
                            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], resource.thumbnail))
                        
                        thumbnail_filename = secure_filename(f"thumb_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{thumbnail_file.filename}")
                        thumbnail_file.save(os.path.join(app.config['UPLOAD_FOLDER'], thumbnail_filename))
                        resource.thumbnail = thumbnail_filename

            db.session.commit()
            return jsonify({'success': True, 'resource': resource.to_dict()})
        except Exception as e:
            db.session.rollback()
            logger.error(f"Resource update error: {str(e)}")
            return jsonify({'success': False, 'message': 'Update failed.'}), 500

    if request.method == 'DELETE':
        try:
            if resource.resource_type == 'pdf' and resource.filename:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], resource.filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Deleted file: {file_path}")
            elif resource.resource_type == 'link' and resource.thumbnail:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], resource.thumbnail)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Deleted thumbnail: {file_path}")

            db.session.delete(resource)
            db.session.commit()
            logger.info(f"Resource {resource_id} deleted by admin")
            return jsonify({'success': True, 'message': 'Resource deleted successfully.'}), 200
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error deleting resource: {str(e)}")
            return jsonify({'success': False, 'message': 'Failed to delete resource.'}), 500

@app.route('/api/resources', methods=['GET'])
def list_resources():
    try:
        resources = Resource.query.order_by(Resource.uploaded_at.desc()).all()
        return jsonify({'success': True, 'resources': [r.to_dict() for r in resources]})
    except Exception as e:
        logger.error(f"List resources error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to fetch resources.'}), 500
        
@app.route('/api/resources/<int:resource_id>/download', methods=['GET'])
def download_resource(resource_id):
    try:
        resource = Resource.query.get_or_404(resource_id)
        if resource.resource_type == 'pdf' and resource.filename:
            return send_from_directory(app.config['UPLOAD_FOLDER'], resource.filename, as_attachment=True, download_name=resource.filename)
        else:
            return jsonify({'success': False, 'message': 'This resource is not a downloadable file.'}), 404
    except Exception as e:
        logger.error(f"Download resource error: {str(e)}")
        return jsonify({'success': False, 'message': 'Download failed.'}), 404

    
@app.route('/api/profile-settings', methods=['GET', 'POST'])
def profile_settings():
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /api/profile-settings with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session")
            if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': False, 'message': 'Please log in'}), 401
            flash('Please log in to access your profile.', 'error')
            return redirect(url_for('login'))
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': False, 'message': 'User not found'}), 404
            flash('Please log in to access your profile.', 'error')
            return redirect(url_for('login'))
        
        if request.method == 'GET':
            logger.info(f"Returning profile for user: {user.username}")
            return jsonify({'success': True, 'user': user.to_dict()}), 200
        
        elif request.method == 'POST':
            # Handle both JSON and form data
            if request.is_json:
                data = request.get_json()
            else:
                data = request.form.to_dict()
                
            logger.info(f"Updating profile for user: {user.username}, data: {data.keys()}")

            # Validate CSRF token for JSON requests
            if request.is_json:
                csrf_token = request.headers.get('X-CSRF-Token')
                if csrf_token:
                    try:
                        validate_csrf(csrf_token)
                    except CSRFValidationError as e:
                        logger.warning(f"CSRF token validation failed: {str(e)}")
                        return jsonify({'success': False, 'message': 'CSRF token validation failed'}), 400
            else:
                # For form data, validate CSRF normally
                csrf_token = data.get('csrf_token')
                if csrf_token:
                    try:
                        validate_csrf(csrf_token)
                    except CSRFValidationError as e:
                        logger.warning(f"CSRF token validation failed: {str(e)}")
                        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                            return jsonify({'success': False, 'message': 'CSRF token validation failed'}), 400
                        flash('CSRF token missing or invalid.', 'error')
                        return redirect(url_for('profile'))

            # Update username
            if 'username' in data and data['username'] != user.username:
                existing_user = User.query.filter_by(username=data['username']).first()
                if existing_user:
                    logger.warning(f"Username {data['username']} already exists")
                    if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify({'success': False, 'message': 'Username already exists'}), 400
                    flash('Username already exists.', 'error')
                    return redirect(url_for('profile'))
                user.username = data['username']

            # Update email
            if 'email' in data and data['email'] != user.email:
                existing_user = User.query.filter_by(email=data['email']).first()
                if existing_user:
                    logger.warning(f"Email {data['email']} already exists")
                    if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify({'success': False, 'message': 'Email already exists'}), 400
                    flash('Email already exists.', 'error')
                    return redirect(url_for('profile'))
                user.email = data['email']

            # Update other fields
            updateable_fields = ['state', 'city', 'contact_number', 'occupation', 'has_cancer', 'is_aware', 'has_screening']
            for field in updateable_fields:
                if field in data:
                    setattr(user, field, data[field])

            # Handle password change
            if 'current_password' in data and 'new_password' in data:
                if not data['current_password'] or not data['new_password']:
                    logger.warning(f"Missing current or new password for user: {user.username}")
                    if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify({'success': False, 'message': 'Both current and new password are required'}), 400
                    flash('Both current and new password are required.', 'error')
                    return redirect(url_for('profile'))
                
                if not check_password_hash(user.password, data['current_password']):
                    logger.warning(f"Incorrect current password for user: {user.username}")
                    if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify({'success': False, 'message': 'Current password is incorrect'}), 400
                    flash('Current password is incorrect.', 'error')
                    return redirect(url_for('profile'))
                
                if len(data['new_password']) < 8:
                    logger.warning(f"New password too short for user: {user.username}")
                    if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                        return jsonify({'success': False, 'message': 'New password must be at least 8 characters'}), 400
                    flash('New password must be at least 8 characters.', 'error')
                    return redirect(url_for('profile'))
                
                user.password = generate_password_hash(data['new_password'], method='pbkdf2:sha256')
                logger.info(f"Password updated for user: {user.username}")

            try:
                db.session.commit()
                logger.info(f"Profile updated successfully for user: {user.username}")
                if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return jsonify({
                        'success': True,
                        'message': 'Profile updated successfully',
                        'user': user.to_dict()
                    }), 200
                flash('Profile updated successfully!', 'success')
                return redirect(url_for('profile'))
            except Exception as e:
                db.session.rollback()
                logger.error(f"Error updating profile for user_id: {user_id}: {str(e)}")
                if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return jsonify({'success': False, 'message': f'Error updating profile: {str(e)}'}), 500
                flash(f'Error updating profile: {str(e)}', 'error')
                return redirect(url_for('profile'))
    
    except Exception as e:
        logger.error(f"Profile settings error: {str(e)}")
        if request.is_json or request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({'success': False, 'message': 'Profile operation failed'}), 500
        flash('Profile operation failed.', 'error')
        return redirect(url_for('login'))

    
@app.route('/api/logout', methods=['POST'])
def logout():
    try:
        username = None
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            username = user.username if user else 'unknown'
        session.pop('user_id', None)
        logger.info(f"User {username} (user_id={user_id}) logged out")
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
    except Exception as e:
        logger.error(f"Error logging out: {str(e)}")
        return jsonify({'success': False, 'message': f'Error logging out: {str(e)}'}), 500
        
@app.route('/api/screening-recommendations', methods=['GET'])
def screening_recommendations():
    """Get screening recommendations based on user's latest symptom history"""
    try:
        user_id = session.get('user_id')
        logger.info(f"Screening recommendations request - user_id: {user_id}, session: {dict(session)}")
        
        if not user_id:
            logger.warning("No user_id in session for screening recommendations")
            return jsonify({
                'success': False,
                'message': 'Please log in to access recommendations',
                'debug': {'session_keys': list(session.keys()), 'cookies': dict(request.cookies)}
            }), 401

        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            return jsonify({
                'success': False,
                'message': 'User session invalid. Please log in again.'
            }), 401

        recommendations = []
        latest_assessment = SymptomHistory.query.filter_by(user_id=user_id).order_by(
            SymptomHistory.logged_at.desc()
        ).first()

        # Add personalized recommendation only if assessment exists
        if latest_assessment:
            # Use predefined_recommendations and personalized_recommendations fields
            rec_obj = {
                'id': 1,
                'title': 'Based on Your Latest Assessment',
                'risk_score': latest_assessment.risk_score,
                'risk_category': latest_assessment.risk_category,
                'scenario': latest_assessment.scenario,
                'predefined_recommendations': latest_assessment.predefined_recommendations,
                'personalized_recommendations': latest_assessment.personalized_recommendations.split('\n') if latest_assessment.personalized_recommendations else [],
                'assessment_date': latest_assessment.logged_at.strftime('%B %d, %Y')
            }
            recommendations.append(rec_obj)
        else:
            recommendations.append({
                'id': 1,
                'title': 'No Assessment Completed',
                'predefined_recommendations': 'Please complete a symptom assessment to receive personalized recommendations.',
                'personalized_recommendations': [],
                'assessment_date': None
            })

        # Calculate age for age-based recommendations
        age = None
        dob = None
        if hasattr(user, 'dob') and user.dob:
            try:
                if isinstance(user.dob, str):
                    dob = datetime.strptime(user.dob, "%Y-%m-%d").date()
                else:
                    dob = user.dob
            except Exception as e:
                logger.warning(f"Could not parse user.dob: {user.dob}, error: {e}")
                dob = None
        if not dob and latest_assessment and latest_assessment.dob:
            dob = latest_assessment.dob
        if dob:
            today = datetime.today().date()
            age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

        # Add updated age-based recommendations with new guidelines
        age_rec = {
            'id': 2,
            'title': 'Age-Based Screening Guidelines',
            'recommendation': '',
            'details': []
        }
        
        if age is not None:
            if age < 21:
                age_rec['details'].append('Cervical cancer screening is not yet recommended for your age group.')
                age_rec['details'].append('Focus on HPV prevention through vaccination and safe practices.')
            elif 21 <= age <= 29:
                age_rec['details'].append('Get a Pap test every 3 years.')
                age_rec['details'].append('HPV testing alone is not recommended for this age group.')
            elif 30 <= age <= 65:
                age_rec['details'].append('Recommended options:')
                age_rec['details'].append('• HPV test every 5 years (preferred), OR')
                age_rec['details'].append('• Pap test every 3 years, OR')
                age_rec['details'].append('• HPV test with Pap test (co-testing) every 5 years')
            else:
                age_rec['details'].append('Screening may no longer be needed if you have had adequate prior screening.')
                age_rec['details'].append('Consult your healthcare provider about whether to continue screening.')
        else:
            age_rec['details'].append('Age information not available. Please update your profile for personalized screening recommendations.')
        
        age_rec['details'].append('Note: These are general guidelines. Your healthcare provider may recommend a different schedule based on your individual risk factors.')
        recommendations.append(age_rec)

        # Add updated general recommendations with HPV focus
        recommendations.append({
            'id': 3,
            'title': 'HPV Prevention & General Health',
            'recommendation': 'Over 99% of cervical cancer cases are caused by HPV. Protect yourself with these measures:',
            'details': [
                'Get the HPV vaccine if you haven\'t already and you are under 45',
                'Use condoms every time you have sex to lower your risk of infection',
                'Schedule regular check-ups with your healthcare provider',
                'Keep healthy habits—exercise, don\'t smoke, eat well, treat STIs early',
                'If you notice unusual vaginal bleeding, discharge, or pain, see your doctor right away'
            ]
        })

        # Add screening options information
        recommendations.append({
            'id': 4,
            'title': 'Available Screening Options',
            'recommendation': 'If you\'re aged 21 to 65 and due for screening, these options are available:',
            'details': [
                'HPV DNA test - Checks for high-risk HPV types',
                'Pap test - Looks for abnormal cervical cells',
                'VIA (Visual Inspection with Acetic Acid) - Visual examination method'
            ]
        })

        logger.info(f"Returning {len(recommendations)} recommendations for user_id: {user_id}")
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })

    except Exception as e:
        logger.error(f"Error getting screening recommendations: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Error retrieving recommendations',
            'error': str(e)
        }), 500
        

@app.route('/api/symptom-checker', methods=['POST'])
def symptom_checker():
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /api/symptom-checker with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session")
            return jsonify({'success': False, 'message': 'Please log in'}), 401
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            return jsonify({'success': False, 'message': 'User not found'}), 404

        if request.is_json:
            data = request.get_json(silent=True)
            if data is None:
                logger.warning("Invalid JSON data")
                return jsonify({'success': False, 'message': 'Invalid JSON data'}), 400
        else:
            data = request.form.to_dict()

        if not data:
            logger.warning("No data provided")
            return jsonify({'success': False, 'message': 'No data provided'}), 400        # Using session-based authentication instead of CSRF tokens
        if not request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            logger.warning("Missing X-Requested-With header")
            return jsonify({'success': False, 'message': 'Invalid request'}), 400

        required_fields = ['full_name', 'dob', 'ethnicity']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        if missing_fields:
            logger.warning(f"Missing fields: {missing_fields}")
            return jsonify({'success': False, 'message': f'Missing fields: {", ".join(missing_fields)}'}), 400

        try:
            dob = datetime.strptime(data.get('dob'), "%Y-%m-%d").date()
            age = calculate_age(data.get('dob'))
        except ValueError:
            logger.warning("Invalid DOB format")
            return jsonify({'success': False, 'message': 'Invalid DOB format (YYYY-MM-DD)'}), 400

        result = calculate_risk_and_recommendations(data)
        symptom_history = SymptomHistory(
            user_id=user_id,
            full_name=data.get('full_name'),
            dob=dob,
            age=age,
            gender='Female',
            ethnicity=data.get('ethnicity'),
            ethnicity_other_input=data.get('ethnicity_other_input'),
            abnormal_bleeding=data.get('abnormal_vaginal_bleeding'),
            bleeding_type=data.get('bleeding_type'),
            post_coital_or_post_menopausal=data.get('is_post_coital_or_post_menopausal'),
            abnormal_discharge=data.get('abnormal_vaginal_discharge'),
            pelvic_pain=data.get('lower_abdominal_pain'),
            painful_intercourse=data.get('dyspareunia'),
            menstrual_changes=data.get('change_in_periods'),
            weight_loss=data.get('weight_loss'),
            fatigue=data.get('unusual_fatigue'),
            pregnant=data.get('is_pregnant'),
            num_sexual_partners=data.get('sexual_partners'),
            age_first_intercourse=data.get('age_first_intercourse'),
            contraceptive_use=data.get('oral_contraceptive_use'),
            contraceptive_duration=data.get('contraceptive_years'),
            smoking_status=data.get('smoking'),
            cigarettes_per_day=data.get('cigarettes_per_day'),
            pap_smear_history=data.get('had_pap_smear'),
            abnormal_pap_result=data.get('abnormal_pap_smear'),
            hiv_status=data.get('hiv_status'),
            hiv_positive=data.get('hiv_positive'),
            parity=data.get('parity'),
            high_parity=data.get('high_parity'),
            marital_status=data.get('marital_status'),
            risk_score=result['risk_score'],
            risk_category=result['risk_category'],
            scenario=result['scenario'],
            predefined_recommendations=result['predefined_recommendations'],
            personalized_recommendations='\n'.join(result['personalized_recommendations']),
            feedback_submitted=False,
            logged_at=datetime.utcnow()
        )

        try:
            db.session.add(symptom_history)
            db.session.commit()
            logger.info(f"Symptom history saved for user_id: {user_id}, history_id: {symptom_history.id}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Error saving assessment: {str(e)}")
            return jsonify({'success': False, 'message': f'Error saving assessment: {str(e)}'}), 500

        return jsonify({
            'success': True,
            'message': 'Symptom analysis completed and saved',
            'data': {
                'id': symptom_history.id, # Add the ID of the newly created entry
                'risk_score': result['risk_score'],
                'risk_category': result['risk_category'],
                'scenario': result['scenario'],
                'predefined_recommendations': result['predefined_recommendations'],
                'personalized_recommendations': result['personalized_recommendations']
            }
        }), 200

    except Exception as e:
        logger.error(f"Error in symptom-checker: {str(e)}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@app.route('/api/submit-feedback', methods=['POST'])
def submit_feedback():
    try:
        user_id = session.get('user_id')
        if not user_id:
            return jsonify({'success': False, 'message': 'Please log in'}), 401

        data = request.get_json()
        assessment_id = data.get('assessment_id')
        feedback_text = data.get('feedback_text')

        if not assessment_id or not feedback_text:
            return jsonify({'success': False, 'message': 'Assessment ID and feedback text are required'}), 400

        assessment = SymptomHistory.query.filter_by(id=assessment_id, user_id=user_id).first()
        if not assessment:
            return jsonify({'success': False, 'message': 'Assessment not found or does not belong to user'}), 404

        if assessment.feedback_submitted:
            return jsonify({'success': False, 'message': 'Feedback already submitted for this assessment'}), 409

        assessment.feedback_text = feedback_text
        assessment.feedback_submitted = True
        db.session.commit()

        return jsonify({'success': True, 'message': 'Feedback submitted successfully'}), 200

    except Exception as e:
        db.session.rollback()
        logger.error(f"Error submitting feedback: {str(e)}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@app.route('/api/symptom-history', methods=['GET'])
def symptom_history():
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /api/symptom-history with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session")
            return jsonify({'success': False, 'message': 'Please log in'}), 401
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            return jsonify({'success': False, 'message': 'User not found'}), 404

        assessment_exists = SymptomHistory.query.filter_by(user_id=user_id).first()
        if not assessment_exists:
            logger.info(f"No assessment found for user_id: {user_id}")
            return jsonify({
                'success': False,
                'message': 'Please complete the symptom assessment before viewing your history.'
            }), 403

        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        if page < 1 or per_page < 1:
            logger.warning(f"Invalid pagination parameters: page={page}, per_page={per_page}")
            return jsonify({'success': False, 'message': 'Invalid page or per_page parameters'}), 400
        if per_page > 100:
            per_page = 100
            logger.info("Capped per_page to 100")

        history_query = SymptomHistory.query.filter_by(user_id=user_id).order_by(SymptomHistory.logged_at.desc())
        paginated_history = history_query.paginate(page=page, per_page=per_page, error_out=False)

        history_data = [record.to_dict() for record in paginated_history.items]

        logger.info(f"Retrieved {len(history_data)} history records for user_id: {user_id}, page: {page}")
        return jsonify({
            'success': True,
            'message': 'Symptom history retrieved',
            'data': {
                'history': history_data,
                'pagination': {
                    'page': page,
                    'per_page': per_page,
                    'total_pages': paginated_history.pages,
                    'total_items': paginated_history.total
                }
            }
        }), 200

    except Exception as e:
        logger.error(f"Error in symptom-history: {str(e)}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@app.route('/api/history', methods=['GET'])
def history():
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /history with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session")
            flash('Please log in to access your symptom history.', 'error')
            return redirect(url_for('login'))
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            flash('Please log in to access your symptom history.', 'error')
            return redirect(url_for('login'))
        
        assessment_exists = SymptomHistory.query.filter_by(user_id=user_id).first()
        if not assessment_exists:
            logger.info(f"No assessment found for user_id: {user_id}, redirecting to home")
            flash('Please complete the symptom assessment before viewing your history.', 'error')
            return redirect(url_for('home'))

        history = SymptomHistory.query.filter_by(user_id=user_id).order_by(SymptomHistory.logged_at.desc()).all()
        logger.info(f"Fetched {len(history)} history records for user_id: {user_id}")
        
        return render_template('history.html', user=user, history=history)
    
    except Exception as e:
        logger.error(f"Error accessing /history: {str(e)}")
        flash('Authentication error. Please log in again.', 'error')
        return redirect(url_for('login'))
        

@app.route('/api/admin', methods=['GET'])
@role_required(['admin'])
def admin_users():
    try:
        logger.info(f"Rendering admin dashboard for user_id: {session.get('user_id')}")
        return render_template('admin.html')
    except Exception as e:
        logger.error(f"Error rendering admin dashboard: {str(e)}")
        return redirect(url_for('login'))

@app.route('/api/admin/users', methods=['GET'])
@role_required(['admin'])
def admin_get_users():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        users = User.query.paginate(page=page, per_page=per_page, error_out=False)
        
        logger.info(f"Admin retrieved {users.total} users, page: {page}")
        return jsonify({
            'success': True,
            'users': [user.to_dict() for user in users.items],
            'total': users.total,
            'pages': users.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        logger.error(f"Admin get users error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to retrieve users'}), 500
        

@app.route('/api/admin/generate-analytics-pdf', methods=['POST'])
@role_required(['admin'])
def admin_generate_analytics_pdf():
    try:
        user_id = session.get('user_id')
        logger.info(f"Admin {user_id} requested analytics PDF export")
        if not user_id:
            return jsonify({'success': False, 'message': 'Please log in'}), 401
        user = User.query.get(user_id)
        if not user or user.role != 'admin':
            return jsonify({'success': False, 'message': 'Admin privileges required'}), 403

        data = request.get_json(silent=True)
        if not data:
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        analytics = data.get('data', {})
        date_range = data.get('dateRange', '')
        charts = data.get('charts', {})
        generated_at = datetime.now().strftime('%B %d, %Y, %I:%M %p')

        html = render_template(
            'admin_analytics_report.html',
            analytics=analytics,
            date_range=date_range,
            charts=charts,
            generated_at=generated_at
        )

        from weasyprint import HTML as WeasyHTML
        pdf = WeasyHTML(string=html).write_pdf()

        response = make_response(pdf)
        response.headers['Content-Type'] = 'application/pdf'
        response.headers['Content-Disposition'] = f'attachment; filename=analytics-report-{date_range}.pdf'
        return response
    except Exception as e:
        logger.error(f"Error generating analytics PDF: {str(e)}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500


@app.route('/api/admin/users/<int:user_id>', methods=['PUT', 'DELETE'])
@role_required(['admin'])
def admin_manage_user(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            return jsonify({'success': False, 'message': 'User not found'}), 404
        
        if request.method == 'PUT':
            data = request.get_json() or request.form.to_dict()
            logger.info(f"Admin updating user_id: {user_id}, data: {data.keys()}")

            if 'role' in data and data['role'] in ['user', 'admin', 'provider']:
                user.role = data['role']
            
            updateable_fields = ['state', 'city', 'contact_number', 'occupation', 'has_cancer', 'is_aware', 'has_screening']
            for field in updateable_fields:
                if field in data:
                    setattr(user, field, data[field])
            
            db.session.commit()
            logger.info(f"User {user_id} updated by admin")
            return jsonify({
                'success': True,
                'message': 'User updated successfully',
                'user': user.to_dict()
            }), 200
        
        elif request.method == 'DELETE':
            SymptomHistory.query.filter_by(user_id=user_id).delete()
            db.session.delete(user)
            db.session.commit()
            logger.info(f"User {user_id} deleted by admin")
            return jsonify({'success': True, 'message': 'User deleted successfully'}), 200
    
    except Exception as e:
        logger.error(f"Admin manage user error: {str(e)}")
        return jsonify({'success': False, 'message': 'User management operation failed'}), 500

@app.route('/api/admin/users/<int:user_id>/medical-records', methods=['GET'])
@role_required(['admin'])
def admin_get_user_medical_records(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found: {user_id}")
            return jsonify({'success': False, 'message': 'User not found'}), 404

        medical_records = SymptomHistory.query.filter_by(user_id=user_id).order_by(SymptomHistory.logged_at.desc()).all()
        
        logger.info(f"Admin retrieved {len(medical_records)} medical records for user_id: {user_id}")
        return jsonify({
            'success': True,
            'records': [record.to_dict() for record in medical_records]
        }), 200
    
    except Exception as e:
        logger.error(f"Admin get user medical records error: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to retrieve medical records'}), 500

@app.route('/api/provider', methods=['GET'])
@role_required(['admin', 'provider'])
def provider_patients():
    try:
        logger.info(f"Rendering provider dashboard for user_id: {session.get('user_id')}")
        return render_template('provider.html')
    except Exception as e:
        logger.error(f"Error rendering provider dashboard: {str(e)}")
        return redirect(url_for('login'))




from io import BytesIO
from flask import send_file

# Add this endpoint after other routes in app.py
@app.route('/api/generate-pdf', methods=['POST'])
def generate_pdf():
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /api/generate-pdf with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session")
            return jsonify({'success': False, 'message': 'Please log in'}), 401

        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            return jsonify({'success': False, 'message': 'User not found'}), 404

        if request.is_json:
            data = request.get_json(silent=True)
            if data is None:
                logger.warning("Invalid JSON data")
                return jsonify({'success': False, 'message': 'Invalid JSON data'}), 400
        else:
            data = request.form.to_dict()

        if not data:
            logger.warning("No data provided")
            return jsonify({'success': False, 'message': 'No data provided'}), 400

        # Validate CSRF token
        csrf_token = request.headers.get('X-CSRF-Token') or data.get('csrf_token')
        if csrf_token:
            try:
                validate_csrf(csrf_token)
            except CSRFValidationError as e:
                logger.warning(f"CSRF token validation failed: {str(e)}")
                return jsonify({'success': False, 'message': 'CSRF token validation failed'}), 400
        else:
            logger.warning("Missing CSRF token")
            return jsonify({'success': False, 'message': 'CSRF token missing'}), 400

        # Generate HTML content for the PDF
        html_content = f"""
        <html>
        <head>
            <title>Cervical Cancer Risk Assessment Report</title>
            <style>
                body {{ font-family: Arial, sans-serif; margin: 20px; }}
                h1 {{ color: #2c3e50; }}
                h2 {{ color: #34495e; }}
                p, li {{ font-size: 14px; line-height: 1.6; }}
                ul {{ list-style-type: disc; margin-left: 20px; }}
            </style>
        </head>
        <body>
            <h1>Cervical Cancer Risk Assessment Report</h1>
            <p><strong>Full Name:</strong> {data.get('full_name', 'N/A')}</p>
            <p><strong>Age:</strong> {data.get('age', 'N/A')}</p>
            <h2>Risk Assessment</h2>
            <p><strong>Risk Percentage:</strong> {data.get('risk_score', 'N/A')}%</p>
            <p><strong>Risk Category:</strong> {data.get('risk_category', 'N/A')}</p>
            <p><strong>Scenario:</strong> {data.get('scenario', 'N/A')}</p>
            <h2>Recommendations</h2>
            <h3>General Recommendations</h3>
            <p>{data.get('predefined_recommendations', 'N/A')}</p>
            <h3>Personalized Recommendations</h3>
            <ul>
                {''.join(f'<li>{rec}</li>' for rec in data.get('personalized_recommendations', []))}
            </ul>
            <p><strong>Important:</strong> This report is for informational purposes only and does not replace medical advice. Please consult a healthcare provider.</p>
        </body>
        </html>
        """

        # Generate PDF
        pdf_buffer = BytesIO()
        HTML(string=html_content).write_pdf(pdf_buffer)
        pdf_buffer.seek(0)

        logger.info(f"PDF generated successfully for user_id: {user_id}")
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='cervical_cancer_report.pdf'
        )

    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        return jsonify({'success': False, 'message': f'Error generating PDF: {str(e)}'}), 500

@app.route('/api/admin/symptom-history', methods=['GET'])
@role_required(['admin'])
def admin_symptom_history():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 100, type=int)
        if page < 1 or per_page < 1:
            return jsonify({'success': False, 'message': 'Invalid page or per_page parameters'}), 400
        if per_page > 500:
            per_page = 500
        query = SymptomHistory.query.order_by(SymptomHistory.logged_at.desc())
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        history_data = []
        for record in paginated.items:
            db.session.refresh(record) # Explicitly refresh the object from the database
            history_data.append(record.to_dict())
        return jsonify({
            'success': True,
            'history': history_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total_pages': paginated.pages,
                'total_items': paginated.total
            }
        }), 200
    except Exception as e:
        logger.error(f"Error in admin_symptom_history: {str(e)}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'}), 500

@app.route('/api/admin/usage-stats', methods=['GET'])
@role_required(['admin'])
def usage_stats():
    try:
        total_users = User.query.count()
        last_30_days = datetime.utcnow() - timedelta(days=30)
        
        new_users_last_30_days = User.query.filter(User.created_at >= last_30_days).count()
        
        total_symptom_histories = SymptomHistory.query.count()
        
        symptom_histories_last_30_days = SymptomHistory.query.filter(SymptomHistory.logged_at >= last_30_days).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'activeUsers': {
                    'total': total_users,
                    'last30Days': new_users_last_30_days
                },
                'formSubmissions': {
                    'total': total_symptom_histories,
                    'last30Days': symptom_histories_last_30_days
                }
            }
        }), 200
    except Exception as e:
        logger.error(f"Error getting usage stats: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to retrieve usage stats.'}), 500

@app.route('/api/admin/error-logs', methods=['GET'])
@role_required(['admin'])
def error_logs():
    try:
        log_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'app.log')
        if not os.path.exists(log_file_path):
            return jsonify({'success': True, 'errors': []})

        errors = []
        with open(log_file_path, 'r') as f:
            for line in f:
                if 'ERROR' in line:
                    parts = line.strip().split(':', 3)
                    if len(parts) >= 4:
                        errors.append({
                            'id': len(errors) + 1,
                            'date': parts[0],
                            'error': parts[3].strip(),
                            'time': parts[1] + ':' + parts[2]
                        })
        
        # Return the last 10 errors
        return jsonify({'success': True, 'errors': errors[-10:]})
    except Exception as e:
        logger.error(f"Error reading error logs: {str(e)}")
        return jsonify({'success': False, 'message': 'Failed to retrieve error logs.'}), 500

#Flask Templates Rendering

#@app.route('/api/login', methods=['POST'])
#def api_login():
#    try:
#        csrf_token = request.form.get('csrf_token')
#        try:
#            validate_csrf(csrf_token)
#        except ValidationError:
#            return jsonify({
#                'success': False,
#                'message': 'Invalid CSRF token.'
#            }), 400
#
#        username = request.form.get('username')
#        password = request.form.get('password')
#
#        user = User.query.filter_by(username=username).first()
#
#        if user and user.check_password(password):
#            session['user_id'] = user.id
#            next_url = request.form.get('next') or request.args.get('next') or url_for('home')
#
#            return jsonify({
#                'success': True,
#                'message': 'Login successful!',
#                'redirect_url': next_url
#            })
#
#        else:
#            return jsonify({
#                'success': False,
#                'message': 'Invalid username or password'
#            }), 401
#
#    except Exception as e:
#        app.logger.error(f"Login error: {str(e)}", exc_info=True)
#        return jsonify({
#            'success': False,
#            'message': 'An unexpected error occurred'
#        }), 500
        
        
@app.route('/login', methods=['GET'])
def login_page():
    """Render login template"""
    try:
        # If user is already logged in, redirect to home
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            if user:
                logger.info(f"User {user.username} already logged in, redirecting to home")
                return redirect(url_for('home'))

        csrf_token = generate_csrf()
        return render_template('login.html', csrf_token=csrf_token)

    except Exception as e:
        logger.error(f"Error rendering login page: {str(e)}", exc_info=True)
        flash('Error loading login page.', 'error')
        return render_template('login.html', csrf_token=generate_csrf()), 500
        

@app.route('/register', methods=['GET'])
def register_page():
    """Render registration template"""
    try:
        # If user is already logged in, redirect to home
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            if user:
                logger.info(f"User {user.username} already logged in, redirecting to home")
                return redirect(url_for('home'))
        
        return render_template('register.html', csrf_token=generate_csrf())
    except Exception as e:
        logger.error(f"Error rendering register page: {str(e)}")
        flash('Error loading registration page.', 'error')
        return render_template('register.html', csrf_token=generate_csrf())




@app.route('/home', methods=['GET'])
def home():
    """Render home/dashboard template"""
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /home with user_id: {user_id}")
        
        if not user_id:
            logger.warning("No user_id in session, redirecting to login")
            flash('Please log in to access the application.', 'error')
            return redirect(url_for('login_page'))
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            flash('Please log in to access the application.', 'error')
            return redirect(url_for('login_page'))
        
        # Check if user has completed any assessments
        assessment_exists = SymptomHistory.query.filter_by(user_id=user_id).first()
        recent_assessments = SymptomHistory.query.filter_by(user_id=user_id).order_by(
            SymptomHistory.logged_at.desc()
        ).limit(5).all()
        
        logger.info(f"User {user.username} accessing home, assessments: {len(recent_assessments)}")
        
        return render_template('index.html', 
                             user=user, 
                             assessment_exists=bool(assessment_exists),
                             recent_assessments=recent_assessments,
                             csrf_token=generate_csrf())
    
    except Exception as e:
        logger.error(f"Error accessing /home: {str(e)}")
        flash('Error loading dashboard. Please try again.', 'error')
        return redirect(url_for('login_page'))  # Fixed to use login_page
        

@app.route('/symptom-checker', methods=['GET'])
def symptom_checker_page():
    """Render symptom checker template"""
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /symptom-checker with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session, redirecting to login")
            flash('Please log in to access the symptom checker.', 'error')
            return redirect(url_for('login_page'))
        
        user = User.query.get(user_id)
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            flash('Please log in to access the symptom checker.', 'error')
            return redirect(url_for('login_page'))
        
        logger.info(f"User {user.username} accessing symptom checker")
        return render_template('symptom_checker.html', 
                             user=user, 
                             csrf_token=generate_csrf())
    
    except Exception as e:
        logger.error(f"Error accessing /symptom-checker: {str(e)}")
        flash('Error loading symptom checker. Please try again.', 'error')
        return redirect(url_for('home'))

@app.route('/profile', methods=['GET'])
def profile_page():
    """Render profile template - this enhances your existing profile route"""
    try:
        user_id = session.get('user_id')
        logger.info(f"Accessing /profile with user_id: {user_id}")
        if not user_id:
            logger.warning("No user_id in session")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify({'success': False, 'message': 'Please log in'}), 401
            flash('Please log in to access your profile.', 'error')
            return redirect(url_for('login_page'))
        
        user = User.query.get_or_404(user_id)
        logger.info(f"User found: {user.username}, role: {user.role}")

        assessment_exists = SymptomHistory.query.filter_by(user_id=user_id).first()
        history = SymptomHistory.query.filter_by(user_id=user_id).order_by(
            SymptomHistory.logged_at.desc()
        ).all()
        
        logger.info(f"Fetched {len(history)} history records for user_id: {user_id}")
        
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify({
                'success': True,
                'user': user.to_dict(),
                'history': [record.to_dict() for record in history],
                'assessment_exists': bool(assessment_exists)
            }), 200
        
        return render_template('profile.html', 
                             user=user, 
                             history=history, 
                             assessment_exists=bool(assessment_exists),
                             csrf_token=generate_csrf())
    
    except Exception as e:
        logger.error(f"Error accessing /profile: {str(e)}")
        if not user:
            logger.warning(f"User not found for user_id: {user_id}")
            session.pop('user_id', None)
            flash('Please log in to access your symptom history.', 'error')
            return redirect(url_for('login_page'))
        
        assessment_exists = SymptomHistory.query.filter_by(user_id=user_id).first()
        if not assessment_exists:
            logger.info(f"No assessment found for user_id: {user_id}, redirecting to home")
            flash('Please complete the symptom assessment before viewing your history.', 'error')
            return redirect(url_for('home'))

        # Pagination support
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        history_query = SymptomHistory.query.filter_by(user_id=user_id).order_by(
            SymptomHistory.logged_at.desc()
        )
        paginated_history = history_query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        logger.info(f"Fetched {len(paginated_history.items)} history records for user_id: {user_id}")
        
        return render_template('history.html', 
                             user=user, 
                             history=paginated_history.items,
                             pagination=paginated_history,
                             csrf_token=generate_csrf())
    
    except Exception as e:
        logger.error(f"Error accessing /history: {str(e)}")
        flash('Error loading history. Please try again.', 'error')
        return redirect(url_for('login_page'))

@app.route('/logout', methods=['GET'])
def logout_page():
    """Handle logout via GET request and redirect"""
    try:
        username = None
        user_id = session.get('user_id')
        if user_id:
            user = User.query.get(user_id)
            username = user.username if user else 'unknown'
        
        session.pop('user_id', None)
        logger.info(f"User {username} (user_id={user_id}) logged out via GET")
        flash('You have been logged out successfully.', 'success')
        return redirect(url_for('login_page'))
    except Exception as e:
        logger.error(f"Error logging out via GET: {str(e)}")
        flash('Error during logout.', 'error')
        return redirect(url_for('login_page'))

# Admin routes (if you have admin functionality)
@app.route('/admin', methods=['GET'])
@role_required(['admin'])
def admin_dashboard():
    """Render admin dashboard"""
    try:
        user_id = session.get('user_id')
        user = User.query.get(user_id)
        
        # Get some statistics
        total_users = User.query.count()
        total_assessments = SymptomHistory.query.count()
        recent_users = User.query.order_by(User.created_at.desc()).limit(10).all()
        recent_assessments = SymptomHistory.query.order_by(
            SymptomHistory.logged_at.desc()
        ).limit(10).all()
        
        return render_template('admin_dashboard.html',
                             user=user,
                             total_users=total_users,
                             total_assessments=total_assessments,
                             recent_users=recent_users,
                             recent_assessments=recent_assessments,
                             csrf_token=generate_csrf())
    except Exception as e:
        logger.error(f"Error accessing admin dashboard: {str(e)}")
        flash('Error loading admin dashboard.', 'error')
        return redirect(url_for('home'))

# Error handlers for better template rendering
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors"""
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Endpoint not found'}), 404
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    db.session.rollback()
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Internal server error'}), 500
    return render_template('500.html'), 500

@app.errorhandler(403)
def forbidden_error(error):
    """Handle 403 errors"""
    if request.path.startswith('/api/'):
        return jsonify({'success': False, 'message': 'Access forbidden'}), 403
    return render_template('403.html'), 403

# Context processor to make common variables available in all templates
@app.context_processor
def inject_common_vars():
    """Inject common variables into all templates"""
    user_id = session.get('user_id')
    current_user = None
    if user_id:
        current_user = User.query.get(user_id)
    
    return {
        'current_user': current_user,
        'csrf_token': generate_csrf(),
        'current_year': datetime.now().year
    }


@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get('email')

        if not email:
            return jsonify({'success': False, 'message': 'Email is required.'}), 400

        user = User.query.filter_by(email=email).first()

        if user:
            # Create a new password reset request
            new_request = PasswordResetRequest(user_id=user.id)
            db.session.add(new_request)
            db.session.commit()

            # In a real application, you would send an email to the admin to notify them of the request.
            # For this example, we'll just log it to the console.
            print(f"Password reset requested for email: {email}. Token: {new_request.token}")

        # Always return a success message to prevent user enumeration attacks.
        return jsonify({'success': True, 'message': 'If an account with that email exists, a password reset request has been sent to the administrator for approval.'}), 200

    except Exception as e:
        app.logger.error(f"Error in forgot-password: {str(e)}")
        return jsonify({'success': False, 'message': 'An unexpected error occurred.'}), 500

@app.route('/api/admin/password-reset-requests', methods=['GET'])
@role_required(['admin'])
def get_password_reset_requests():
    try:
        requests = PasswordResetRequest.query.filter_by(status='pending').all()
        return jsonify({'success': True, 'requests': [
            {
                'id': req.id,
                'user_id': req.user_id,
                'username': User.query.get(req.user_id).username,
                'email': User.query.get(req.user_id).email,
                'created_at': req.created_at.isoformat(),
                'expires_at': req.expires_at.isoformat()
            } for req in requests
        ]}), 200
    except Exception as e:
        app.logger.error(f"Error getting password reset requests: {str(e)}")
        return jsonify({'success': False, 'message': 'An unexpected error occurred.'}), 500

@app.route('/api/admin/password-reset-requests/<int:request_id>', methods=['PUT'])
@role_required(['admin'])
def manage_password_reset_request(request_id):
    try:
        req = PasswordResetRequest.query.get(request_id)
        if not req:
            return jsonify({'success': False, 'message': 'Request not found.'}), 404

        data = request.get_json()
        status = data.get('status')

        if status not in ['approved', 'denied']:
            return jsonify({'success': False, 'message': 'Invalid status.'}), 400

        req.status = status
        db.session.commit()

        # In a real application, you would send an email to the user to notify them of the status change.
        print(f"Password reset request {req.id} has been {status}.")

        return jsonify({'success': True, 'message': f'Request {status} successfully.'}), 200

    except Exception as e:
        app.logger.error(f"Error managing password reset request: {str(e)}")
        return jsonify({'success': False, 'message': 'An unexpected error occurred.'}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        token = data.get('token')
        new_password = data.get('new_password')

        if not token or not new_password:
            return jsonify({'success': False, 'message': 'Token and new password are required.'}), 400

        req = PasswordResetRequest.query.filter_by(token=token, status='approved').first()

        if not req or req.expires_at < datetime.utcnow():
            return jsonify({'success': False, 'message': 'Invalid or expired token.'}), 400

        user = User.query.get(req.user_id)
        if not user:
            return jsonify({'success': False, 'message': 'User not found.'}), 404

        user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
        req.status = 'used'
        db.session.commit()

        return jsonify({'success': True, 'message': 'Password reset successfully.'}), 200

    except Exception as e:
        app.logger.error(f"Error resetting password: {str(e)}")
        return jsonify({'success': False, 'message': 'An unexpected error occurred.'}), 500


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    logger.info("Starting Flask application...")
    app.run(debug=False, host='0.0.0.0', port=int(os.environ.get('PORT', 8000)))