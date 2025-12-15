// components/doctor/WritePrescription.tsx
import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  X, 
  User, 
  Calendar, 
  Clock,
  AlertCircle,
  Check,
  Loader2,
  Plus,
  Minus,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';

interface Patient {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  date_of_birth?: string;
  blood_type?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface WritePrescriptionProps {
  token: string;
  doctorId: number;
  onSuccess?: () => void;
  onClose?: () => void;
}

export const WritePrescription: React.FC<WritePrescriptionProps> = ({
  token,
  doctorId,
  onSuccess,
  onClose
}) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(true);
  
  const [formData, setFormData] = useState({
    diagnosis: '',
    notes: '',
    prescribed_date: new Date().toISOString().split('T')[0],
    expiry_date: '',
    isActive: true
  });
  
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientsData = await api.doctor.getPatients(token);
        setPatients(Array.isArray(patientsData) ? patientsData : []);
        setFilteredPatients(Array.isArray(patientsData) ? patientsData : []);
      } catch (err) {
        console.error('Failed to load patients:', err);
        setError('Failed to load patients list');
      }
    };

    loadPatients();
  }, [token]);

  // Search patients
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(patient => 
        patient.user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (patient.user.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    
    // Set expiry date to 30 days from now
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 30);
    setFormData(prev => ({
      ...prev,
      expiry_date: expiry.toISOString().split('T')[0]
    }));
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      setMedications(medications.filter((_, i) => i !== index));
    }
  };

  const updateMedication = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index][field] = value;
    setMedications(updatedMedications);
  };

const handleSubmit = async () => {
  if (!selectedPatient) {
    setError('Please select a patient');
    return;
  }

  // Validate medications
  const invalidMedications = medications.filter(med => 
    !med.name.trim() || !med.dosage.trim() || !med.frequency.trim() || !med.duration.trim()
  );
  
  if (invalidMedications.length > 0) {
    setError('Please fill all required fields for each medication');
    return;
  }

  if (!formData.diagnosis.trim()) {
    setError('Diagnosis is required');
    return;
  }

  setLoading(true);
  setError('');
  setSuccess('');

  try {
    // Create all prescriptions first, store promises
    const prescriptionPromises = medications.map((medication) => {
      // Match the backend expected structure
      const prescriptionData = {
        patient_id: selectedPatient.id,
        // Remove doctor_id - backend gets it from JWT token
        diagnosis: formData.diagnosis, // Backend needs to be updated to accept this
        notes: formData.notes, // Backend needs to be updated to accept this
        medication_name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        duration: medication.duration,
        instructions: medication.instructions || '', // Ensure it's not undefined
        // Backend expects 'end_date', not 'expiry_date'
        end_date: formData.expiry_date || null // Use null if not provided
        // Remove isActive - backend sets it automatically
      };
      
      return api.doctor.createPrescription(token, prescriptionData);
    });
    
    // Wait for all prescriptions to complete
    const results = await Promise.allSettled(prescriptionPromises);
    
    // Check results
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    if (failed > 0) {
      // Some failed
      const errors = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason?.message || 'Unknown error');
      
      setError(`${failed} prescription(s) failed: ${errors.join(', ')}`);
      
      if (successful > 0) {
        // Some succeeded, show partial success
        setTimeout(() => {
          setSuccess(`${successful} prescription(s) created successfully (${failed} failed)`);
          setTimeout(() => {
            if (onSuccess && successful > 0) onSuccess();
            if (onClose) onClose();
          }, 2000);
        }, 100);
      }
    } else {
      // All succeeded
      setSuccess(`${medications.length} prescription(s) created successfully!`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
    }
      
  } catch (err: any) {
    // This catches any synchronous errors
    setError(err.message || 'Failed to create prescriptions');
  } finally {
    setLoading(false);
  }
};

  const resetForm = () => {
    setSelectedPatient(null);
    setFormData({
      diagnosis: '',
      notes: '',
      prescribed_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      isActive: true
    });
    setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setShowPatientSearch(true);
  };

  // Common medication frequencies
  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'Once weekly',
    'Twice weekly',
    'As needed'
  ];

  // Common durations
  const durationOptions = [
    '1 day',
    '3 days',
    '5 days',
    '7 days',
    '10 days',
    '14 days',
    '21 days',
    '30 days',
    '60 days',
    '90 days',
    'Continuous'
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-100 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">
          Write Prescription
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check size={18} />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Patient Selection */}
      {showPatientSearch && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-3">
            Select Patient *
          </label>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search patients by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
            />
          </div>

          <div className="max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            {filteredPatients.length === 0 ? (
              <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                No patients found
              </div>
            ) : (
              filteredPatients.map(patient => (
                <button
                  key={patient.id}
                  onClick={() => handlePatientSelect(patient)}
                  className="w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 dark:text-white">
                        {patient.user.first_name} {patient.user.last_name}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {patient.user.email} • {patient.user.phone || 'No phone'}
                      </p>
                      {patient.date_of_birth && (
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          DOB: {new Date(patient.date_of_birth).toLocaleDateString()} • 
                          Blood: {patient.blood_type || 'Unknown'}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected Patient */}
      {selectedPatient && !showPatientSearch && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-slate-800 dark:text-white">
                  {selectedPatient.user.first_name} {selectedPatient.user.last_name}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {selectedPatient.user.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedPatient(null);
                setShowPatientSearch(true);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              Change
            </button>
          </div>
        </div>
      )}

      {/* Prescription Form */}
      {selectedPatient && !showPatientSearch && (
        <div className="space-y-6">
          {/* Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Diagnosis *
            </label>
            <input
              type="text"
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              placeholder="e.g., Hypertension, Type 2 Diabetes, Asthma"
              required
            />
          </div>

          {/* Medication List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Medications *
              </label>
              <button
                onClick={addMedication}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Medication
              </button>
            </div>

            {medications.map((medication, index) => (
              <div key={index} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-slate-800 dark:text-white">
                    Medication #{index + 1}
                  </h4>
                  {medications.length > 1 && (
                    <button
                      onClick={() => removeMedication(index)}
                      className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) => updateMedication(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      placeholder="e.g., Amoxicillin, Lisinopril"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      placeholder="e.g., 500mg, 10mg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Frequency *
                    </label>
                    <select
                      value={medication.frequency}
                      onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    >
                      <option value="">Select frequency</option>
                      {frequencyOptions.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Duration *
                    </label>
                    <select
                      value={medication.duration}
                      onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                    >
                      <option value="">Select duration</option>
                      {durationOptions.map(dur => (
                        <option key={dur} value={dur}>{dur}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-slate-500 dark:text-slate-400 mb-1">
                      Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={medication.instructions}
                      onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      placeholder="e.g., Take with food, Avoid alcohol"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Prescribed Date *
              </label>
              <input
                type="date"
                value={formData.prescribed_date}
                onChange={(e) => setFormData({...formData, prescribed_date: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Expiry Date *
              </label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[80px]"
              placeholder="Any additional instructions or notes for the patient..."
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label htmlFor="isActive" className="ml-2 text-sm text-slate-600 dark:text-slate-300">
              Mark prescription as active
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
              disabled={loading}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.diagnosis.trim() || medications.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Prescription'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};