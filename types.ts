// types.ts
export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  LAB = 'laboratory',
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country?: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  avatar?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Patient {
  id: number;
  user_id: number;
  gender?: 'male' | 'female' | 'other';
  date_of_birth?: string;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  genotype?: 'AA' | 'AS' | 'AC' | 'SS' | 'SC' | 'CC' | 'unknown';
  known_allergies?: string;
  known_diseases?: string;
  height?: number;
  weight?: number;
  emergency_access_enabled?: boolean;
  emergency_access_code?: string;
  user?: User;
}

export interface Doctor {
  id: number;
  user_id: number;
  specialization: string;
  license_number: string;
  hospital_affiliation: string;
  is_approved: boolean;  // Changed from is_verified
  approved_by_admin_id?: number;
  approved_at?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Laboratory {
  id: number;
  user_id: number;
  lab_name?: string;
  license_number?: string;
  address?: string;
  is_approved: boolean;
  approved_by_admin_id?: number;
  approved_at?: string;
  user?: User;
}

export interface MedicalRecord {
  id: number;
  patient_id: number;
  record_type: 'vaccination' | 'prescription' | 'diagnosis' | 'consultation' | 'other';
  title: string;
  description?: string;
  date: string;
  doctor_id?: number;
  laboratory_id?: number;
  attachment_url?: string;
  is_shared: boolean;
  shared_until?: string;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  doctor?: Doctor;
  laboratory?: Laboratory;
}

export interface Prescription {
  id: number;
  patient_id: number;
  doctor_id: number;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  prescribed_date: string;
  end_date?: string;
  instructions?: string;
  isActive: boolean;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  doctor?: Doctor;
}

export interface LabTest {
  id: number;
  patient_id: number;
  doctor_id?: number;
  laboratory_id: number;
  test_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  results?: string;
  result_file_url?: string;
  doctor_interpretation?: string;
  ordered_date?: string;
  completed_date?: string;
  created_at?: string;
  updated_at?: string;
  patient?: Patient;
  doctor?: Doctor;
  laboratory?: Laboratory;
}

export interface AccessPermission {
  id: number;
  patient_id: number;
  granted_to_id: number;
  granted_by_id: number;
  access_type: 'view' | 'edit';
  expires_at: string;
  purpose?: string;
  is_active: boolean;
  patient?: Patient;
  granted_to?: User;
  granted_by?: User;
}

export interface FullProfile {
  user: User;
  patient?: Patient;
  doctor?: Doctor;
  laboratory?: Laboratory;
}

export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalLabs: number;
  totalPatients: number;
  pendingApprovals: number;
  activeRecords: number;
  todayActivity: number;
  verifiedProfessionals: number;
  recentActivities?: Array<{
    description: string;
    time: string;
    type: string;
  }>;
}

export interface AccessRequest {
  id: number;
  patient_id: number;
  requester_id: number;
  access_type: 'view' | 'edit';
  purpose?: string;
  status: 'pending' | 'approved' | 'rejected';
  expires_at?: string;
  created_at: string;
  patient?: Patient;
  requester?: User;
}

export interface RegistrationPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  country?: string;
  role: string;
}

export interface PatientProfileUpdate {
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number;
  weight?: number;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown';
  genotype?: 'AA' | 'AS' | 'AC' | 'SS' | 'SC' | 'CC' | 'unknown';
  known_allergies?: string;
  known_diseases?: string;
  emergency_access_enabled?: boolean;
  emergency_access_code?: string;
}

export interface DoctorProfileUpdate {
  specialization?: string;
  license_number?: string;
  hospital_affiliation?: string;
}

export interface LaboratoryProfileUpdate {
  lab_name?: string;
  license_number?: string;
  address?: string;
}