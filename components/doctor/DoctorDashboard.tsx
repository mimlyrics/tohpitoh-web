// components/doctor/DoctorDashboard.tsx (UPDATED VERSION - NO CONSULTATIONS/APPOINTMENTS)
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
  Activity,
  Bell,
  UserCheck,
  UserX,
  Pill,
  Download,
  Edit,
  X,
  Building2,
  LucideBriefcaseMedical,
  FlaskConical,
  HeartPulse
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

  // Modal states
  const [showCreateRecordModal, setShowCreateRecordModal] = useState(false);
  const [showWritePrescriptionModal, setShowWritePrescriptionModal] = useState(false);
  const [showOrderLabTestModal, setShowOrderLabTestModal] = useState(false);

  useEffect(() => {
    if (token && activeTab) {
      loadDoctorData();
    }
  }, [token, activeTab]);

// In DoctorDashboard.tsx - update the loadDoctorData function
const loadDoctorData = async () => {
  if (!token) return;
  
  setLoading(true);
  try {
    switch (activeTab) {
      case 'patients':
        const patientsData = await api.doctor.getPatients(token);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        break;
        
      case 'medical-records':
        const recordsData = await api.doctor.getMedicalRecords(token);
        console.log(medicalRecords);
        setMedicalRecords(Array.isArray(recordsData) ? recordsData : []);
        break;
        
      case 'prescriptions':
        const prescriptionsData = await api.doctor.getPrescriptions(token);
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
        break;
        
      case 'lab-tests':
        const testsData = await api.doctor.getLabTests(token);
        setLabTests(Array.isArray(testsData) ? testsData : []);
        break;
    }
    
  } catch (err) {
    console.error('Failed to load doctor data:', err);
    // Set empty arrays on error
    if (activeTab === 'patients') setPatients([]);
    if (activeTab === 'medical-records') setMedicalRecords([]);
    if (activeTab === 'prescriptions') setPrescriptions([]);
    if (activeTab === 'lab-tests') setLabTests([]);
  } finally {
    setLoading(false);
  }
};
  const handleActionSuccess = () => {
    loadDoctorData();
  };

  // Filter patients by search term
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
            className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center hover:bg-indigo-700 transition-colors"
          >
            <FileText className="w-5 h-5 mr-2" />
            New Medical Record
          </button>
          <button
            onClick={() => setShowWritePrescriptionModal(true)}
            className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center hover:bg-indigo-700 transition-colors"
          >
            <Pill className="w-5 h-5 mr-2" />
            New Prescription
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
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
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
                {patients.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
              <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Medical Records</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {medicalRecords.length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <LucideBriefcaseMedical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active Prescriptions</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {prescriptions.filter(p => p.isActive).length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
              <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Lab Tests</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {labTests.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            {patients.length === 0 ? 'No Patients Yet' : 'No Patients Found'}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {patients.length === 0 
              ? 'Start by creating a medical record for your first patient.' 
              : 'No patients match your search criteria. Try a different search term.'}
          </p>
          {patients.length === 0 ? (
            <button
              onClick={() => setShowCreateRecordModal(true)}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Create First Medical Record
            </button>
          ) : (
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Clear Search
            </button>
          )}
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
                        {patient.user?.first_name} {patient.user?.last_name}
                      </h4>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          ID: P-{patient.id.toString().padStart(4, '0')}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          {patient.user?.email}
                        </span>
                        {patient.user?.phone && (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {patient.user.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        // View patient details
                        console.log('View patient:', patient.id);
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="View Profile"
                    >
                      <Stethoscope className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => {
                        // View patient medical records
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Medical Records"
                    >
                      <LucideBriefcaseMedical className="w-5 h-5 text-slate-400" />
                    </button>
                    <button
                      onClick={() => {
                        // Write prescription for this patient
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Prescribe"
                    >
                      <Pill className="w-5 h-5 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredPatients.length > 10 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center">
              <button className="text-secondary hover:text-indigo-700 font-medium">
                View All Patients ({filteredPatients.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowCreateRecordModal(true)}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Medical Record</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create new medical record</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setShowWritePrescriptionModal(true)}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
              <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Prescription</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Write new prescription</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => setShowOrderLabTestModal(true)}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <FlaskConical className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Lab Test</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Order laboratory test</p>
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

  const renderMedicalRecordsTab = () => {
    // Sort medical records by date (newest first)
    const sortedRecords = [...medicalRecords].sort((a, b) => 
      new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    );

    // Get unique patient count
    const uniquePatients = new Set(medicalRecords.map(record => record.patient_id)).size;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Medical Records
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              View and manage patient medical records
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateRecordModal(true)}
              className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center hover:bg-indigo-700"
            >
              <FileText className="w-5 h-5 mr-2" />
              New Record
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Records</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {medicalRecords.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <LucideBriefcaseMedical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Today's Records</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {medicalRecords.filter(record => {
                    const today = new Date().toDateString();
                    const recordDate = new Date(record.date || record.createdAt).toDateString();
                    return recordDate === today;
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Shared Records</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {medicalRecords.filter(record => record.is_shared).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                <UserCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Patients</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {uniquePatients}
                </p>
              </div>
              <div className="p-3 rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Records List */}
        {sortedRecords.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <FileMedical className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              No Medical Records
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              You haven't created any medical records yet. Start by creating your first record.
            </p>
            <button
              onClick={() => setShowCreateRecordModal(true)}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Create First Record
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Recent Medical Records ({sortedRecords.length})
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {sortedRecords.slice(0, 10).map((record) => (
                <div key={record.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.record_type === 'consultation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                          record.record_type === 'diagnosis' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          record.record_type === 'lab_report' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                          record.record_type === 'prescription' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                        }`}>
                          {record.record_type?.replace('_', ' ').toUpperCase()}
                        </span>
                        {record.is_shared && (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-medium">
                            SHARED
                          </span>
                        )}
                      </div>
                      
                      <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-2">
                        {record.title}
                      </h4>
                      
                      <p className="text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                        {record.description || 'No description provided'}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(record.date || record.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {record.patient?.user && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {record.patient.user.first_name} {record.patient.user.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          // View record details
                          console.log('View record:', record.id);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FileText className="w-5 h-5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          // Edit record
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {sortedRecords.length > 10 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center">
                <button className="text-secondary hover:text-indigo-700 font-medium">
                  View All Records ({sortedRecords.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPrescriptionsTab = () => {
    // Sort prescriptions by date (newest first)
    const sortedPrescriptions = [...prescriptions].sort((a, b) => 
      new Date(b.prescribed_date || b.createdAt).getTime() - new Date(a.prescribed_date || a.createdAt).getTime()
    );

    // Filter active prescriptions
    const activePrescriptions = sortedPrescriptions.filter(p => p.isActive);
    const completedPrescriptions = sortedPrescriptions.filter(p => !p.isActive);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Prescriptions
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage patient prescriptions and medications
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowWritePrescriptionModal(true)}
              className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center hover:bg-indigo-700"
            >
              <Pill className="w-5 h-5 mr-2" />
              New Prescription
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Prescriptions</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {prescriptions.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {activePrescriptions.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {completedPrescriptions.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-900/50">
                <FileText className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Today's</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {prescriptions.filter(pres => {
                    const today = new Date().toDateString();
                    const presDate = new Date(pres.prescribed_date || pres.createdAt).toDateString();
                    return presDate === today;
                  }).length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
                <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Active/Completed */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button className={`px-4 py-2 font-medium ${
            activePrescriptions.length > 0 
              ? 'text-secondary border-b-2 border-secondary' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            Active ({activePrescriptions.length})
          </button>
          <button className={`px-4 py-2 font-medium ${
            completedPrescriptions.length > 0 
              ? 'text-slate-800 dark:text-white border-b-2 border-slate-800 dark:border-white' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            Completed ({completedPrescriptions.length})
          </button>
        </div>

        {/* Prescriptions List */}
        {activePrescriptions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <Pill className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              No Active Prescriptions
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              You haven't prescribed any medications yet. Create your first prescription.
            </p>
            <button
              onClick={() => setShowWritePrescriptionModal(true)}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Write First Prescription
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Active Prescriptions
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {activePrescriptions.slice(0, 10).map((prescription) => (
                <div key={prescription.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                          {prescription.diagnosis || 'Prescription'}
                        </h4>
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 text-xs font-medium">
                          ACTIVE
                        </span>
                      </div>
                      
                      {/* Medications */}
                      {prescription.medications && prescription.medications.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Medications:</p>
                          <div className="space-y-2">
                            {prescription.medications.slice(0, 3).map((med, index) => (
                              <div key={index} className="text-sm text-slate-600 dark:text-slate-400">
                                • {med.medication_name} - {med.dosage} ({med.frequency}) for {med.duration}
                              </div>
                            ))}
                            {prescription.medications.length > 3 && (
                              <div className="text-sm text-slate-500 dark:text-slate-500">
                                + {prescription.medications.length - 3} more medications
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Prescribed: {new Date(prescription.prescribed_date).toLocaleDateString()}
                        </div>
                        {prescription.expiry_date && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Expires: {new Date(prescription.expiry_date).toLocaleDateString()}
                          </div>
                        )}
                        {prescription.patient?.user && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {prescription.patient.user.first_name} {prescription.patient.user.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          // View prescription details
                          console.log('View prescription:', prescription.id);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FileText className="w-5 h-5 text-slate-400" />
                      </button>
                      <button
                        onClick={() => {
                          // Print prescription
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Print"
                      >
                        <Download className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {activePrescriptions.length > 10 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center">
                <button className="text-secondary hover:text-indigo-700 font-medium">
                  View All Prescriptions ({activePrescriptions.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLabTestsTab = () => {
    // Sort lab tests by date (newest first)
    const sortedTests = [...labTests].sort((a, b) => 
      new Date(b.ordered_date || b.createdAt).getTime() - new Date(a.ordered_date || a.createdAt).getTime()
    );

    // Filter by status
    const pendingTests = sortedTests.filter(test => test.status === 'pending');
    const inProgressTests = sortedTests.filter(test => test.status === 'in_progress');
    const completedTests = sortedTests.filter(test => test.status === 'completed');
    const cancelledTests = sortedTests.filter(test => test.status === 'cancelled');

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Laboratory Tests
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Manage laboratory test orders and results
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowOrderLabTestModal(true)}
              className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center hover:bg-indigo-700"
            >
              <FlaskConical className="w-5 h-5 mr-2" />
              Order Test
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total Tests</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {labTests.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                <FlaskConical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {pendingTests.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {inProgressTests.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900/50">
                <Activity className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
                <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                  {completedTests.length}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <button className={`px-4 py-2 font-medium whitespace-nowrap ${
            pendingTests.length > 0 
              ? 'text-yellow-600 dark:text-yellow-400 border-b-2 border-yellow-600 dark:border-yellow-400' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            Pending ({pendingTests.length})
          </button>
          <button className={`px-4 py-2 font-medium whitespace-nowrap ${
            inProgressTests.length > 0 
              ? 'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            In Progress ({inProgressTests.length})
          </button>
          <button className={`px-4 py-2 font-medium whitespace-nowrap ${
            completedTests.length > 0 
              ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            Completed ({completedTests.length})
          </button>
          <button className={`px-4 py-2 font-medium whitespace-nowrap ${
            cancelledTests.length > 0 
              ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400' 
              : 'text-slate-500 dark:text-slate-400'
          }`}>
            Cancelled ({cancelledTests.length})
          </button>
        </div>

        {/* Tests List */}
        {pendingTests.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
            <FlaskConical className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
              No Pending Tests
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              You haven't ordered any lab tests yet. Order your first test.
            </p>
            <button
              onClick={() => setShowOrderLabTestModal(true)}
              className="px-6 py-3 bg-secondary text-white rounded-lg font-medium hover:bg-indigo-700"
            >
              Order First Test
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Pending Tests
              </h3>
            </div>
            
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {pendingTests.slice(0, 10).map((test) => (
                <div key={test.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-slate-800 dark:text-white text-lg">
                          {test.test_name}
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          test.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          test.priority === 'stat' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                        }`}>
                          {test.priority?.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-3 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <span className="capitalize">{test.test_type?.replace('_', ' ')}</span>
                        </div>
                        {test.laboratory && (
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 mr-1" />
                            {test.laboratory.lab_name || test.laboratory.name}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Ordered: {new Date(test.ordered_date || test.createdAt).toLocaleDateString()}
                        </div>
                        {test.patient?.user && (
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {test.patient.user.first_name} {test.patient.user.last_name}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          // View test details
                          console.log('View test:', test.id);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FileText className="w-5 h-5 text-slate-400" />
                      </button>
                      {test.status === 'pending' && (
                        <button
                          onClick={() => {
                            // Cancel test
                          }}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"
                          title="Cancel Test"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {pendingTests.length > 10 && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-700 text-center">
                <button className="text-secondary hover:text-indigo-700 font-medium">
                  View All Tests ({pendingTests.length})
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

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
    case 'medical-records':
      return renderMedicalRecordsTab();
    case 'prescriptions':
      return renderPrescriptionsTab();
    case 'lab-tests':
      return renderLabTestsTab();
    default:
      return renderPatientsTab();
  }
};