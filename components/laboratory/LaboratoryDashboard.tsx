// components/laboratory/LaboratoryDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { LabTest, Laboratory, Prescription, MedicalRecord, User, Doctor, Patient } from '../../types';
import { 
  FlaskConical, 
  FileText, 
  User as UserIcon, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Upload, 
  Eye, 
  Edit, 
  X, 
  Plus,
  BarChart3,
  TrendingUp,
  Users,
  Building,
  MapPin,
  Phone,
  Mail,
  Shield,
  Loader2,
  Pill,
  Stethoscope,
  FileDown,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';

// Define the props interface
interface LaboratoryDashboardProps {
  activeTab: string;
}

// Define local interfaces if not in your types file
interface LabTestStatusCounts {
  [key: string]: number;
}

interface UpdateResultsData {
  results: string;
  status: string;
  result_file_url: string;
  notes: string;
}

interface LaboratoryStats {
  totalTests: number;
  pendingTests: number;
  inProgressTests: number;
  completedTests: number;
  totalPrescribed: number;
}

export const LaboratoryDashboard: React.FC<LaboratoryDashboardProps> = ({ activeTab }) => {
  const { token, userProfile } = useAuth();
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [prescribedExams, setPrescribedExams] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState<LaboratoryStats>({
    totalTests: 0,
    pendingTests: 0,
    inProgressTests: 0,
    completedTests: 0,
    totalPrescribed: 0
  });

  // Modal states
  const [showUpdateResultsModal, setShowUpdateResultsModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
  const [resultsData, setResultsData] = useState<UpdateResultsData>({
    results: '',
    status: 'completed',
    result_file_url: '',
    notes: ''
  });

  useEffect(() => {
    if (token && activeTab) {
      loadLaboratoryData();
    }
  }, [token, activeTab]);

  const loadLaboratoryData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      switch (activeTab) {
        case 'dashboard':
          // Load all data for dashboard
          const [testsData, examsData] = await Promise.all([
            api.laboratory.getLaboratoryTests(token).catch(() => []),
            api.laboratory.getPrescribedExams(token).catch(() => [])
          ]);
          
          setLabTests(Array.isArray(testsData) ? testsData : []);
          setPrescribedExams(Array.isArray(examsData) ? examsData : []);
          
          // Calculate statistics
          const pendingTests = (Array.isArray(testsData) ? testsData : []).filter((t: LabTest) => t.status === 'pending').length;
          const inProgressTests = (Array.isArray(testsData) ? testsData : []).filter((t: LabTest) => t.status === 'in_progress').length;
          const completedTests = (Array.isArray(testsData) ? testsData : []).filter((t: LabTest) => t.status === 'completed').length;
          
          setStats({
            totalTests: Array.isArray(testsData) ? testsData.length : 0,
            pendingTests,
            inProgressTests,
            completedTests,
            totalPrescribed: Array.isArray(examsData) ? examsData.length : 0
          });
          break;
          
        case 'tests':
          const testsResponse = await api.laboratory.getLaboratoryTests(token).catch(() => []);
          setLabTests(Array.isArray(testsResponse) ? testsResponse : []);
          break;
          
        case 'prescribed-exams':
          const examsResponse = await api.laboratory.getPrescribedExams(token).catch(() => []);
          setPrescribedExams(Array.isArray(examsResponse) ? examsResponse : []);
          break;
          
        case 'profile':
          // Profile data loaded from context
          break;
      }
    } catch (err) {
      console.error('Failed to load laboratory data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateResults = async () => {
    if (!selectedTest || !token) return;
    
    try {
      await api.laboratory.updateTestResults(token, selectedTest.id, resultsData);
      setShowUpdateResultsModal(false);
      setSelectedTest(null);
      setResultsData({
        results: '',
        status: 'completed',
        result_file_url: '',
        notes: ''
      });
      loadLaboratoryData();
    } catch (err) {
      console.error('Failed to update results:', err);
    }
  };

  const handleDepositResults = async (examId: number) => {
    if (!token) return;
    
    try {
      await api.laboratory.depositResults(token, {
        exam_id: examId,
        results: "Results deposited successfully",
        status: 'completed'
      });
      loadLaboratoryData();
    } catch (err) {
      console.error('Failed to deposit results:', err);
    }
  };

  // PDF Generation Functions
  const generateTestReportPDF = (test: LabTest) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147);
    doc.text('LABORATORY TEST REPORT', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Laboratory Information
    doc.text('Laboratory Information:', 14, 35);
    doc.text(`${userProfile?.laboratory?.name || 'Laboratory'}`, 20, 45);
    if (userProfile?.laboratory?.address) {
      doc.text(`Address: ${userProfile.laboratory.address}`, 20, 55);
    }
    if (userProfile?.laboratory?.phone) {
      doc.text(`Phone: ${userProfile.laboratory.phone}`, 20, 65);
    }
    
    // Test Information
    doc.text('Test Details:', 14, 85);
    doc.text(`Test Name: ${test.test_name}`, 20, 95);
    doc.text(`Test Type: ${test.test_type || 'N/A'}`, 20, 105);
    doc.text(`Status: ${test.status}`, 20, 115);
    doc.text(`Ordered Date: ${formatDate(test.ordered_date)}`, 20, 125);
    doc.text(`Priority: ${test.priority || 'Normal'}`, 20, 135);
    
    // Patient Information
    if (test.patient) {
      doc.text('Patient Information:', 14, 155);
      doc.text(`Name: ${test.patient.user?.first_name} ${test.patient.user?.last_name}`, 20, 165);
      if (test.patient.user?.email) {
        doc.text(`Email: ${test.patient.user.email}`, 20, 175);
      }
    }
    
    // Doctor Information
    if (test.doctor) {
      doc.text('Doctor Information:', 14, 195);
      doc.text(`Name: Dr. ${test.doctor.user?.first_name} ${test.doctor.user?.last_name}`, 20, 205);
    }
    
    // Results
    if (test.results) {
      doc.text('Test Results:', 14, 225);
      const splitResults = doc.splitTextToSize(test.results, 170);
      doc.text(splitResults, 20, 235);
    }
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Report Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 14, 280);
    doc.text('Confidential Laboratory Document', 105, 280, { align: 'center' });
    
    doc.save(`Lab_Report_${test.test_name?.replace(/\s+/g, '_') || 'test'}_${formatDate(test.ordered_date)}.pdf`);
  };

  const generateBatchReportPDF = (tests: LabTest[]) => {
    if (tests.length === 0) return;
    
    const doc = new jsPDF();
    
    // Cover Page
    doc.setFontSize(24);
    doc.setTextColor(40, 53, 147);
    doc.text('LABORATORY BATCH REPORT', 105, 50, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${userProfile?.laboratory?.name || 'Laboratory'}`, 105, 70, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Report Date: ${new Date().toLocaleDateString()}`, 105, 85, { align: 'center' });
    doc.text(`Total Tests: ${tests.length}`, 105, 95, { align: 'center' });
    
    let yPosition = 120;
    let page = 1;
    
    // Test List
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('TEST SUMMARY', 14, 20);
    
    yPosition = 30;
    tests.forEach((test, index) => {
      if (yPosition > 250) {
        doc.addPage();
        page++;
        yPosition = 20;
      }
      
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${test.test_name}`, 14, yPosition);
      
      doc.setFontSize(9);
      doc.text(`Patient: ${test.patient?.user?.first_name || ''} ${test.patient?.user?.last_name || ''}`, 20, yPosition + 7);
      doc.text(`Status: ${test.status} | Ordered: ${formatDate(test.ordered_date)}`, 20, yPosition + 14);
      doc.text(`Type: ${test.test_type || 'General'} | Priority: ${test.priority || 'Normal'}`, 20, yPosition + 21);
      
      yPosition += 35;
    });
    
    // Statistics Page
    doc.addPage();
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text('TEST STATISTICS', 14, 20);
    
    yPosition = 40;
    const statusCounts = tests.reduce((acc, test) => {
      const status = test.status || 'unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as LabTestStatusCounts);
    
    Object.entries(statusCounts).forEach(([status, count], index) => {
      doc.setFontSize(11);
      doc.text(`${status.toUpperCase()}: ${count} tests`, 20, yPosition);
      yPosition += 10;
    });
    
    // Footer on all pages
    for (let i = 1; i <= page; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${page}`, 105, 285, { align: 'center' });
      doc.text(userProfile?.laboratory?.name || 'Laboratory', 105, 290, { align: 'center' });
    }
    
    doc.save(`Laboratory_Batch_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Filter functions
  const filteredTests = labTests.filter(test => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      test.test_name?.toLowerCase().includes(searchLower) ||
      test.test_type?.toLowerCase().includes(searchLower) ||
      test.patient?.user?.first_name?.toLowerCase().includes(searchLower) ||
      test.patient?.user?.last_name?.toLowerCase().includes(searchLower) ||
      test.doctor?.user?.first_name?.toLowerCase().includes(searchLower) ||
      test.doctor?.user?.last_name?.toLowerCase().includes(searchLower) ||
      test.status?.toLowerCase().includes(searchLower)
    );
  });

  const filteredExams = prescribedExams.filter(exam => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      exam.medication_name?.toLowerCase().includes(searchLower) ||
      exam.patient?.user?.first_name?.toLowerCase().includes(searchLower) ||
      exam.patient?.user?.last_name?.toLowerCase().includes(searchLower) ||
      exam.doctor?.user?.first_name?.toLowerCase().includes(searchLower) ||
      exam.doctor?.user?.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const renderDashboardTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Laboratory Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Welcome, {userProfile?.laboratory?.name || 'Laboratory'}
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => generateBatchReportPDF(labTests)}
            disabled={labTests.length === 0}
            className="px-4 py-3 bg-primary text-white rounded-lg font-medium flex items-center hover:bg-blue-700 disabled:opacity-50"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export Report
          </button>
          <button className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium flex items-center hover:bg-emerald-700">
            <Plus className="w-5 h-5 mr-2" />
            New Test
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Tests</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.totalTests}
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
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.pendingTests}
              </p>
            </div>
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/50">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">In Progress</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.inProgressTests}
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
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.completedTests}
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Prescribed</p>
              <p className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
                {stats.totalPrescribed}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search tests or exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center hover:bg-slate-50 dark:hover:bg-slate-900">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
          <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
            Sort
          </button>
        </div>
      </div>

      {/* Recent Tests */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-white">
            Recent Lab Tests
          </h3>
          <button className="text-sm text-primary dark:text-blue-400 font-medium">
            View All
          </button>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {filteredTests.slice(0, 5).map((test) => (
            <div key={test.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    test.status === 'completed' ? 'bg-green-100 dark:bg-green-900/50' :
                    test.status === 'in_progress' ? 'bg-orange-100 dark:bg-orange-900/50' :
                    'bg-amber-100 dark:bg-amber-900/50'
                  }`}>
                    <FlaskConical className={`w-6 h-6 ${
                      test.status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      test.status === 'in_progress' ? 'text-orange-600 dark:text-orange-400' :
                      'text-amber-600 dark:text-amber-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <p className="font-bold text-slate-800 dark:text-white">
                        {test.test_name}
                      </p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                        test.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {test.priority?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        Patient: {test.patient?.user?.first_name} {test.patient?.user?.last_name}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        Ordered: {formatDate(test.ordered_date)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    test.status === 'completed' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                      : test.status === 'in_progress'
                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400'
                  }`}>
                    {test.status?.replace('_', ' ') || 'Unknown'}
                  </span>
                  
                  <div className="flex items-center space-x-2">
                    {test.status === 'completed' && (
                      <button
                        onClick={() => generateTestReportPDF(test)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-primary dark:text-blue-400"
                        title="Download PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                    )}
                    
                    {test.status !== 'completed' && (
                      <button
                        onClick={() => {
                          setSelectedTest(test);
                          setResultsData({
                            results: test.results || '',
                            status: 'completed',
                            result_file_url: '',
                            notes: ''
                          });
                          setShowUpdateResultsModal(true);
                        }}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400"
                        title="Update Results"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    
                    <button
                      onClick={() => {/* View details */}}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {/* Navigate to tests */}}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <FlaskConical className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Manage Tests</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">View and update lab tests</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => {/* Navigate to exams */}}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary hover:shadow-md transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/50">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Prescribed Exams</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">View prescribed lab exams</p>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => generateBatchReportPDF(labTests)}
          disabled={labTests.length === 0}
          className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-primary hover:shadow-md transition-all disabled:opacity-50"
        >
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <FileDown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-800 dark:text-white">Generate Reports</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Export test reports as PDF</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );

  const renderTestsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Laboratory Tests
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage and update lab test results
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => generateBatchReportPDF(labTests)}
            disabled={labTests.length === 0}
            className="px-4 py-3 bg-primary text-white rounded-lg font-medium flex items-center hover:bg-blue-700 disabled:opacity-50"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export All PDF
          </button>
          <button className="px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search tests by name, patient, or status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Status Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        <button className="px-4 py-2 font-medium whitespace-nowrap text-primary dark:text-blue-400 border-b-2 border-primary">
          All ({labTests.length})
        </button>
        <button className="px-4 py-2 font-medium whitespace-nowrap text-slate-500 dark:text-slate-400">
          Pending ({stats.pendingTests})
        </button>
        <button className="px-4 py-2 font-medium whitespace-nowrap text-slate-500 dark:text-slate-400">
          In Progress ({stats.inProgressTests})
        </button>
        <button className="px-4 py-2 font-medium whitespace-nowrap text-slate-500 dark:text-slate-400">
          Completed ({stats.completedTests})
        </button>
      </div>

      {/* Tests Table */}
      {filteredTests.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <FlaskConical className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Tests Found
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            {labTests.length === 0 
              ? 'No tests have been assigned to your laboratory yet.' 
              : 'No tests match your search criteria.'}
          </p>
          {labTests.length === 0 ? (
            <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700">
              Check for New Tests
            </button>
          ) : (
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50">
                <tr>
                  <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Test Details
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="py-3 px-6 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTests.map((test) => (
                  <tr key={test.id} className="hover:bg-slate-50 dark:hover:bg-slate-750">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-slate-800 dark:text-white">
                          {test.test_name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {test.test_type || 'General Test'} • Ordered: {formatDate(test.ordered_date)}
                        </p>
                        {test.doctor && (
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                            Doctor: Dr. {test.doctor.user?.first_name} {test.doctor.user?.last_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {test.patient ? (
                        <div>
                          <p className="font-medium text-slate-800 dark:text-white">
                            {test.patient.user?.first_name} {test.patient.user?.last_name}
                          </p>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {test.patient.user?.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500">N/A</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        test.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                          : test.status === 'in_progress'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400'
                      }`}>
                        {test.status?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        test.priority === 'urgent' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : test.priority === 'high'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                      }`}>
                        {test.priority?.toUpperCase() || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        {test.status === 'completed' ? (
                          <>
                            <button
                              onClick={() => generateTestReportPDF(test)}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-primary dark:text-blue-400"
                              title="Download PDF"
                            >
                              <FileDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedTest(test);
                                setResultsData({
                                  results: test.results || '',
                                  status: test.status || 'completed',
                                  result_file_url: '',
                                  notes: ''
                                });
                                setShowUpdateResultsModal(true);
                              }}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-emerald-600 dark:text-emerald-400"
                              title="Update Results"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedTest(test);
                              setResultsData({
                                results: '',
                                status: 'completed',
                                result_file_url: '',
                                notes: ''
                              });
                              setShowUpdateResultsModal(true);
                            }}
                            className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                          >
                            Enter Results
                          </button>
                        )}
                        
                        <button
                          onClick={() => {/* View details */}}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4 text-slate-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderPrescribedExamsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Prescribed Exams
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Exams prescribed by doctors for your laboratory
          </p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={() => {/* Generate PDF for exams */}}
            disabled={prescribedExams.length === 0}
            className="px-4 py-3 bg-primary text-white rounded-lg font-medium flex items-center hover:bg-blue-700 disabled:opacity-50"
          >
            <FileDown className="w-5 h-5 mr-2" />
            Export List
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Search exams by medication, patient, or doctor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
          <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
            No Prescribed Exams
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            No exams have been prescribed to your laboratory yet.
          </p>
          <button className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700">
            Refresh List
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/50">
                    <Pill className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                      {exam.medication_name}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Prescribed: {formatDate(exam.prescribed_date)}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  exam.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  {exam.isActive ? 'Active' : 'Completed'}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Patient:</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {exam.patient?.user?.first_name} {exam.patient?.user?.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Doctor:</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    Dr. {exam.doctor?.user?.first_name} {exam.doctor?.user?.last_name}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Dosage:</span>
                  <span className="font-medium text-slate-800 dark:text-white">
                    {exam.dosage || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => handleDepositResults(exam.id)}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  Deposit Results
                </button>
                <button className="px-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            Laboratory Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage your laboratory information
          </p>
        </div>
        <button className="px-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700">
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-6">
        <div className="flex items-start space-x-6">
          <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <Building className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {userProfile?.laboratory?.name || 'Your Laboratory'}
                </h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userProfile?.laboratory?.is_approved
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-400'
                  }`}>
                    {userProfile?.laboratory?.is_approved ? 'APPROVED' : 'PENDING APPROVAL'}
                  </span>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-400">
                    LABORATORY
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Contact Information</p>
                  <div className="space-y-2">
                    {userProfile?.laboratory?.address && (
                      <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        {userProfile.laboratory.address}
                      </div>
                    )}
                    {userProfile?.laboratory?.phone && (
                      <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4 mr-2 text-slate-400" />
                        {userProfile.laboratory.phone}
                      </div>
                    )}
                    {userProfile?.laboratory?.email && (
                      <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <Mail className="w-4 h-4 mr-2 text-slate-400" />
                        {userProfile.laboratory.email}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Specialization</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    {userProfile?.laboratory?.specialization || 'General Laboratory'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">License Information</p>
                  <p className="text-slate-700 dark:text-slate-300">
                    License: {userProfile?.laboratory?.license_number || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Account Statistics</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total Tests</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">{stats.totalTests}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
                      <p className="text-lg font-bold text-slate-800 dark:text-white">
                        {stats.pendingTests + stats.inProgressTests}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Update Results Modal
  const UpdateResultsModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Update Test Results
          </h3>
          <button
            onClick={() => {
              setShowUpdateResultsModal(false);
              setSelectedTest(null);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {selectedTest && (
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="font-medium text-slate-800 dark:text-white">
              {selectedTest.test_name}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Patient: {selectedTest.patient?.user?.first_name} {selectedTest.patient?.user?.last_name}
            </p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Test Results
            </label>
            <textarea
              value={resultsData.results}
              onChange={(e) => setResultsData({...resultsData, results: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter detailed test results..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={resultsData.status}
                onChange={(e) => setResultsData({...resultsData, status: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Result File URL (Optional)
              </label>
              <input
                type="text"
                value={resultsData.result_file_url}
                onChange={(e) => setResultsData({...resultsData, result_file_url: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://example.com/results.pdf"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={resultsData.notes}
              onChange={(e) => setResultsData({...resultsData, notes: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Additional notes..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={() => {
                setShowUpdateResultsModal(false);
                setSelectedTest(null);
              }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdateResults}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700"
            >
              Save Results
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-primary dark:text-blue-400" size={32} />
      </div>
    );
  }

  return (
    <>
      {showUpdateResultsModal && <UpdateResultsModal />}
      
      {/* Floating PDF Export Button */}
      {labTests.length > 0 && (
        <div className="fixed bottom-6 right-6 z-10">
          <button 
            onClick={() => generateBatchReportPDF(labTests)}
            className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl flex items-center"
            title="Export Test Reports"
          >
            <FileDown className="w-5 h-5 mr-2" />
            <span className="hidden md:inline">Export PDF</span>
          </button>
        </div>
      )}

      {(() => {
        switch (activeTab) {
          case 'dashboard':
            return renderDashboardTab();
          case 'tests':
            return renderTestsTab();
          case 'prescribed-exams':
            return renderPrescribedExamsTab();
          case 'profile':
            return renderProfileTab();
          default:
            return renderDashboardTab();
        }
      })()}
    </>
  );
};

// Helper function
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