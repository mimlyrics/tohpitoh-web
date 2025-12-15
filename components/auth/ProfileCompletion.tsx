// components/auth/ProfileCompletion.tsx
import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Scale, 
  Activity, 
  AlertTriangle, 
  FileText, 
  Building,
  Hash,
  Stethoscope,
  ShieldCheck,
  Loader2,
  CheckCircle,
  XCircle,
  User,
  Heart,
  Droplets,
  Dna
} from 'lucide-react';

interface ProfileCompletionProps {
  targetRole: UserRole;
  onComplete: () => void;
  onSkip?: () => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({ 
  targetRole, 
  onComplete,
  onSkip 
}) => {
  const { token, userProfile, loadUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Patient form
  const [patientData, setPatientData] = useState({
    date_of_birth: '',
    gender: 'male',
    height: '',
    weight: '',
    blood_group: 'unknown',
    genotype: 'unknown',
    known_allergies: '',
    known_diseases: '',
    emergency_access_enabled: false,
    emergency_access_code: ''
  });

  // Doctor form
  const [doctorData, setDoctorData] = useState({
    specialization: '',
    license_number: '',
    hospital_affiliation: ''
  });

  // Lab form
  const [labData, setLabData] = useState({
    lab_name: '',
    license_number: '',
    address: ''
  });

  useEffect(() => {
    // Clear localStorage flags
    localStorage.removeItem('pendingRole');
    localStorage.removeItem('needsProfileCompletion');
  }, []);

  const handlePatientChange = (field: string, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  const handleDoctorChange = (field: string, value: string) => {
    setDoctorData(prev => ({ ...prev, [field]: value }));
  };

  const handleLabChange = (field: string, value: string) => {
    setLabData(prev => ({ ...prev, [field]: value }));
  };

// In ProfileCompletion.tsx handleSubmit function
const handleSubmit = async () => {
  if (!token) return;
  
  setLoading(true);
  setError('');
  setSuccess('');

  try {
    // Update the role in localStorage BEFORE calling API
    const authDataStr = localStorage.getItem('authData');
    if (authDataStr) {
      const authData = JSON.parse(authDataStr);
      
      switch (targetRole) {
        case UserRole.PATIENT:
          authData.user.role = 'patient';
          break;
        case UserRole.DOCTOR:
          authData.user.role = 'doctor';
          break;
        case UserRole.LAB:
          authData.user.role = 'laboratory';
          break;
      }
      
      localStorage.setItem('authData', JSON.stringify(authData));
    }
    
    // Then call the API
    switch (targetRole) {
      case UserRole.PATIENT:
        await api.patient.updateProfile(token, patientData);
        break;
      case UserRole.DOCTOR:
        await api.doctor.updateMyProfile(token, doctorData);
        break;
      case UserRole.LAB:
        await api.laboratory.updateMyProfile(token, labData);
        break;
    }
    
    setSuccess('Profile completed successfully!');
    
    // Clear flags
    localStorage.removeItem('needsProfileCompletion');
    localStorage.removeItem('pendingRole');
    
    // Force reload of user data with new role
    if (onComplete) {
      onComplete();
    }
    
  } catch (err: any) {
    setError(err.message || 'Failed to complete profile');
  } finally {
    setLoading(false);
  }
};
  const renderPatientForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Complete Your Health Profile
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Help us provide better care by sharing your health information
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Date of Birth
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="date"
              value={patientData.date_of_birth}
              onChange={(e) => handlePatientChange('date_of_birth', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Gender
          </label>
          <select
            value={patientData.gender}
            onChange={(e) => handlePatientChange('gender', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Height (cm)
          </label>
          <div className="relative">
            <Activity className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="number"
              placeholder="170"
              value={patientData.height}
              onChange={(e) => handlePatientChange('height', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Weight (kg)
          </label>
          <div className="relative">
            <Scale className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="number"
              placeholder="70"
              value={patientData.weight}
              onChange={(e) => handlePatientChange('weight', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Blood Type
          </label>
          <div className="relative">
            <Droplets className="absolute left-3 top-2.5 text-red-400" size={16} />
            <select
              value={patientData.blood_group}
              onChange={(e) => handlePatientChange('blood_group', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="unknown">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Genotype
          </label>
          <div className="relative">
            <Dna className="absolute left-3 top-2.5 text-purple-400" size={16} />
            <select
              value={patientData.genotype}
              onChange={(e) => handlePatientChange('genotype', e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
            >
              <option value="unknown">Unknown</option>
              <option value="AA">AA</option>
              <option value="AS">AS</option>
              <option value="AC">AC</option>
              <option value="SS">SS</option>
              <option value="SC">SC</option>
              <option value="CC">CC</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Known Allergies
        </label>
        <textarea
          placeholder="List any allergies (separate with commas)"
          value={patientData.known_allergies}
          onChange={(e) => handlePatientChange('known_allergies', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[80px]"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Known Diseases/Conditions
        </label>
        <textarea
          placeholder="List any chronic diseases or conditions"
          value={patientData.known_diseases}
          onChange={(e) => handlePatientChange('known_diseases', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[80px]"
        />
      </div>

      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center space-x-3">
          <Heart className="text-blue-600 dark:text-blue-400" size={20} />
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-white">
              Emergency Access
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Allow emergency access to your records
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={patientData.emergency_access_enabled}
            onChange={(e) => handlePatientChange('emergency_access_enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {patientData.emergency_access_enabled && (
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
            Emergency Access Code (6 digits)
          </label>
          <input
            type="text"
            placeholder="123456"
            maxLength={6}
            value={patientData.emergency_access_code}
            onChange={(e) => handlePatientChange('emergency_access_code', e.target.value.replace(/\D/g, ''))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
      )}
    </div>
  );

  const renderDoctorForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-3">
          <Stethoscope className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Complete Your Professional Profile
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your profile requires admin approval before activation
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Specialization
        </label>
        <input
          type="text"
          placeholder="e.g., Cardiology, Pediatrics, Neurology"
          value={doctorData.specialization}
          onChange={(e) => handleDoctorChange('specialization', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Medical License Number
        </label>
        <div className="relative">
          <Hash className="absolute left-3 top-2.5 text-indigo-400" size={16} />
          <input
            type="text"
            placeholder="e.g., MED-12345"
            value={doctorData.license_number}
            onChange={(e) => handleDoctorChange('license_number', e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Hospital/Clinic Affiliation
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-2.5 text-indigo-400" size={16} />
          <input
            type="text"
            placeholder="e.g., General Hospital, City Clinic"
            value={doctorData.hospital_affiliation}
            onChange={(e) => handleDoctorChange('hospital_affiliation', e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Important Notice
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Your profile will be submitted for admin approval. You will receive notification once approved. Until then, some features may be limited.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLabForm = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          Complete Your Laboratory Profile
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your profile requires admin approval before activation
        </p>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Laboratory Name
        </label>
        <input
          type="text"
          placeholder="e.g., Central Medical Laboratory"
          value={labData.lab_name}
          onChange={(e) => handleLabChange('lab_name', e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Accreditation/License Number
        </label>
        <div className="relative">
          <Hash className="absolute left-3 top-2.5 text-emerald-400" size={16} />
          <input
            type="text"
            placeholder="e.g., LAB-98765"
            value={labData.license_number}
            onChange={(e) => handleLabChange('license_number', e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
          Address
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-2.5 text-emerald-400" size={16} />
          <textarea
            placeholder="Full laboratory address"
            value={labData.address}
            onChange={(e) => handleLabChange('address', e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[80px]"
          />
        </div>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/50">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Important Notice
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Your laboratory profile will be submitted for admin approval. You will receive notification once approved. Until then, you cannot process lab tests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-100 dark:border-slate-700">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className={`flex items-center ${targetRole ? 'text-primary' : 'text-slate-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${targetRole ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium">Account</span>
          </div>
          <div className="flex-1 h-0.5 mx-3 bg-primary"></div>
          <div className="flex items-center text-primary">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              2
            </div>
            <span className="ml-2 text-sm font-medium">Profile</span>
          </div>
        </div>
        <p className="text-xs text-center text-slate-500 dark:text-slate-400">
          Step 2 of 2: Complete your {targetRole.toLowerCase()} profile
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-sm flex items-center">
          <CheckCircle className="w-4 h-4 mr-2" />
          {success}
        </div>
      )}

      {/* Form */}
      {targetRole === UserRole.PATIENT && renderPatientForm()}
      {targetRole === UserRole.DOCTOR && renderDoctorForm()}
      {targetRole === UserRole.LAB && renderLabForm()}

      {/* Action Buttons */}
      <div className="mt-8 space-y-3">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-medium text-white transition-colors flex items-center justify-center ${
            targetRole === UserRole.PATIENT ? 'bg-primary hover:bg-blue-600' :
            targetRole === UserRole.DOCTOR ? 'bg-secondary hover:bg-indigo-600' :
            'bg-accent hover:bg-emerald-600'
          } ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Complete Profile'
          )}
        </button>

        {onSkip && (
          <button
            onClick={onSkip}
            className="w-full py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};