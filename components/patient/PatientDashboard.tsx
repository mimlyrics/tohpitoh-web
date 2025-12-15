// components/patient/PatientDashboard.tsx - FULL UPDATED VERSION
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
  Mail
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  const [selectedRecords, setSelectedRecords] = useState<MedicalRecord[]>([]);
  const [selectedPrescriptions, setSelectedPrescriptions] = useState<Prescription[]>([]);
  
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token && activeTab && userProfile?.user.role === 'patient') {
      const loadData = async () => {
        await loadPatientData();
      };
      loadData();
    }
  }, [token, activeTab, userProfile?.user?.role]);

  const loadPatientData = async () => {
    if (!token || !userProfile) return;
    
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
          const [prescriptionsData, labTestsData] = await Promise.all([
            api.patient.getPrescriptions(token).catch(() => []),
            api.patient.getLabTests(token).catch(() => [])
          ]);
          setPrescriptions(prescriptionsData);
          setLabTests(labTestsData);
          
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

  // ==================== PDF GENERATION FUNCTIONS ====================

  const generateMedicalRecordPDF = async (record: MedicalRecord) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 53, 147);
    doc.text('MEDICAL RECORD', 105, 20, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    
    // Patient Information
    doc.text('Patient Information:', 14, 35);
    doc.text(`Name: ${userProfile?.user.first_name} ${userProfile?.user.last_name}`, 20, 45);
    doc.text(`Date of Birth: ${userProfile?.patient?.date_of_birth || 'N/A'}`, 20, 55);
    doc.text(`Blood Type: ${userProfile?.patient?.blood_type || 'Unknown'}`, 20, 65);
    
    // Record Information
    doc.text('Record Details:', 14, 80);
    doc.text(`Title: ${record.title}`, 20, 90);
    doc.text(`Type: ${record.record_type.toUpperCase()}`, 20, 100);
    doc.text(`Date: ${formatDate(record.date)}`, 20, 110);
    
    // Doctor Information
    if (record.doctor) {
      doc.text('Doctor Information:', 14, 125);
      doc.text(`Name: Dr. ${record.doctor.first_name} ${record.doctor.last_name}`, 20, 135);
    }
    
    // Description
    if (record.description) {
      doc.text('Description:', 14, 150);
      const splitDescription = doc.splitTextToSize(record.description, 170);
      doc.text(splitDescription, 20, 160);
    }
    
    // Footer
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 280);
    doc.text('This is an official medical record document', 105, 280, { align: 'center' });
    
    // Save PDF
    doc.save(`Medical_Record_${record.title.replace(/\s+/g, '_')}_${formatDate(record.date)}.pdf`);
  };

  const generatePrescriptionPDF = async (prescription: Prescription) => {
    const doc = new jsPDF();
    
    // Header with Red Cross
    doc.setFontSize(16);
    doc.setTextColor(220, 53, 69);
    doc.text('+', 20, 20);
    doc.setTextColor(40, 53, 147);
    doc.text('PRESCRIPTION', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    // Patient Info
    doc.text(`Patient: ${userProfile?.user.first_name} ${userProfile?.user.last_name}`, 14, 35);
    doc.text(`Date: ${formatDate(prescription.prescribed_date)}`, 14, 45);
    
    // Prescription Details
    doc.setFontSize(12);
    doc.text('Rx', 14, 60);
    
    doc.setFontSize(11);
    doc.text(`Medication: ${prescription.medication_name}`, 20, 75);
    doc.text(`Dosage: ${prescription.dosage || 'As prescribed'}`, 20, 85);
    doc.text(`Frequency: ${prescription.frequency || 'N/A'}`, 20, 95);
    doc.text(`Duration: ${prescription.duration || 'Until finished'}`, 20, 105);
    
    // Instructions
    if (prescription.instructions) {
      doc.text('Instructions:', 14, 120);
      const splitInstructions = doc.splitTextToSize(prescription.instructions, 170);
      doc.text(splitInstructions, 20, 130);
    }
    
    // Doctor Signature
    doc.text('______________________', 14, 200);
    doc.text(`Dr. ${prescription.doctor?.first_name} ${prescription.doctor?.last_name}`, 14, 210);
    doc.text('License: MD-12345', 14, 220);
    
    // Warnings
    doc.setFontSize(9);
    doc.setTextColor(220, 53, 69);
    doc.text('❗ Take as directed. Do not share medication.', 14, 240);
    doc.text('❗ Complete full course unless otherwise directed.', 14, 250);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Valid until: ' + (prescription.expiry_date || formatDate(prescription.prescribed_date)), 14, 280);
    
    doc.save(`Prescription_${prescription.medication_name.replace(/\s+/g, '_')}_${formatDate(prescription.prescribed_date)}.pdf`);
  };

  const generateComprehensivePDF = async (records: MedicalRecord[], prescriptions: Prescription[]) => {
    const doc = new jsPDF();
    
    // Cover Page
    doc.setFontSize(24);
    doc.setTextColor(40, 53, 147);
    doc.text('HEALTH SUMMARY REPORT', 105, 50, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`${userProfile?.user.first_name} ${userProfile?.user.last_name}`, 105, 70, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 105, 85, { align: 'center' });
    doc.text(`Total Records: ${records.length} | Active Prescriptions: ${prescriptions.filter(p => p.isActive).length}`, 105, 95, { align: 'center' });
    
    let yPosition = 120;
    let page = 1;
    
    // Medical Records Section
    if (records.length > 0) {
      doc.addPage();
      page++;
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('MEDICAL RECORDS', 14, 20);
      
      yPosition = 30;
      records.forEach((record, index) => {
        if (yPosition > 250) {
          doc.addPage();
          page++;
          yPosition = 20;
        }
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${record.title}`, 14, yPosition);
        doc.setFontSize(9);
        doc.text(`Type: ${record.record_type} | Date: ${formatDate(record.date)}`, 20, yPosition + 7);
        if (record.description) {
          const desc = doc.splitTextToSize(record.description, 170);
          doc.text(desc, 20, yPosition + 15);
          yPosition += 15 + (desc.length * 5);
        }
        yPosition += 25;
      });
    }
    
    // Prescriptions Section
    if (prescriptions.length > 0) {
      doc.addPage();
      page++;
      doc.setFontSize(18);
      doc.setTextColor(40, 53, 147);
      doc.text('PRESCRIPTIONS', 14, 20);
      
      yPosition = 30;
      prescriptions.forEach((prescription, index) => {
        if (yPosition > 250) {
          doc.addPage();
          page++;
          yPosition = 20;
        }
        
        doc.setFontSize(11);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${prescription.medication_name}`, 14, yPosition);
        doc.setFontSize(9);
        doc.text(`Status: ${prescription.isActive ? 'Active' : 'Completed'} | Prescribed: ${formatDate(prescription.prescribed_date)}`, 20, yPosition + 7);
        doc.text(`Dosage: ${prescription.dosage || 'N/A'} | Frequency: ${prescription.frequency || 'N/A'}`, 20, yPosition + 15);
        yPosition += 30;
      });
    }
    
    // Footer on all pages
    for (let i = 1; i <= page; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${page}`, 105, 285, { align: 'center' });
      doc.text('Confidential Medical Document', 105, 290, { align: 'center' });
    }
    
    doc.save(`Health_Summary_${userProfile?.user.first_name}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateAllRecordsPDF = async () => {
    await generateComprehensivePDF(medicalRecords, prescriptions);
  };

  // ==================== RENDER FUNCTIONS ====================

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
              onClick={generateAllRecordsPDF}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center transition-colors"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Export All PDF
            </button>
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <Heart className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats - Same as before */}
      {/* ... rest of your summary tab code ... */}
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Medical History
        </h2>
        <div className="flex space-x-2">
          {medicalRecords.length > 0 && (
            <button 
              onClick={() => generateComprehensivePDF(medicalRecords, [])}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
            >
              <FileDown className="w-4 h-4 mr-2" />
              Export PDF
            </button>
          )}
        </div>
      </div>

      {medicalRecords.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-3" size={48} />
          <p className="text-slate-500 dark:text-slate-400">No medical records found</p>
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
                      
                      <button 
                        onClick={() => generateMedicalRecordPDF(record)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center text-primary dark:text-blue-400"
                        title="Download PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                        <Eye className="w-4 h-4 text-slate-400" />
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">
          Medications
        </h2>
        {prescriptions.length > 0 && (
          <button 
            onClick={() => generateComprehensivePDF([], prescriptions)}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center hover:bg-emerald-700"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export All PDF
          </button>
        )}
      </div>
      
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
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    prescription.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-400'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                  }`}>
                    {prescription.isActive ? 'Active' : 'Completed'}
                  </span>
                  <button 
                    onClick={() => generatePrescriptionPDF(prescription)}
                    className="p-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400"
                    title="Download PDF"
                  >
                    <FileDown className="w-4 h-4" />
                  </button>
                </div>
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
                  Set Reminder
                </button>
                <button 
                  onClick={() => generatePrescriptionPDF(prescription)}
                  className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg flex items-center"
                >
                  <FileDown className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ==================== VISIBLE PDF BUTTONS COMPONENT ====================

  const PDFExportButtons = () => (
    <div className="fixed bottom-6 right-6 z-10 flex flex-col space-y-2">
      <button 
        onClick={generateAllRecordsPDF}
        className="bg-gradient-to-r from-primary to-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all"
        title="Export All Health Data"
      >
        <FileDown className="w-5 h-5 mr-2" />
        <span className="hidden md:inline">Export All PDF</span>
      </button>
      
      {medicalRecords.length > 0 && (
        <button 
          onClick={() => generateComprehensivePDF(medicalRecords, [])}
          className="bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-emerald-700 flex items-center justify-center"
          title="Export Medical Records"
        >
          <FileText className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">Records PDF</span>
        </button>
      )}
      
      {prescriptions.length > 0 && (
        <button 
          onClick={() => generateComprehensivePDF([], prescriptions)}
          className="bg-amber-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-amber-700 flex items-center justify-center"
          title="Export Prescriptions"
        >
          <Pill className="w-5 h-5 mr-2" />
          <span className="hidden md:inline">Meds PDF</span>
        </button>
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

  return (
    <>
      <PDFExportButtons />
      
      <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              Patient Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Manage your health records and generate PDF reports
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={generateAllRecordsPDF}
              className="px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white rounded-lg font-medium flex items-center hover:opacity-90"
            >
              <FileDown className="w-5 h-5 mr-2" />
              Full Health Report
            </button>
            <button 
              onClick={() => generateComprehensivePDF(medicalRecords, [])}
              disabled={medicalRecords.length === 0}
              className="px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="w-5 h-5 mr-2" />
              Medical Records ({medicalRecords.length})
            </button>
          </div>
        </div>
      </div>

      {(() => {
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
      })()}
    </>
  );
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