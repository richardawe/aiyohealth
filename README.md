# Aiyo Health - Cervical Cancer Detection Platform

A comprehensive healthcare platform for early detection of cervical cancer, featuring a React frontend and Flask backend with machine learning capabilities.

## 🏗️ Project Structure

```
aiyohealth/
├── frontend/          # React + Vite frontend application
├── backend/           # Flask + SQLAlchemy backend API
├── models/            # Machine learning models and pipelines
├── synthetic-data/    # Synthetic data for testing
├── shared/            # Common utilities and configurations
├── docs/              # Documentation and guides
├── scripts/           # Deployment and utility scripts
└── .github/           # GitHub Actions workflows
```

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (for production)

### Local Development

#### Backend (Flask)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python3 app.py
```
Backend will run on `http://localhost:8000`

#### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

### Database Setup
```bash
cd backend
python3 seed_database.py
```
This creates test users with credentials:
- **Regular User**: `testuser1` / `password123`
- **Admin User**: `testadmin` / `admin123`

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```
FLASK_ENV=development
FLASK_SECRET_KEY=your_secret_key
DATABASE_URI=sqlite:///aiyo.db
```

#### Frontend (.env.local)
```
VITE_API_BASE_URL=/api
```

## 🚀 Deployment

### Railway Deployment
1. Connect repository to Railway
2. Configure PostgreSQL service
3. Set environment variables
4. Deploy backend first, then frontend

### Environment Variables for Production
```
FLASK_ENV=production
FLASK_SECRET_KEY=your_production_secret
DATABASE_URI=postgresql://...
```

## 📚 Features

### Frontend
- User authentication and role-based access
- Symptom checker with risk assessment
- Medical history management
- Admin dashboard and analytics
- Responsive design for mobile and desktop

### Backend
- RESTful API with Flask
- Machine learning models for risk assessment
- User management and authentication
- File upload and management
- Analytics and reporting

### Machine Learning
- Random Forest classifier and regressor
- Risk scoring algorithms
- Personalized recommendations
- Data preprocessing pipelines

## 🔒 Security

- JWT-based authentication
- Role-based access control
- CSRF protection
- Secure session management
- Input validation and sanitization

## 📊 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout
- `GET /api/current-user` - Get current user info

### User Management
- `POST /api/register` - User registration
- `GET /api/profile` - User profile
- `PUT /api/profile-settings` - Update profile

### Symptom Assessment
- `POST /api/symptom-checker` - Submit symptoms
- `GET /api/symptom-history` - Get user history
- `POST /api/submit-feedback` - Submit feedback

### Admin (Admin role required)
- `GET /api/admin/users` - List all users
- `GET /api/admin/symptom-history` - All symptom history
- `POST /api/admin/generate-analytics-pdf` - Generate reports

## 🧪 Testing

### Backend Tests
```bash
cd backend
python3 -m pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in the `docs/` folder
- Review the API documentation

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
- **v1.1.0** - Added machine learning models
- **v1.2.0** - Enhanced admin dashboard
- **v1.3.0** - Production deployment ready 