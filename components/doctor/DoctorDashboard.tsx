// components/doctor/DoctorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { Loader2 } from 'lucide-react';
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
  Edit
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

  useEffect(() => {
    if (token && activeTab) {
      loadDoctorData();
    }
  }, [token, activeTab]);

  const loadDoctorData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'patients':
          // In a real app, you'd have an endpoint to get doctor's patients
          // For now, we'll simulate with empty data
          setPatients([]);
          break;
          
        case 'consultations':
          // Load medical records created by this doctor
          const records = await api.doctor.getMedicalRecordStats(token);
          setMedicalRecords(records);
          break;
          
        case 'prescriptions':
          const prescriptionsData = await api.doctor.getDoctorPrescriptions(token);
          setPrescriptions(prescriptionsData);
          break;
          
        case 'lab-tests':
          const testsData = await api.doctor.getDoctorLabTests(token);
          setLabTests(testsData);
          break;
          
        case 'schedule':
          // Load appointments/schedule
          break;
      }
      
      // Load overall stats
      const statsData = await api.doctor.getMedicalRecordStats(token);
      // You would parse statsData to set your stats
      
    } catch (err) {
      console.error('Failed to load doctor data:', err);
    } finally {
      setLoading(false);
    }
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
        <button className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center justify-center">
          <Plus className="w-5 h-5 mr-2" />
          New Patient
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search patients by name, ID, or condition..."
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
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Today's Appointments</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.todayAppointments}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Reports</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.pendingReports}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <Clock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.completedConsultations}
              </p>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Patients List */}
      {patients.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Patients Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Start by adding your first patient or wait for patients to be assigned to you.
          </p>
          <button className="px-6 py-3 bg-secondary text-white rounded-lg font-medium">
            Add First Patient
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-800 dark:text-white">
              Recent Patients
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100 dark:divide-slate-700">
            {patients.slice(0, 5).map((patient) => (
              <div key={patient.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        {patient.user?.avatar ? (
                          <img src={patient.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users className="w-7 h-7 text-slate-500 dark:text-slate-400" />
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800" />
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
                          Age: {patient.date_of_birth ? calculateAge(patient.date_of_birth) : 'N/A'}
                        </span>
                        {patient.blood_type && patient.blood_type !== 'unknown' && (
                          <span className="text-sm text-red-600 dark:text-red-400 font-medium">
                            Blood: {patient.blood_type}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="View Profile">
                      <Stethoscope className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg" title="Message">
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                    </button>
                    <button className="px-4 py-2 bg-secondary text-white rounded-lg font-medium">
                      View Records
                    </button>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Active Meds</p>
                    <p className="font-bold text-slate-800 dark:text-white">3</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Last Visit</p>
                    <p className="font-bold text-slate-800 dark:text-white">2 days ago</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Next Appointment</p>
                    <p className="font-bold text-slate-800 dark:text-white">Tomorrow</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors">
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
        
        <button className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors">
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
        
        <button className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-secondary transition-colors">
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
    </div>
  );

  const renderConsultationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Consultations
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View and manage patient consultations
          </p>
        </div>
        <button className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Consultation
        </button>
      </div>

      {/* Consultation Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">8</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">This Week</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">42</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">156</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">12</p>
          </div>
        </div>
      </div>

      {/* Consultation List */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-white">
            Recent Consultations
          </h3>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <Users className="w-6 h-6 text-slate-500" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-white">
                        John Smith
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Follow-up consultation • Hypertension
                      </p>
                    </div>
                  </div>
                  
                  <div className="ml-15 space-y-2">
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Calendar className="w-4 h-4 mr-2" />
                      Today, 10:30 AM
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-slate-300">
                      <Clock className="w-4 h-4 mr-2" />
                      Duration: 25 minutes
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3">
                      Patient reported improved blood pressure control. Medication adjusted.
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-3 ml-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded-full text-sm font-medium">
                    Completed
                  </span>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <Edit className="w-4 h-4 text-slate-400" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <Download className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrescriptionsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Prescriptions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage and track prescribed medications
          </p>
        </div>
        <button className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          New Prescription
        </button>
      </div>

      {/* Prescription Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">24</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Today</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">5</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">This Month</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">89</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Expiring Soon</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">7</p>
          </div>
        </div>
      </div>

      {/* Prescription List */}
      <div className="space-y-4">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/50">
                  <Pill className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    Lisinopril 10mg
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    For: John Smith • Hypertension
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Dosage</p>
                <p className="font-medium text-slate-800 dark:text-white">10mg daily</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</p>
                <p className="font-medium text-slate-800 dark:text-white">30 days</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Started</p>
                <p className="font-medium text-slate-800 dark:text-white">Dec 1, 2024</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ends</p>
                <p className="font-medium text-slate-800 dark:text-white">Dec 31, 2024</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                Extend
              </button>
              <button className="px-4 py-2 text-sm bg-secondary text-white rounded-lg">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderLabTestsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Lab Tests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Order and track laboratory tests
          </p>
        </div>
        <button className="px-4 py-3 bg-secondary text-white rounded-lg font-medium flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Order Test
        </button>
      </div>

      {/* Lab Test Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">8</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">4</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">42</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">Awaiting Review</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">3</p>
          </div>
        </div>
      </div>

      {/* Lab Test List */}
      <div className="space-y-4">
        {[1, 2, 3].map((_, index) => (
          <div key={index} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                  <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    Complete Blood Count (CBC)
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    For: Sarah Johnson • Routine Checkup
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400 rounded-full text-sm font-medium">
                Completed
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ordered</p>
                <p className="font-medium text-slate-800 dark:text-white">Dec 10, 2024</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Completed</p>
                <p className="font-medium text-slate-800 dark:text-white">Dec 12, 2024</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Laboratory</p>
                <p className="font-medium text-slate-800 dark:text-white">Central Lab</p>
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-4">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">
                Results Summary
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                All parameters within normal range. No abnormalities detected.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                View Details
              </button>
              <button className="px-4 py-2 text-sm bg-secondary text-white rounded-lg">
                Add Interpretation
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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
      return renderConsultationsTab();
    case 'prescriptions':
      return renderPrescriptionsTab();
    case 'lab-tests':
      return renderLabTestsTab();
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

// Helper function
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