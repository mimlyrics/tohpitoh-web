// components/doctor/DoctorDashboard.tsx (updated with modals)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';
import { CreateMedicalRecord } from './CreateMedicalRecord';
import { WritePrescription } from './WritePrescription';
import { OrderLabTest } from './OrderLabTest';
import { Patient, MedicalRecord, Prescription, LabTest } from '../../types';
import {
  Users,
  FileText,
  Stethoscope,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  MessageSquare,
  TrendingUp,
  Activity,
  Bell,
  UserCheck,
  UserX,
  Pill,
  Download,
  Edit,
  X
} from 'lucide-react';

interface DoctorDashboardProps {
  activeTab: string;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ activeTab }) => {
  const { token, userProfile } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalPatients: 0,
    todayAppointments: 0,
    pendingReports: 0,
    completedConsultations: 0
  });

  // Modal states
  const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
  const [showWritePrescriptionModal, setShowWritePrescriptionModal] = useState(false);
  const [showOrderLabTestModal, setShowOrderLabTestModal] = useState(false);

  useEffect(() => {
    if (token && activeTab) {
      loadDoctorData();
    }
  }, [token, activeTab]);

// Update the loadDoctorData function:
const loadDoctorData = async () => {
  if (!token) return;
  
  setLoading(true);
  try {
    switch (activeTab) {
      case 'patients':
        const patientsResponse = await api.doctor.getPatients(token);
        // Check if response has nested data structure
        const patientsData = patientsResponse.data?.patients || patientsResponse.patients || patientsResponse;
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setStats(prev => ({ 
          ...prev, 
          totalPatients: Array.isArray(patientsData) ? patientsData.length : 0 
        }));
        break;
        
      case 'consultations':
        const recordsResponse = await api.doctor.getMedicalRecords(token);
        const recordsData = recordsResponse.data?.records || recordsResponse.data || recordsResponse;
        setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
        break;
        
      case 'prescriptions':
        const prescriptionsResponse = await api.doctor.getDoctorPrescriptions(token);
        const prescriptionsData = prescriptionsResponse.data?.prescriptions || prescriptionsResponse.data || prescriptionsResponse;
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
        break;
        
      case 'lab-tests':
        const testsResponse = await api.doctor.getDoctorLabTests(token);
        const testsData = testsResponse.data?.tests || testsResponse.data || testsResponse;
        setLabTests(Array.isArray(testsData) ? testsData : []);
        break;
        
      case 'schedule':
        // Load appointments/schedule
        break;
    }
    
  } catch (err) {
    console.error('Failed to load doctor data:', err);
    // Set empty arrays on error
    setPatients([]);
    setMedicalRecords([]);
    setPrescriptions([]);
    setLabTests([]);
  } finally {
    setLoading(false);
  }
};

// Also update your filteredPatients calculation to handle null/undefined:
const filteredPatients = (patients || []).filter(patient => {
  if (!patient || !patient.user) return false;
  
  const searchLower = searchTerm.toLowerCase();
  const firstName = patient.user.first_name?.toLowerCase() || '';
  const lastName = patient.user.last_name?.toLowerCase() || '';
  const email = patient.user.email?.toLowerCase() || '';
  const phone = patient.user.phone?.toLowerCase() || '';
  
  return firstName.includes(searchLower) ||
         lastName.includes(searchLower) ||
         email.includes(searchLower) ||
         phone.includes(searchLower);
});
  const handleActionSuccess = () => {
    loadDoctorData();
  };

  const renderPatientsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            My Patients
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your patients and their health records
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateRecordModal(true)}
            className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center"
          >
            <FileText className="w-5 h-5 mr-2" />
            New Record
          </button>
          <button
            onClick={() => setShowWritePrescriptionModal(true)}
            className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center"
          >
            <Pill className="w-5 h-5 mr-2" />
            Prescribe
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search patients by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            Sort
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Patients</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.totalPatients}
              </p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        
        {/* ... other stat cards ... */}
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Patients Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            No patients match your search criteria. Try a different search term.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-6 py-3 bg-secondary text-white rounded-lg font-medium"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white">
              Patients ({filteredPatients.length})
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredPatients.slice(0, 10).map((patient) => (
              <div key={patient.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Users className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        {patient.user.first_name} {patient.user.last_name}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ID: P-{patient.id.toString().padStart(4, '0')}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {patient.user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        // View patient details
                        console.log('View patient:', patient.id);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      title="View Profile"
                    >
                      <Stethoscope className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => {
                        // Message patient
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      title="Message"
                    >
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => {
                        // View patient records
                      }}
                      className="px-4 py-2 bg-secondary text-white rounded-lg font-medium"
                    >
                      View Records
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowCreateRecordModal(true)}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">New Consultation</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create medical record</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setShowWritePrescriptionModal(true)}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
              <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Write Prescription</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Prescribe medication</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setShowOrderLabTestModal(true)}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <ClipboardList className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Order Lab Test</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Request laboratory test</p>
            </div>
          </div>
        </button>
      </div>

      {/* Modals */}
      {showCreateRecordModal && token && userProfile?.doctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CreateMedicalRecord
              token={token}
              doctorId={userProfile.doctor.id}
              onSuccess={() => {
                handleActionSuccess();
                setShowCreateRecordModal(false);
              }}
              onClose={() => setShowCreateRecordModal(false)}
            />
          </div>
        </div>
      )}

      {showWritePrescriptionModal && token && userProfile?.doctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <WritePrescription
              token={token}
              doctorId={userProfile.doctor.id}
              onSuccess={() => {
                handleActionSuccess();
                setShowWritePrescriptionModal(false);
              }}
              onClose={() => setShowWritePrescriptionModal(false)}
            />
          </div>
        </div>
      )}

      {showOrderLabTestModal && token && userProfile?.doctor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <OrderLabTest
              token={token}
              doctorId={userProfile.doctor.id}
              onSuccess={() => {
                handleActionSuccess();
                setShowOrderLabTestModal(false);
              }}
              onClose={() => setShowOrderLabTestModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );

  // ... rest of the DoctorDashboard.tsx code remains the same ...

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-secondary dark:text-indigo-400" size={32} />
      </div>
    );
  }

  switch (activeTab) {
    case 'patients':
      return renderPatientsTab();
    case 'consultations':
      // Render consultations tab
      return <div>Consultations Tab</div>;
    case 'prescriptions':
      // Render prescriptions tab
      return <div>Prescriptions Tab</div>;
    case 'lab-tests':
      // Render lab tests tab
      return <div>Lab Tests Tab</div>;
    case 'schedule':
      return (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            Appointment Schedule
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Schedule management coming soon...
          </p>
        </div>
      );
    default:
      return renderPatientsTab();
  }
};