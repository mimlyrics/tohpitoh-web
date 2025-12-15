// components/doctor/WritePrescription.tsx
import React, { useState, useEffect } from 'react';
import { 
  Pill, 
  Search, 
  X, 
  Calendar, 
  Clock,
  AlertCircle,
  Check,
  Loader2,
  User,
  Plus,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';

interface Patient {
  id: number;
  user: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
  };
  known_allergies?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
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
  
  const [medications, setMedications] = useState<Medication[]>([
    { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
  ]);
  
  const [prescriptionData, setPrescriptionData] = useState({
    prescribed_date: new Date().toISOString().split('T')[0],
    end_date: '',
    additional_notes: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const patientsData = await api.doctor.getPatients(token);
        setPatients(patientsData);
        setFilteredPatients(patientsData);
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
        patient.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
  };

  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value
    };
    setMedications(updatedMedications);
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
  };

  const removeMedication = (index: number) => {
    if (medications.length > 1) {
      const updatedMedications = medications.filter((_, i) => i !== index);
      setMedications(updatedMedications);
    }
  };

  const validatePrescription = () => {
    if (!selectedPatient) {
      return 'Please select a patient';
    }

    for (const med of medications) {
      if (!med.name.trim()) {
        return 'Medication name is required for all medications';
      }
      if (!med.dosage.trim()) {
        return 'Dosage is required for all medications';
      }
      if (!med.frequency.trim()) {
        return 'Frequency is required for all medications';
      }
      if (!med.duration.trim()) {
        return 'Duration is required for all medications';
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const validationError = validatePrescription();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const prescriptionPayload = {
        patient_id: selectedPatient!.id,
        doctor_id: doctorId,
        medications: medications,
        prescribed_date: prescriptionData.prescribed_date,
        end_date: prescriptionData.end_date || null,
        additional_notes: prescriptionData.additional_notes,
        is_active: true
      };

      await api.doctor.createPrescription(token, prescriptionPayload);
      
      setSuccess('Prescription created successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      }, 1500);
      
    } catch (err: any) {
      setError(err.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedPatient(null);
    setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    setPrescriptionData({
      prescribed_date: new Date().toISOString().split('T')[0],
      end_date: '',
      additional_notes: ''
    });
    setShowPatientSearch(true);
  };

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
              placeholder="Search patients by name or email..."
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
                        {patient.user.email}
                      </p>
                      {patient.known_allergies && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Allergies: {patient.known_allergies}
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
      {selectedPatient && (
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
                {selectedPatient.known_allergies && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                    Known Allergies: {selectedPatient.known_allergies}
                  </p>
                )}
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
      {selectedPatient && (
        <div className="space-y-6">
          {/* Medications */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300">
                Medications *
              </label>
              <button
                type="button"
                onClick={addMedication}
                className="text-sm text-secondary dark:text-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-300 flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Medication
              </button>
            </div>

            <div className="space-y-4">
              {medications.map((medication, index) => (
                <div key={index} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-slate-800 dark:text-white">
                      Medication {index + 1}
                    </h4>
                    {medications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Medication Name *
                      </label>
                      <input
                        type="text"
                        value={medication.name}
                        onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        placeholder="e.g., Amoxicillin 500mg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={medication.dosage}
                        onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        placeholder="e.g., 1 tablet"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Frequency *
                      </label>
                      <select
                        value={medication.frequency}
                        onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                      >
                        <option value="">Select frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="Three times daily">Three times daily</option>
                        <option value="Four times daily">Four times daily</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="Every 12 hours">Every 12 hours</option>
                        <option value="As needed">As needed</option>
                        <option value="Before meals">Before meals</option>
                        <option value="After meals">After meals</option>
                        <option value="At bedtime">At bedtime</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        value={medication.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
                        placeholder="e.g., 7 days, 2 weeks, 1 month"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                        Instructions (Optional)
                      </label>
                      <textarea
                        value={medication.instructions || ''}
                        onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm min-h-[60px]"
                        placeholder="Special instructions for taking this medication..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prescription Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Prescription Date *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="date"
                  value={prescriptionData.prescribed_date}
                  onChange={(e) => setPrescriptionData({...prescriptionData, prescribed_date: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                End Date (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                  type="date"
                  value={prescriptionData.end_date}
                  onChange={(e) => setPrescriptionData({...prescriptionData, end_date: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg"
                  min={prescriptionData.prescribed_date}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={prescriptionData.additional_notes}
              onChange={(e) => setPrescriptionData({...prescriptionData, additional_notes: e.target.value})}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg min-h-[80px]"
              placeholder="Any additional notes or warnings for the patient..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={resetForm}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg"
              disabled={loading}
            >
              Clear
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
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