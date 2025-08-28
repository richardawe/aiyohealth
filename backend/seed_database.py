# seed_database.py
from app import app, db, User
from werkzeug.security import generate_password_hash
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_test_users():
    with app.app_context():
        try:
            test_users = [
                {
                    'username': 'testuser1',
                    'email': 'testuser1@example.com',
                    'password': 'password123',
                    'state': 'Lagos',
                    'city': 'Ikeja',
                    'contact_number': '08012345678',
                    'occupation': 'Software Developer',
                    'has_cancer': 'no',
                    'is_aware': 'yes',
                    'has_screening': 'no',
                    'role': 'user'
                },
                {
                    'username': 'testuser2',
                    'email': 'testuser2@example.com',
                    'password': 'password123',
                    'state': 'Abuja FCT',
                    'city': 'Garki',
                    'contact_number': '08123456789',
                    'occupation': 'Nurse',
                    'has_cancer': 'no',
                    'is_aware': 'no',
                    'has_screening': 'yes',
                    'role': 'user'
                },
                {
                    'username': 'testuser3',
                    'email': 'testuser3@example.com',
                    'password': 'password123',
                    'state': 'Kano',
                    'city': 'Kano',
                    'contact_number': '08234567890',
                    'occupation': 'Trader',
                    'has_cancer': 'yes',
                    'is_aware': 'yes',
                    'has_screening': 'yes',
                    'role': 'user'
                },
                {
                    'username': 'testuser4',
                    'email': 'testuser4@example.com',
                    'password': 'password123',
                    'state': 'Rivers',
                    'city': 'Port Harcourt',
                    'contact_number': '08345678901',
                    'occupation': 'Teacher',
                    'has_cancer': 'no',
                    'is_aware': 'no',
                    'has_screening': 'no',
                    'role': 'user'
                },
                {
                    'username': 'testuser5',
                    'email': 'testuser5@example.com',
                    'password': 'password123',
                    'state': 'Oyo',
                    'city': 'Ibadan',
                    'contact_number': '08456789012',
                    'occupation': 'Civil Servant',
                    'has_cancer': 'no',
                    'is_aware': 'yes',
                    'has_screening': 'yes',
                    'role': 'user'
                },
                {
                    'username': 'testuser6',
                    'email': 'testuser6@example.com',
                    'password': 'password123',
                    'state': 'Enugu',
                    'city': 'Enugu',
                    'contact_number': '08567890123',
                    'occupation': 'Farmer',
                    'has_cancer': 'no',
                    'is_aware': 'no',
                    'has_screening': 'no',
                    'role': 'user'
                },
                {
                    'username': 'testadmin',
                    'email': 'testadmin@example.com',
                    'password': 'admin123',
                    'state': 'Kaduna',
                    'city': 'Kaduna',
                    'contact_number': '08678901234',
                    'occupation': 'Administrator',
                    'has_cancer': 'no',
                    'is_aware': 'yes',
                    'has_screening': 'no',
                    'role': 'admin'
                }
            ]

            for user_data in test_users:
                if not User.query.filter_by(username=user_data['username']).first() and not User.query.filter_by(email=user_data['email']).first():
                    hashed_password = generate_password_hash(user_data['password'], method='pbkdf2:sha256')
                    new_user = User(
                        username=user_data['username'],
                        password=hashed_password,
                        email=user_data['email'],
                        state=user_data['state'],
                        city=user_data['city'],
                        contact_number=user_data['contact_number'],
                        occupation=user_data['occupation'],
                        has_cancer=user_data['has_cancer'],
                        is_aware=user_data['is_aware'],
                        has_screening=user_data['has_screening'],
                        role=user_data['role']
                    )
                    db.session.add(new_user)
                    logger.info(f"Test user {user_data['username']} created successfully")
                else:
                    logger.info(f"Test user {user_data['username']} or email {user_data['email']} already exists, skipping creation")
            db.session.commit()
            logger.info("All test users processed successfully")

        except Exception as e:
            db.session.rollback()
            logger.error(f"Error creating test users: {str(e)}")

if __name__ == "__main__":
    seed_test_users()