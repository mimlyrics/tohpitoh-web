// components/patient/PatientDashboard.tsx - COMPLETE UPDATED VERSION
import React, { useState, useEffect, useRef } from 'react';
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
  Eye,
  FileDown,
  Printer,
  Mail,
  Phone,
  MapPin,
  Hash,
  Edit,
  FlaskConical,
  AlertTriangle,
  Stethoscope,
  UserCheck
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Loader2 } from 'lucide-react';

interface PatientDashboardProps {
  activeTab: string;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({ activeTab }) => {
  const { token, userProfile, medicalRecords } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    activePrescriptions: 0,
    pendingTests: 0,
    totalRecords: 0,
    sharedRecords: 0
  });
  
  const [profileData, setProfileData] = useState({
    date_of_birth: '',
    gender: '',
    blood_type: '',
    genotype: '',
    known_allergies: '',
    known_diseases: '',
    height: '',
    weight: '',
    emergency_access_enabled: false,
    emergency_access_code: ''
  });
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    if (token && activeTab && userProfile?.user.role === 'patient') {
      loadPatientData();
      if (userProfile.patient) {
        setProfileData({
          date_of_birth: userProfile.patient.date_of_birth || '',
          gender: userProfile.patient.gender || '',
          blood_type: userProfile.patient.blood_type || '',
          genotype: userProfile.patient.genotype || '',
          known_allergies: userProfile.patient.known_allergies || '',
          known_diseases: userProfile.patient.known_diseases || '',
          height: userProfile.patient.height || '',
          weight: userProfile.patient.weight || '',
          emergency_access_enabled: userProfile.patient.emergency_access_enabled || false,
          emergency_access_code: userProfile.patient.emergency_access_code || ''
        });
      }
    }
  }, [token, activeTab, userProfile]);

  const loadPatientData = async () => {
    if (!token || !userProfile || userProfile.user.role !== 'patient') return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'profile':
          // Profile tab doesn't need extra data
          break;
          
        case 'summary':
          const [prescriptionsData, labTestsData] = await Promise.all([
            api.patient.getPrescriptions(token).catch(() => []),
            api.patient.getLabTests(token).catch(() => [])
          ]);
          setPrescriptions(prescriptionsData);
          setLabTests(labTestsData);
          
          const activePrescriptions = prescriptionsData.filter(p => p.isActive).length;
          const pendingTests = labTestsData.filter(t => 
            t.status === 'pending' || t.status === 'in_progress'
          ).length;
          const sharedRecords = medicalRecords.filter(r => r.is_shared).length;
          
          setStats({
            activePrescriptions,
            pendingTests,
            totalRecords: medicalRecords.length,
            sharedRecords
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
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!token) return;
    
    try {
      await api.patient.updateProfile(token, profileData);
      setIsEditingProfile(false);
      // Refresh user profile
      if (userProfile?.patient) {
        // Update local profile data
        setProfileData({
          ...profileData
        });
      }
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile');
    }
  };

  // ==================== PDF GENERATION FUNCTIONS ====================

  const generateProfilePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147);
    doc.text('PATIENT PROFILE', 105, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Basic Information
    doc.text('Personal Information:', 14, 40);
    doc.text(`Name: ${userProfile?.user.first_name} ${userProfile?.user.last_name}`, 20, 50);
    doc.text(`Email: ${userProfile?.user.email}`, 20, 60);
    doc.text(`Phone: ${userProfile?.user.phone || 'Not provided'}`, 20, 70);
    
    // Medical Information
    doc.text('Medical Information:', 14, 90);
    doc.text(`Date of Birth: ${profileData.date_of_birth || 'Not provided'}`, 20, 100);
    doc.text(`Gender: ${profileData.gender || 'Not provided'}`, 20, 110);
    doc.text(`Blood Type: ${profileData.blood_type || 'Unknown'}`, 20, 120);
    doc.text(`Genotype: ${profileData.genotype || 'Unknown'}`, 20, 130);
    
    // Physical Stats
    if (profileData.height || profileData.weight) {
      doc.text('Physical Statistics:', 14, 150);
      doc.text(`Height: ${profileData.height || 'Not recorded'} cm`, 20, 160);
      doc.text(`Weight: ${profileData.weight || 'Not recorded'} kg`, 20, 170);
    }
    
    // Medical History
    if (profileData.known_allergies || profileData.known_diseases) {
      doc.text('Medical History:', 14, 190);
      if (profileData.known_allergies) {
        doc.text(`Allergies: ${profileData.known_allergies}`, 20, 200);
      }
      if (profileData.known_diseases) {
        doc.text(`Chronic Conditions: ${profileData.known_diseases}`, 20, 210);
      }
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 280);
    doc.text('Confidential Medical Document', 105, 280, { align: 'center' });
    
    doc.save(`Patient_Profile_${userProfile?.user.first_name}_${userProfile?.user.last_name}.pdf`);
  };

const generateHealthSummaryPDF = () => {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Header
  doc.setFontSize(24);
  doc.setTextColor(40, 53, 147);
  doc.text('HEALTH SUMMARY', 105, yPos, { align: 'center' });
  yPos += 15;
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`${userProfile?.user.first_name} ${userProfile?.user.last_name}`, 105, yPos, { align: 'center' });
  yPos += 10;
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, yPos, { align: 'center' });
  yPos += 20;
  
  // Quick Stats - Simple table without autoTable
  doc.setFontSize(16);
  doc.text('Overview', 14, yPos);
  yPos += 10;
  
  doc.setFontSize(11);
  
  // Create a simple table manually
  const statsData = [
    ['Total Medical Records', stats.totalRecords.toString()],
    ['Active Prescriptions', stats.activePrescriptions.toString()],
    ['Pending Lab Tests', stats.pendingTests.toString()],
    ['Shared Records', stats.sharedRecords.toString()]
  ];
  
  let tableY = yPos;
  statsData.forEach(([metric, count], index) => {
    doc.text(metric, 14, tableY);
    doc.text(count, 160, tableY, { align: 'right' });
    tableY += 8;
  });
  
  yPos = tableY + 15;
  
  // Recent Medical Records (limit to show without autoTable)
  if (medicalRecords.length > 0) {
    doc.setFontSize(16);
    doc.text('Recent Medical Records', 14, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    medicalRecords.slice(0, 5).forEach((record, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.text(`${index + 1}. ${record.title}`, 14, yPos);
      doc.setFontSize(8);
      doc.text(`${formatDate(record.date)} • ${record.record_type}`, 20, yPos + 5);
      yPos += 12;
    });
  }
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This is a summary document. For complete records, consult your healthcare provider.', 
    105, 280, { align: 'center' });
  
  doc.save(`Health_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
};

  // ==================== RENDER FUNCTIONS ====================

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          My Profile
        </h1>
        <div className="flex space-x-2">
          {!isEditingProfile && (
            <>
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center hover:bg-blue-700"
              >
                <Edit className="w-5 h-5 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={generateProfilePDF}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
              >
                <FileDown className="w-5 h-5 mr-2" />
                Export PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Personal Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Personal Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400">Full Name</label>
                <p className="font-medium text-slate-800 dark:text-white">
                  {userProfile?.user.first_name} {userProfile?.user.last_name}
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400">Email</label>
                <p className="font-medium text-slate-800 dark:text-white">
                  {userProfile?.user.email}
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-slate-500 dark:text-slate-400">Phone</label>
                <p className="font-medium text-slate-800 dark:text-white">
                  {userProfile?.user.phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Medical Info */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Medical Information
            </h3>
            
            {isEditingProfile ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={profileData.date_of_birth}
                      onChange={(e) => setProfileData({...profileData, date_of_birth: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Gender</label>
                    <select
                      value={profileData.gender}
                      onChange={(e) => setProfileData({...profileData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Blood Type</label>
                    <select
                      value={profileData.blood_type}
                      onChange={(e) => setProfileData({...profileData, blood_type: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="">Unknown</option>
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
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Genotype</label>
                    <select
                      value={profileData.genotype}
                      onChange={(e) => setProfileData({...profileData, genotype: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    >
                      <option value="">Unknown</option>
                      <option value="AA">AA</option>
                      <option value="AS">AS</option>
                      <option value="AC">AC</option>
                      <option value="SS">SS</option>
                      <option value="SC">SC</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Height (cm)</label>
                    <input
                      type="number"
                      value={profileData.height}
                      onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={profileData.weight}
                      onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Known Allergies</label>
                  <input
                    type="text"
                    value={profileData.known_allergies}
                    onChange={(e) => setProfileData({...profileData, known_allergies: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="e.g., Penicillin, Peanuts, Dust"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-500 dark:text-slate-400 mb-1">Chronic Conditions</label>
                  <input
                    type="text"
                    value={profileData.known_diseases}
                    onChange={(e) => setProfileData({...profileData, known_diseases: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                    placeholder="e.g., Hypertension, Diabetes, Asthma"
                  />
                </div>
                
                <div className="flex space-x-4 pt-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Date of Birth</label>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {profileData.date_of_birth || 'Not provided'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Gender</label>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {profileData.gender || 'Not provided'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Blood Type</label>
                    <p className="font-medium text-slate-800 dark:text-white flex items-center">
                      <Droplets className="w-4 h-4 mr-2" />
                      {profileData.blood_type || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Genotype</label>
                    <p className="font-medium text-slate-800 dark:text-white flex items-center">
                      <Hash className="w-4 h-4 mr-2" />
                      {profileData.genotype || 'Unknown'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Height</label>
                    <p className="font-medium text-slate-800 dark:text-white flex items-center">
                      <Scale className="w-4 h-4 mr-2" />
                      {profileData.height || 'Not recorded'} cm
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Weight</label>
                    <p className="font-medium text-slate-800 dark:text-white flex items-center">
                      <Scale className="w-4 h-4 mr-2" />
                      {profileData.weight || 'Not recorded'} kg
                    </p>
                  </div>
                </div>
                
                {profileData.known_allergies && (
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Known Allergies</label>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {profileData.known_allergies}
                    </p>
                  </div>
                )}
                
                {profileData.known_diseases && (
                  <div>
                    <label className="block text-sm text-slate-500 dark:text-slate-400">Chronic Conditions</label>
                    <p className="font-medium text-slate-800 dark:text-white">
                      {profileData.known_diseases}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Access Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Emergency Access
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-600 dark:text-slate-300">
              Emergency access is {profileData.emergency_access_enabled ? 'enabled' : 'disabled'}
            </p>
            {profileData.emergency_access_enabled && profileData.emergency_access_code && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Access code: {profileData.emergency_access_code}
              </p>
            )}
          </div>
          <button className="px-4 py-2 bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-400 rounded-lg">
            Configure
          </button>
        </div>
      </div>
    </div>
  );

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
          <div className="flex items-center space-x-2">
            <button 
              onClick={generateHealthSummaryPDF}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Export PDF
            </button>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Medical Records</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.totalRecords}
              </p>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Active Medications</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.activePrescriptions}
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Tests</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.pendingTests}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <ClipboardList className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Shared Records</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.sharedRecords}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <Share2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Medical Records */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Recent Medical Records</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400">View All</button>
          </div>
          
          {medicalRecords.slice(0, 5).map((record) => (
            <div key={record.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  record.record_type === 'prescription' ? 'bg-blue-100 dark:bg-blue-900/50' :
                  record.record_type === 'consultation' ? 'bg-green-100 dark:bg-green-900/50' :
                  'bg-purple-100 dark:bg-purple-900/50'
                }`}>
                  <FileText className={`w-4 h-4 ${
                    record.record_type === 'prescription' ? 'text-blue-600 dark:text-blue-400' :
                    record.record_type === 'consultation' ? 'text-green-600 dark:text-green-400' :
                    'text-purple-600 dark:text-purple-400'
                  }`} />
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">{record.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(record.date)} • {record.record_type}
                  </p>
                </div>
              </div>
              <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                <Eye className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">Active Medications</h3>
            <button className="text-sm text-blue-600 dark:text-blue-400">View All</button>
          </div>
          
          {prescriptions.filter(p => p.isActive).slice(0, 5).map((prescription) => (
            <div key={prescription.id} className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/50">
                  <Pill className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-slate-800 dark:text-white">{prescription.medication_name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {prescription.dosage} • {prescription.frequency}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                prescription.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
              }`}>
                {prescription.isActive ? 'Active' : 'Completed'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Medical History
        </h2>
        {medicalRecords.length > 0 && (
          <button 
            onClick={generateHealthSummaryPDF}
            className="px-4 py-3 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export PDF
          </button>
        )}
      </div>

      {medicalRecords.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Medical Records Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            You don't have any medical records yet. Visit a healthcare provider to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {medicalRecords.map((record) => (
            <div key={record.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.record_type === 'consultation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      record.record_type === 'diagnosis' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      record.record_type === 'prescription' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                    }`}>
                      {record.record_type?.toUpperCase()}
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
                  
                  {record.description && (
                    <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {record.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(record.date)}
                    </div>
                    {record.doctor && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        Dr. {record.doctor.first_name} {record.doctor.last_name}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                    <Eye className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderMedicationsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          My Medications
        </h2>
        {prescriptions.length > 0 && (
          <button 
            onClick={generateHealthSummaryPDF}
            className="px-4 py-3 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export List
          </button>
        )}
      </div>
      
      {prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <Pill className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Prescriptions
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            You don't have any active prescriptions. Talk to your doctor about medication needs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {prescription.doctor ? `Dr. ${prescription.doctor.first_name}` : 'Unknown doctor'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  prescription.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {prescription.isActive ? 'Active' : 'Completed'}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Dosage</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {prescription.dosage || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Frequency</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {prescription.frequency || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Duration</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {prescription.duration || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Prescribed</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {formatDate(prescription.prescribed_date)}
                  </span>
                </div>
              </div>
              
              {prescription.instructions && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg mb-4">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Instructions: </span>
                    {prescription.instructions}
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                  Set Reminder
                </button>
                <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTestsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Laboratory Tests
        </h2>
        {labTests.length > 0 && (
          <button 
            onClick={generateHealthSummaryPDF}
            className="px-4 py-3 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export Results
          </button>
        )}
      </div>
      
      {labTests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <FlaskConical className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Lab Tests
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            You don't have any lab test results. Your doctor may order tests as needed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {labTests.map((test) => (
            <div key={test.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${
                    test.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50' :
                    test.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/50' :
                    'bg-red-100 dark:bg-red-900/50'
                  }`}>
                    <FlaskConical className={`w-6 h-6 ${
                      test.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      test.status === 'pending' ? 'text-amber-600 dark:text-amber-400' :
                      'text-red-600 dark:text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {test.test_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {test.test_type} • {test.laboratory?.name || 'Unknown lab'}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  test.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400' :
                  test.status === 'pending' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-400'
                }`}>
                  {test.status?.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Ordered Date</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {formatDate(test.ordered_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Results Date</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {test.results_date ? formatDate(test.results_date) : 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Priority</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {test.priority?.toUpperCase() || 'NORMAL'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Doctor</p>
                  <p className="font-medium text-slate-800 dark:text-white">
                    {test.doctor ? `Dr. ${test.doctor.first_name}` : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {test.results && (
                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg mb-4">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Results
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {test.results}
                  </p>
                </div>
              )}
              
              {test.notes && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-4">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Notes: </span>
                    {test.notes}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg">
                  View Details
                </button>
                {test.results && (
                  <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
                    Download Results
                  </button>
                )}
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

  if (userProfile?.user.role !== 'patient') {
    return (
      <div className="text-center py-12">
        <User className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          Patient Dashboard Not Available
        </h3>
        <p className="text-slate-500 dark:text-slate-400">
          This dashboard is only available for patients.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(() => {
        switch (activeTab) {
          case 'profile':
            return renderProfileTab();
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
      })()}
    </div>
  );
};

// Helper functions
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return 'Invalid Date';
  }
};