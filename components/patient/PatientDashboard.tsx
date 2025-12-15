// components/patient/PatientDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { MedicalRecord, Prescription, LabTest } from '../../types';
import { 
  Activity, 
  FileText, 
  Pill, 
  ClipboardList, 
  Shield, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Heart,
  Droplets,
  Scale,
  User,
  Download,
  Share2,
  Eye
} from 'lucide-react';

interface PatientDashboardProps {
  activeTab: string;
}
import { Loader2 } from 'lucide-react';
export const PatientDashboard: React.FC<PatientDashboardProps> = ({ activeTab }) => {
  const { token, userProfile, medicalRecords } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    activePrescriptions: 0,
    pendingTests: 0,
    totalRecords: 0,
    upcomingAppointments: 0
  });

// components/patient/PatientDashboard.tsx - Fix useEffect
useEffect(() => {
  if (token && activeTab && userProfile?.user.role === 'patient') {
    const loadData = async () => {
      await loadPatientData();
    };
    loadData();
  }
}, [token, activeTab, userProfile?.user?.role]); // Add role as dependency

// components/patient/PatientDashboard.tsx (updated loadPatientData)
const loadPatientData = async () => {
  if (!token || !userProfile) return;
  
  // ONLY load patient data if user role is 'patient'
  if (userProfile.user.role !== 'patient') {
    setPrescriptions([]);
    setLabTests([]);
    setStats({
      activePrescriptions: 0,
      pendingTests: 0,
      totalRecords: 0,
      upcomingAppointments: 0
    });
    setLoading(false);
    return;
  }
  
  setLoading(true);
  try {
    switch (activeTab) {
      case 'summary':
        // Load prescriptions and lab tests for summary
        const [prescriptionsData, labTestsData] = await Promise.all([
          api.patient.getPrescriptions(token).catch(() => []),
          api.patient.getLabTests(token).catch(() => [])
        ]);
        setPrescriptions(prescriptionsData);
        setLabTests(labTestsData);
        
        // Calculate stats
        const activePrescriptions = prescriptionsData.filter(p => p.isActive).length;
        const pendingTests = labTestsData.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
        
        setStats({
          activePrescriptions,
          pendingTests,
          totalRecords: medicalRecords.length,
          upcomingAppointments: 0
        });
        break;
        
      case 'history':
        // Already have medicalRecords from context
        break;
        
      case 'medications':
        const medsData = await api.patient.getPrescriptions(token).catch(() => []);
        setPrescriptions(medsData);
        break;
        
      case 'tests':
        const testsData = await api.patient.getLabTests(token).catch(() => []);
        setLabTests(testsData);
        break;
    }
  } catch (err) {
    console.error('Failed to load patient data:', err);
    // Don't show error to user, just show empty state
  } finally {
    setLoading(false);
  }
};
  const renderSummaryTab = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {userProfile?.user.first_name}!
            </h1>
            <p className="text-blue-100 mt-1">
              Here's your health overview
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active Meds</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {stats.activePrescriptions}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Tests</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {stats.pendingTests}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <ClipboardList className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Health Records</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {stats.totalRecords}
              </p>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <FileText className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Upcoming</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">
                {stats.upcomingAppointments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Health Profile Card */}
      {userProfile?.patient && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Health Profile
            </h3>
            <button className="text-sm text-primary dark:text-blue-400 font-medium">
              Edit
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {userProfile.patient.height && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Height</p>
                <p className="font-bold text-slate-800 dark:text-white">
                  {userProfile.patient.height} cm
                </p>
              </div>
            )}
            
            {userProfile.patient.weight && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mx-auto mb-2">
                  <Scale className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                <p className="font-bold text-slate-800 dark:text-white">
                  {userProfile.patient.weight} kg
                </p>
              </div>
            )}
            
            {userProfile.patient.blood_type && userProfile.patient.blood_type !== 'unknown' && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center mx-auto mb-2">
                  <Droplets className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Blood Type</p>
                <p className="font-bold text-slate-800 dark:text-white">
                  {userProfile.patient.blood_type}
                </p>
              </div>
            )}
            
            {userProfile.patient.date_of_birth && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Age</p>
                <p className="font-bold text-slate-800 dark:text-white">
                  {calculateAge(userProfile.patient.date_of_birth)} years
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Medications */}
      {prescriptions.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Recent Medications
            </h3>
            <button className="text-sm text-primary dark:text-blue-400 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {prescriptions.slice(0, 3).map((prescription) => (
              <div key={prescription.id} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-750 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    prescription.isActive 
                      ? 'bg-green-100 dark:bg-green-900/50' 
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    <Pill className={`w-5 h-5 ${
                      prescription.isActive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {prescription.medication_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {prescription.dosage} • {prescription.frequency}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Until {prescription.end_date || 'N/A'}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    prescription.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {prescription.isActive ? 'Active' : 'Completed'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Lab Tests */}
      {labTests.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Recent Lab Tests
            </h3>
            <button className="text-sm text-primary dark:text-blue-400 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {labTests.slice(0, 3).map((test) => (
              <div key={test.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <ClipboardList className="w-5 h-5 text-slate-400" />
                    <p className="font-medium text-slate-800 dark:text-white">
                      {test.test_name}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    test.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                      : test.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                  }`}>
                    {test.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="text-slate-600 dark:text-slate-300">
                    Ordered: {formatDate(test.ordered_date)}
                  </div>
                  {test.status === 'completed' && (
                    <button className="flex items-center text-primary dark:text-blue-400">
                      <Download className="w-4 h-4 mr-1" />
                      Results
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Medical History
        </h2>
        <div className="flex space-x-2">
          <button className="px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            Filter
          </button>
          <button className="px-3 py-2 text-sm bg-primary text-white rounded-lg">
            + Add Record
          </button>
        </div>
      </div>

      {medicalRecords.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <p className="text-slate-500 dark:text-slate-400">No medical records found</p>
          <button className="mt-3 text-primary dark:text-blue-400 font-medium">
            Upload your first record
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {medicalRecords.map((record) => (
            <div key={record.id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      record.record_type === 'prescription' 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                        : record.record_type === 'diagnosis'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                        : record.record_type === 'consultation'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-400'
                    }`}>
                      {record.record_type}
                    </span>
                    {record.is_shared && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400">
                        Shared
                      </span>
                    )}
                  </div>
                  
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                    {record.title}
                  </h4>
                  
                  {record.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
                      {record.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-slate-500 dark:text-slate-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(record.date)}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {record.doctor_id && (
                        <div className="flex items-center text-slate-500 dark:text-slate-400">
                          <User className="w-4 h-4 mr-1" />
                          Dr. {record.doctor?.first_name}
                        </div>
                      )}
                      
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        .<Eye className="w-4 h-4 text-slate-400" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <Download className="w-4 h-4 text-slate-400" />.
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMedicationsTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
        Medications
      </h2>
      
      {prescriptions.length === 0 ? (
        <div className="text-center py-12">
          <Pill className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <p className="text-slate-500 dark:text-slate-400">No prescriptions found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    prescription.isActive 
                      ? 'bg-green-100 dark:bg-green-900/50' 
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}>
                    <Pill className={`w-6 h-6 ${
                      prescription.isActive 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {prescription.medication_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Prescribed by Dr. {prescription.doctor?.first_name}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  prescription.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {prescription.isActive ? 'Active' : 'Completed'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Dosage</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {prescription.dosage || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Frequency</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {prescription.frequency || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {prescription.duration || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">End Date</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {prescription.end_date || 'N/A'}
                  </p>
                </div>
              </div>
              
              {prescription.instructions && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Instructions
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {prescription.instructions}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 mt-4">
                <button className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                  Reminder
                </button>
                <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg">
                  Mark as Taken
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTestsTab = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white">
        Lab Tests
      </h2>
      
      {labTests.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <p className="text-slate-500 dark:text-slate-400">No lab tests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {labTests.map((test) => (
            <div key={test.id} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <ClipboardList className="w-5 h-5 text-primary dark:text-blue-400" />
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {test.test_name}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                    <span>Lab: {test.laboratory?.lab_name || 'N/A'}</span>
                    <span>Ordered: {formatDate(test.ordered_date)}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  test.status === 'completed' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : test.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400'
                    : test.status === 'cancelled'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400'
                }`}>
                  {test.status.replace('_', ' ')}
                </span>
              </div>
              
              {test.status === 'completed' && test.results && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-4">
                  <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Results
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line">
                    {test.results}
                  </p>
                  {test.doctor_interpretation && (
                    <>
                      <p className="font-medium text-slate-700 dark:text-slate-300 mt-3 mb-2">
                        Doctor's Interpretation
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {test.doctor_interpretation}
                      </p>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                {test.result_file_url && (
                  <button className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download Report
                  </button>
                )}
                <button className="px-4 py-2 text-sm bg-primary text-white rounded-lg">
                  Share Results
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary dark:text-blue-400" size={32} />
      </div>
    );
  }

  switch (activeTab) {
    case 'summary':
      return renderSummaryTab();
    case 'history':
      return renderHistoryTab();
    case 'medications':
      return renderMedicationsTab();
    case 'tests':
      return renderTestsTab();
    default:
      return renderSummaryTab();
  }
};

// Helper functions
const calculateAge = (dateOfBirth: string): number => {
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};