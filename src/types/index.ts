export type NavigationTab =
  | 'dashboard'
  | 'patients'
  | 'pharmacy'
  | 'doctors'
  | 'telehealth'
  | 'rooms'
  | 'emergency'
  | 'api_gateway'
  | 'online_orders';

// Rows from the shared Supabase database (written by the customer site)
export interface NursingBookingRow {
  id: string;
  user_id: string | null;
  patient_name: string;
  phone: string;
  address: string;
  service_id: string | null;
  service_name: string;
  price: number;
  nurse_name: string | null;
  nurse_cchn: string | null;
  urgency: 'immediate' | 'scheduled';
  scheduled_at: string | null;
  medical_note: string | null;
  status: string;
  created_at: string;
}

export interface ServiceOrderRow {
  id: string;
  user_id: string | null;
  customer_email: string | null;
  items: { name?: string; title?: string; price: number }[];
  total: number;
  status: string;
  created_at: string;
}

export interface TriageReportRow {
  id: string;
  user_id: string;
  pain_level: number;
  urgent: boolean;
  created_at: string;
}

export interface PatientProfileRow {
  id: string;
  user_id: string;
  full_name: string | null;
  birth_year: number | null;
  gender: string | null;
  guardian_name: string | null;
  emergency_phone: string | null;
  service_need: string | null;
  created_at: string;
}

export interface VitalSigns {
  hr: number;
  bp: string;
  spo2: number;
  temp: number;
  glucose?: number;
  respRate?: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  dob: string;
  gender: 'Nam' | 'Nữ';
  room: string;
  wing: 'VIP' | 'Lão Khoa' | 'ICU' | 'Deluxe';
  doctor: string;
  status: string;
  statusType: 'stable' | 'warning' | 'critical';
  diagnosis: string;
  icd10: string;
  cccd: string;
  admissionDate: string;
  insurance: string;
  history: string;
  regime: string;
  allergies: string[];
  vitals: VitalSigns;
  medications: {
    name: string;
    dosage: string;
    route: string;
    frequency: string;
  }[];
  labResults: {
    test: string;
    value: string;
    unit: string;
    reference: string;
    status: 'normal' | 'high' | 'low';
  }[];
  avatar?: string;
}

export interface MedicationItem {
  id: string;
  name: string;
  activeIngredient: string;
  group: 'Tim Mạch' | 'Kháng Sinh' | 'Lão Khoa / Thần Kinh' | 'Dịch Truyền' | 'Tiêu Hoá' | 'Giảm Đau';
  stock: number;
  minStock: number;
  unit: string;
  lotNumber: string;
  expiryDate: string;
  storage: string;
  price: number;
}

export interface Prescription {
  id: string;
  rxCode: string;
  patientId: string;
  patientName: string;
  room: string;
  doctor: string;
  prescribedAt: string;
  drugs: {
    name: string;
    dosage: string;
    quantity: number;
    unit: string;
    instruction: string;
  }[];
  deliveryStatus: 'Chờ Duyệt' | 'Đang Chuẩn Bị' | 'Đang Vận Chuyển' | 'Đã Giao Bệnh Nhân';
  deliveryTime?: string;
  priority: 'Khẩn Cấp' | 'Ưu Tiên' | 'Tiêu Chuẩn';
}

export interface Doctor {
  id: string;
  name: string;
  degree: 'GS.TS' | 'PGS.TS' | 'TS.BS' | 'BSCKII' | 'ThS.BS' | 'BSCKI';
  specialty: string;
  position: string;
  department: string;
  hospitalAffiliation: string;
  licenseNumber: string;
  status: 'Đang trực' | 'Sẵn sàng hội chẩn' | 'Đang phẫu thuật' | 'Ngoại viện';
  shifts: ('Sáng' | 'Chiều' | 'Đêm C/C')[];
  rating: number;
  consultationCount: number;
  avatar: string;
}

export interface RoomBed {
  id: string;
  roomNumber: string;
  name: string;
  wing: 'wing1' | 'wing2' | 'wing3'; // wing1: Đông VIP, wing2: Tây Lão Khoa, wing3: Cấp cứu ICU
  wingLabel: string;
  type: 'Tổng Thống' | 'VIP Villa' | 'Deluxe' | 'ICU Sub' | 'Suite';
  patientName?: string;
  patientId?: string;
  occupancyStatus: 'occupied' | 'available' | 'cleaning';
  temperature: number;
  humidity: number;
  pressure: string;
  ambientSpo2: number;
  hepaStatus: 'Hoạt động 100%' | 'Chế độ êm' | 'Tối đa';
  nurseCallActive: boolean;
  medicalGas: {
    oxygenBar: number;
    airBar: number;
    vacuumBar: number;
  };
  bedAngle: {
    head: number;
    feet: number;
  };
}

export interface Ambulance {
  id: string;
  code: string;
  licensePlate: string;
  type: 'Mobile ICU' | 'Advanced Life Support' | 'Chuyên Dụng Lão Khoa';
  driver: string;
  leadDoctor: string;
  paramedic: string;
  status: 'Sẵn sàng' | 'Đang di chuyển' | 'Đang cấp cứu ngoại viện' | 'Đang bảo dưỡng';
  currentLocation: string;
  equipment: string[];
  batteryPercent: number;
  fuelPercent: number;
  vitals?: {
    hr: number;
    spo2: number;
    bp: string;
    etco2: number;
  };
}

export interface DijkstraNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: 'hospital' | 'intersection' | 'emergency_site';
}

export interface DijkstraEdge {
  from: string;
  to: string;
  baseDistanceKm: number;
  normalTimeMin: number;
}

export interface HL7Message {
  id: string;
  timestamp: string;
  messageType: 'ADT^A01' | 'ORU^R01' | 'RDE^O11' | 'MDM^T02';
  description: string;
  sender: string;
  receiver: string;
  status: 'ACK' | 'PENDING' | 'ERROR';
  rawPayload: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  description: string;
  type: 'success' | 'warning' | 'emergency' | 'info';
}

export interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  fullKey: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'locked';
  scopes: string[];
  rateLimit: string;
}
