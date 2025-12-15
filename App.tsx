// App.tsx (COMPLETE UPDATED VERSION)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './contexts/ThemeContext';
import { UserRole } from './types';
import { Layout } from './components/Layout';
import { AuthFlow } from './components/auth/AuthFlow';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { LaboratoryDashboard } from './components/laboratory/LaboratoryDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DarkModeToggle } from './components/common/DarkModeToggle';
import { ProfileCompletion } from './components/auth/ProfileCompletion';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// App content component
const AppContent: React.FC = () => {
  const { token, userProfile, loading, logout, loadUserData, error: authError } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('summary');
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [pendingRole, setPendingRole] = useState<UserRole | null>(null);
  const [appError, setAppError] = useState<string>('');
  const hasCheckedProfileRef = useRef(false);

  // Error boundary-like error handler
  const handleError = useCallback((error: Error | string) => {
    console.error('App error:', error);
    setAppError(typeof error === 'string' ? error : error.message);
  }, []);

  // Clear error
  const clearError = () => {
    setAppError('');
  };

  // Check if user needs profile completion
  useEffect(() => {
    if (!token || !userProfile || hasCheckedProfileRef.current) return;

    const checkProfileCompletion = async () => {
      try {
        const needsProfile = localStorage.getItem('needsProfileCompletion');
        const storedRole = localStorage.getItem('pendingRole') as UserRole;
        
        console.log('Profile check:', { needsProfile, storedRole, userRole: userProfile.user.role });

        if (needsProfile === 'true' && storedRole) {
          // User just registered - needs to complete profile
          setPendingRole(storedRole);
          setShowProfileCompletion(true);
          hasCheckedProfileRef.current = true;
        } else if (userProfile.user.role === 'user' && !needsProfile) {
          // Edge case: user has 'user' role but no profile completion flag
          // Ask them to complete profile
          setPendingRole(UserRole.PATIENT);
          setShowProfileCompletion(true);
          hasCheckedProfileRef.current = true;
        } else {
          // Profile already completed or no need for completion
          localStorage.removeItem('needsProfileCompletion');
          localStorage.removeItem('pendingRole');
        }
      } catch (err) {
        handleError(err instanceof Error ? err : new Error('Profile check failed'));
      }
    };

    checkProfileCompletion();
  }, [token, userProfile, handleError]);

  // Handle profile completion
  const handleProfileComplete = useCallback(async () => {
    try {
      setShowProfileCompletion(false);
      setPendingRole(null);
      
      // Clear flags
      localStorage.removeItem('needsProfileCompletion');
      localStorage.removeItem('pendingRole');
      
      // Wait a moment for backend to update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload user data
      await loadUserData();
      
      console.log('Profile completion successful');
    } catch (err) {
      handleError(err instanceof Error ? err : new Error('Profile completion failed'));
    }
  }, [loadUserData, handleError]);

  const handleProfileSkip = useCallback(() => {
    setShowProfileCompletion(false);
    setPendingRole(null);
    localStorage.removeItem('needsProfileCompletion');
    localStorage.removeItem('pendingRole');
  }, []);

  // Handle tab change for admin
  const handleAdminTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Show loading state
  if (loading && token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-primary dark:text-blue-400 mb-4" size={48} />
          <p className="text-slate-600 dark:text-slate-300 font-medium">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (appError && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6 transition-colors duration-300">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-red-100 dark:border-red-900/50">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-bold text-red-800 dark:text-red-300 text-lg mb-2">
                  Application Error
                </h3>
                <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                  {appError}
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Application
              </button>
              <button
                onClick={clearError}
                className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth error
  if (authError && !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
        <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="w-full max-w-md mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-red-100 dark:border-red-900/50">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">
                  Authentication Error
                </h3>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  {authError}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Retry Login
            </button>
          </div>
        </div>
        
        <AuthFlow />
      </div>
    );
  }

  // Show profile completion if needed
  if (showProfileCompletion && pendingRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-4 transition-colors duration-300">
        <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <div className="w-full max-w-md z-10">
          <ProfileCompletion
            targetRole={pendingRole}
            onComplete={handleProfileComplete}
            onSkip={handleProfileSkip}
          />
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-600">
            © 2024 TOHPITOH - Plateforme de Santé Numérique
          </p>
        </div>
      </div>
    );
  }

  // Show auth flow if not logged in
  if (!token || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-300">
        <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        
        <AuthFlow />
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-600">
            © 2024 TOHPITOH - Plateforme de Santé Numérique
          </p>
        </div>
      </div>
    );
  }

  // Render authenticated dashboard based on role
  const role = userProfile.user.role;
  
  // Map string role to UserRole enum
  let userRole: UserRole;
  switch (role) {
    case 'patient': userRole = UserRole.PATIENT; break;
    case 'doctor': userRole = UserRole.DOCTOR; break;
    case 'laboratory': userRole = UserRole.LAB; break;
    case 'admin': userRole = UserRole.ADMIN; break;
    default: userRole = UserRole.USER;
  }

  // Debug logging
  console.log('App Content:', {
    role,
    userRole,
    hasToken: !!token,
    hasUserProfile: !!userProfile,
    hasPatientData: !!userProfile.patient,
    hasDoctorData: !!userProfile.doctor,
    hasLabData: !!userProfile.laboratory,
    showProfileCompletion,
    pendingRole
  });

  return (
    <Layout
      userRole={userRole}
      onLogout={logout}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    >
      {/* Error boundary for dashboard */}
      <div className="min-h-full">
        {userRole === UserRole.PATIENT ? (
          userProfile.patient ? (
            <PatientDashboard activeTab={activeTab} />
          ) : (
            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  Patient Profile Required
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Your account is registered as a patient but your profile data couldn't be loaded.
                </p>
                <button
                  onClick={() => {
                    setPendingRole(UserRole.PATIENT);
                    setShowProfileCompletion(true);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Complete Profile Now
                </button>
              </div>
            </div>
          )
        ) : userRole === UserRole.DOCTOR ? (
          userProfile.doctor ? (
            <DoctorDashboard activeTab={activeTab} />
          ) : (
            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  Doctor Profile Required
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Your account is registered as a doctor but your profile data couldn't be loaded.
                </p>
                <button
                  onClick={() => {
                    setPendingRole(UserRole.DOCTOR);
                    setShowProfileCompletion(true);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Complete Profile Now
                </button>
              </div>
            </div>
          )
        ) : userRole === UserRole.LAB ? (
          userProfile.laboratory ? (
            <LaboratoryDashboard activeTab={activeTab} />
          ) : (
            <div className="p-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                  Laboratory Profile Required
                </h2>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Your account is registered as a laboratory but your profile data couldn't be loaded.
                </p>
                <button
                  onClick={() => {
                    setPendingRole(UserRole.LAB);
                    setShowProfileCompletion(true);
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Complete Profile Now
                </button>
              </div>
            </div>
          )
        ) : userRole === UserRole.ADMIN ? (
          <AdminDashboard 
            activeTab={activeTab} 
            onTabChange={handleAdminTabChange}
          />
        ) : (
          <div className="p-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 text-center">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-3">
                Complete Your Profile
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Your account is registered but you need to complete your profile to access features.
                <br />
                <span className="text-sm">Current role: {role}</span>
              </p>
              <button
                onClick={() => {
                  const targetRole = localStorage.getItem('pendingRole') as UserRole || UserRole.PATIENT;
                  setPendingRole(targetRole);
                  setShowProfileCompletion(true);
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg"
              >
                Complete Profile Now
              </button>
              <button
                onClick={loadUserData}
                className="ml-3 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Main App wrapper with providers
const App: React.FC = () => {
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Global error handler
  const handleGlobalError = useCallback((error: Error) => {
    console.error('Global app error:', error);
    setErrorMessage(error.message || 'An unexpected error occurred');
    setHasError(true);
  }, []);

  // Error boundary fallback
  if (hasError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-red-100 dark:border-red-900/50">
            <div className="flex items-start space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-800 dark:text-red-300 mb-2">
                  Application Error
                </h3>
                <p className="text-red-700 dark:text-red-400 text-sm mb-4">
                  {errorMessage}
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <ErrorBoundary onError={handleGlobalError}>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Simple error boundary component
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error) => void;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, { hasError: boolean }> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
              Something went wrong
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Please reload the application
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default App;