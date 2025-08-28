import { Navigate } from 'react-router-dom';
import { Home } from './Home';
import { Login } from './Login';
import { Register } from './Register';
import { User } from './User';
import { Admin } from './Admin';
import { Provider } from './Provider';
import { ContentManagement } from './ContentManagement';
import { Customization } from './Customization';
import { Database } from './Database';
import { HealthResources } from './HealthResources';
import { UserManagement } from './UserManagement';
import { SymptomChecker } from './SymptomChecker';
import { MedicalHistory } from './MedicalHistory';
import { Monitoring } from './Monitoring';
import { ProfileSettings } from './ProfileSettings';
import { Contact } from './Contact';
import { PrivacyPolicy } from './PrivacyPolicy';
import { TermsConditions } from './TermsConditions';
import { Help } from './Help';
import { ForgotPassword } from './ForgotPassword';
import { ScreeningRecommendations } from './ScreeningRecommendations';
import { ProtectedRoute } from './components/ProtectedRoute';

export const routes = [
  { path: '/', element: <Home /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  {
    path: '/admin',
    element: <ProtectedRoute element={<Admin />} allowedRoles={['admin']} />,
  },
  {
    path: '/user',
    element: <ProtectedRoute element={<User />} allowedRoles={['user', 'provider']} />,
  },
  {
    path: '/provider',
    element: <ProtectedRoute element={<Provider />} allowedRoles={['provider']} />,
  },
  {
    path: '/content-management',
    element: <ProtectedRoute element={<ContentManagement />} allowedRoles={['admin']} />,
  },
  
  {
    path: '/manage-users',
    element: <ProtectedRoute element={<UserManagement />} allowedRoles={['admin']} />,
  },
  {
    path: '/symptom-checker',
    element: <ProtectedRoute element={<SymptomChecker />} allowedRoles={['user', 'provider']} />,
  },
  {
    path: '/database',
    element: <ProtectedRoute element={<Database />} allowedRoles={['admin']} />,
  },
  { path: '/health-resources', element: <HealthResources /> },
  {
    path: '/medical-history',
    element: <ProtectedRoute element={<MedicalHistory />} allowedRoles={['user', 'provider']} />,
  },
  {
    path: '/monitoring',
    element: <ProtectedRoute element={<Monitoring />} allowedRoles={['admin']} />,
  },
  {
    path: '/profile-settings',
    element: <ProtectedRoute element={<ProfileSettings />} allowedRoles={['user', 'provider']} />,
  },
  {
    path: '/screening-recommendations',
    element: <ProtectedRoute element={<ScreeningRecommendations />} allowedRoles={['user', 'provider']} />,
  },
  { path: '/contact', element: <Contact /> },
  { path: '/privacy-policy', element: <PrivacyPolicy /> },
  { path: '/terms-conditions', element: <TermsConditions /> },
  { path: '/help', element: <Help /> },
  {
    path: '*',
    element: <Navigate to="/" replace />, // Redirect unknown routes to Home
  },
];