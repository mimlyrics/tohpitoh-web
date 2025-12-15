// contexts/AuthContext.tsx (FINAL FIXED VERSION)
import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { UserRole, FullProfile, MedicalRecord, User } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  token: string | null;
  userProfile: FullProfile | null;
  medicalRecords: MedicalRecord[];
  loading: boolean;
  error: string;
  successMsg: string;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (data: any, role: UserRole) => Promise<void>;
  logout: () => void;
  loadUserData: (force?: boolean) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [userProfile, setUserProfile] = useState<FullProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Use refs to prevent infinite loops
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  const login = async (email: string, password: string, targetRole: UserRole) => {
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const data = await api.login(email, password);
      const authToken = data.token || data.accessToken || data.access || data.key;
      
      if (authToken) {
        // Store auth data including user info
        const authData = {
          token: authToken,
          user: data.user || data.data || {
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            phone: data.phone,
            role: data.role || 'user',
            is_active: true,
            is_verified: false
          }
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
        localStorage.setItem('token', authToken);
        setToken(authToken);
        
        // Reset refs for new login
        hasLoadedRef.current = false;
        
        // Set basic user profile from auth response
        const basicProfile: FullProfile = {
          user: authData.user
        };
        setUserProfile(basicProfile);
        
        const userRole = authData.user.role;
        let roleValid = false;
        
        // Role Validation Logic
        if (userRole === 'admin' && targetRole === UserRole.ADMIN) roleValid = true;
        else if (targetRole === UserRole.PATIENT && userRole === 'patient') roleValid = true;
        else if (targetRole === UserRole.DOCTOR && userRole === 'doctor') roleValid = true;
        else if (targetRole === UserRole.LAB && userRole === 'laboratory') roleValid = true;
        else if (targetRole === UserRole.PATIENT && userRole === 'user') {
          // 'user' role can become 'patient' after profile completion
          roleValid = true;
          // Store pending role for profile completion
          localStorage.setItem('pendingRole', targetRole);
          localStorage.setItem('needsProfileCompletion', 'true');
        }

        if (!roleValid) {
          throw new Error(`This account is not authorized for ${targetRole} space. Current role: ${userRole}`);
        }

        // Load additional profile data based on role
        await loadUserData(true); // Force load after login

      } else {
        throw new Error("Authentication token missing");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Email or password incorrect");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any, targetRole: UserRole) => {
    setLoading(true);
    setError('');

    try {
      // STEP 1: Basic registration with role always as 'user' initially
      const payload = {
        email: data.email,
        password: data.password,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        role: 'user', // Always 'user' initially
        country: data.country || '' // Optional field
      };

      const response = await api.register(payload);
      
      // Auto-login after successful registration
      const authToken = response.accessToken;
      if (authToken) {
        localStorage.setItem('token', authToken);
        setToken(authToken);
        
        // Reset refs for new registration
        hasLoadedRef.current = false;
        
        // Store auth data
        const authData = {
          token: authToken,
          user: {
            id: response.id,
            first_name: response.first_name,
            last_name: response.last_name,
            email: response.email,
            phone: response.phone,
            role: 'user',
            country: response.country,
            is_active: true,
            is_verified: false
          }
        };
        
        localStorage.setItem('authData', JSON.stringify(authData));
        
        // Set basic user profile
        const basicProfile: FullProfile = {
          user: authData.user
        };
        setUserProfile(basicProfile);
        
        // Store target role for profile completion
        localStorage.setItem('pendingRole', targetRole);
        localStorage.setItem('needsProfileCompletion', 'true');
        
        setSuccessMsg("Account created! Please complete your profile.");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // FIXED: Add force parameter and use refs to prevent infinite loops
  const loadUserData = async (force: boolean = false) => {
    if (!token || isLoadingRef.current) {
      console.log('loadUserData: Skipping - no token or already loading');
      return;
    }
    
    // Prevent multiple loads unless forced
    if (hasLoadedRef.current && !force) {
      console.log('loadUserData: Already loaded, skipping');
      return;
    }
    
    isLoadingRef.current = true;
    setLoading(true);
    
    try {
      console.log('loadUserData: Starting data load', { force });
      
      // Get user from localStorage
      const authDataStr = localStorage.getItem('authData');
      if (!authDataStr) {
        console.log('loadUserData: No auth data found');
        throw new Error('No auth data found');
      }
      
      const authData = JSON.parse(authDataStr);
      const userData = authData.user;
      const userRole = userData.role;
      
      console.log('loadUserData: Current role', userRole);
      
      let patientData = null;
      let doctorData = null;
      let laboratoryData = null;
      
      // Fetch data based on CURRENT role
      switch (userRole) {
        case 'patient':
          try {
            const patientResponse = await api.patient.getProfile(token);
            patientData = patientResponse;
            console.log('loadUserData: Loaded patient data');
          } catch (e: any) {
            console.warn('Could not fetch patient profile:', e.message);
          }
          break;
          
        case 'doctor':
          try {
            const doctorResponse = await api.doctor.getMyProfile(token);
            doctorData = doctorResponse;
            console.log('loadUserData: Loaded doctor data');
          } catch (e: any) {
            console.warn('Could not fetch doctor profile:', e.message);
          }
          break;
          
        case 'laboratory':
          try {
            const labResponse = await api.laboratory.getMyProfile(token);
            laboratoryData = labResponse;
            console.log('loadUserData: Loaded laboratory data');
          } catch (e: any) {
            console.warn('Could not fetch laboratory profile:', e.message);
          }
          break;
          
        case 'user':
          console.log('loadUserData: User role detected - waiting for profile completion');
          break;
          
        default:
          console.log('loadUserData: Unknown role:', userRole);
      }

      // Create full profile
      const profile: FullProfile = {
        user: { ...userData },
        patient: patientData,
        doctor: doctorData,
        laboratory: laboratoryData
      };
      
      console.log('loadUserData: Setting user profile');
      setUserProfile(profile);
      
      // Only fetch medical records if user is a patient
      if (userRole === 'patient' && patientData) {
        try {
          console.log('loadUserData: Loading medical records');
          const records = await api.patient.getMedicalRecords(token);
          setMedicalRecords(records || []);
          console.log('loadUserData: Loaded', records?.length || 0, 'medical records');
        } catch (recordsErr: any) {
          console.warn('Could not load medical records:', recordsErr);
          setMedicalRecords([]);
        }
      } else {
        setMedicalRecords([]);
      }
      
      // Mark as loaded successfully
      hasLoadedRef.current = true;
      
      // Check if profile was just completed
      const needsProfile = localStorage.getItem('needsProfileCompletion');
      console.log('loadUserData: Needs profile completion?', needsProfile);
      
      if (needsProfile === 'true' && userRole === 'user') {
        console.log('loadUserData: Profile completion in progress');
      } else if (needsProfile === 'true' && userRole !== 'user') {
        localStorage.removeItem('needsProfileCompletion');
        localStorage.removeItem('pendingRole');
        console.log('loadUserData: Cleared profile completion flags');
      }
      
    } catch (err: any) {
      console.error('loadUserData: Failed to load user data:', err);
      
      // Check if it's a permission error
      if (err.message?.includes('Access denied') || 
          err.message?.includes('403') ||
          err.message?.includes('not found') ||
          err.message?.includes('404')) {
        console.log('loadUserData: User needs profile completion');
        
        const authDataStr = localStorage.getItem('authData');
        if (authDataStr) {
          const authData = JSON.parse(authDataStr);
          const basicProfile: FullProfile = {
            user: authData.user,
            patient: null,
            doctor: null,
            laboratory: null
          };
          setUserProfile(basicProfile);
        }
      } else {
        console.error('loadUserData: Authentication error, logging out:', err);
        logout();
      }
    } finally {
      isLoadingRef.current = false;
      setLoading(false);
      console.log('loadUserData: Completed');
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    localStorage.removeItem('token');
    localStorage.removeItem('authData');
    localStorage.removeItem('pendingRole');
    localStorage.removeItem('needsProfileCompletion');
    setToken(null);
    setUserProfile(null);
    setMedicalRecords([]);
    setError('');
    setSuccessMsg('');
    isLoadingRef.current = false;
    hasLoadedRef.current = false;
  };

  const clearError = () => setError('');
  const clearSuccess = () => setSuccessMsg('');

  // CRITICAL FIX: useEffect should only run once on mount
  useEffect(() => {
    console.log('AuthContext: Mounting/Token changed', token);
    
    if (token && !hasLoadedRef.current) {
      console.log('AuthContext: Initial load of user data');
      loadUserData();
    }
    
    // Cleanup function
    return () => {
      console.log('AuthContext: Unmounting');
    };
  }, [token]); // Only runs when token changes

  return (
    <AuthContext.Provider value={{
      token,
      userProfile,
      medicalRecords,
      loading,
      error,
      successMsg,
      login,
      register,
      logout,
      loadUserData,
      clearError,
      clearSuccess
    }}>
      {children}
    </AuthContext.Provider>
  );
};