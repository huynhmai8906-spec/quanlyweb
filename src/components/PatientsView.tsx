import React, { useState, useEffect, useRef } from 'react';
import { Patient, VitalSigns } from '../types';
import { APP_IMAGES, SAFE_FALLBACK_AVATAR } from '../assets/images';

interface PatientsViewProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  onAddPatient: (newPatient: Patient) => void;
  onNavigateToPharmacy: (patientId: string) => void;
  onNavigateToTelehealth: (patientId: string) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onAddPatient,
  onNavigateToPharmacy,
  onNavigateToTelehealth,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'labs' | 'rx' | 'dicom' | 'hl7'>('overview');
  const [viewMode, setViewMode] = useState<'ehr' | 'telemetry'>('ehr');
  const [filterCondition, setFilterCondition] = useState<'all' | 'critical' | 'warning' | 'stable'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFhirInspector, setShowFhirInspector] = useState(false);
  const [fhirResourceTab, setFhirResourceTab] = useState<'Patient' | 'Observation' | 'MedicationRequest' | 'DiagnosticReport'>('Patient');
  const [copiedFhir, setCopiedFhir] = useState(false);

  // New patient form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientDob, setNewPatientDob] = useState('1960-05-15');
  const [newPatientGender, setNewPatientGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newPatientCccd, setNewPatientCccd] = useState('079060002145');
  const [newPatientRoom, setNewPatientRoom] = useState('Phòng 301 VIP (Tổng Thống)');
  const [newPatientDoctor, setNewPatientDoctor] = useState('GS.TS Nguyễn Anh Tuấn');
  const [newPatientDiagnosis, setNewPatientDiagnosis] = useState('Tăng huyết áp vô căn độ 2 - Rối loạn lipid máu');
  const [newPatientIcd10, setNewPatientIcd10] = useState('I10 / E78.5');
  const [newPatientHr, setNewPatientHr] = useState(76);
  const [newPatientBp, setNewPatientBp] = useState('125/80');
  const [newPatientSpo2, setNewPatientSpo2] = useState(98);
  const [newPatientTemp, setNewPatientTemp] = useState(36.8);
  const [newPatientAllergies, setNewPatientAllergies] = useState('Không có dị ứng đã biết (NKDA)');

  // Selected patient
  const currentPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Filtered patients
  const filteredPatients = patients.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.cccd.includes(searchQuery) ||
      p.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesQuery) return false;
    if (filterCondition === 'all') return true;
    return p.statusType === filterCondition;
  });

  // Animated ECG canvas for telemetry view
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (viewMode !== 'telemetry') return;
    const canvas = ecgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;
    const width = canvas.width;
    const height = canvas.height;

    const renderEcg = () => {
      ctx.fillStyle = '#00201e';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(13, 92, 88, 0.3)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // ECG wave
      ctx.strokeStyle = '#8fd3cd';
      ctx.lineWidth = 2;
      ctx.beginPath();

      const centerY = height / 2;
      for (let x = 0; x < width; x++) {
        const t = (x + step) % 120;
        let y = centerY;
        if (t > 40 && t < 45) {
          y = centerY - 8; // P wave
        } else if (t > 48 && t < 50) {
          y = centerY + 10; // Q
        } else if (t >= 50 && t <= 56) {
          y = centerY - 55; // R peak
        } else if (t > 56 && t < 60) {
          y = centerY + 18; // S
        } else if (t > 70 && t < 85) {
          y = centerY - 14; // T wave
        }
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      step = (step + 2) % 120;
      animationFrameId = requestAnimationFrame(renderEcg);
    };

    renderEcg();
    return () => cancelAnimationFrame(animationFrameId);
  }, [viewMode]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim()) return;

    const birthYear = parseInt(newPatientDob.split('-')[0]) || 1960;
    const calculatedAge = new Date().getFullYear() - birthYear;
    const newId = `EHR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const created: Patient = {
      id: newId,
      name: newPatientName,
      age: calculatedAge,
      dob: newPatientDob,
      gender: newPatientGender,
      room: newPatientRoom,
      wing: 'VIP',
      doctor: newPatientDoctor,
      status: 'Ổn định (Mới tiếp nhận)',
      statusType: 'stable',
      diagnosis: newPatientDiagnosis,
      icd10: newPatientIcd10,
      cccd: newPatientCccd,
      admissionDate: new Date().toISOString().split('T')[0],
      insurance: 'Bảo hiểm Y tế Quốc tế Thượng lưu',
      history: 'Tiếp nhận nội trú theo dõi chuyên khoa. Chưa ghi nhận biến chứng cấp.',
      regime: 'Đo sinh hiệu mỗi 4 giờ, kiểm tra sinh hóa máu toàn phần.',
      allergies: [newPatientAllergies],
      vitals: {
        hr: newPatientHr,
        bp: newPatientBp,
        spo2: newPatientSpo2,
        temp: newPatientTemp,
        glucose: 5.4,
        respRate: 18,
      },
      medications: [
        { name: 'Theo dõi chỉ định bác sĩ', dosage: 'Tiêu chuẩn', route: 'Uống', frequency: 'Đang lên đơn' },
      ],
      labResults: [
        { test: 'Đường huyết mao mạch', value: '5.4', unit: 'mmol/L', reference: '3.9 - 6.4', status: 'normal' },
      ],
      avatar: APP_IMAGES.defaultPatient,
    };

    onAddPatient(created);
    onSelectPatient(created.id);
    setShowAddModal(false);
  };

  // Generate FHIR R4 JSON representation
  const getFhirJson = () => {
    if (!currentPatient) return '{}';
    if (fhirResourceTab === 'Patient') {
      return JSON.stringify(
        {
          resourceType: 'Patient',
          id: currentPatient.id,
          meta: { versionId: '1', lastUpdated: new Date().toISOString() },
          identifier: [
            { system: 'urn:oid:vn:cccd', value: currentPatient.cccd },
            { system: 'urn:oid:grandcare:mrn', value: currentPatient.id },
          ],
          active: true,
          name: [{ use: 'official', text: currentPatient.name }],
          gender: currentPatient.gender === 'Nam' ? 'male' : 'female',
          birthDate: currentPatient.dob,
          managingOrganization: { display: 'Bệnh Viện Quốc Tế GrandCare' },
        },
        null,
        2
      );
    }
    if (fhirResourceTab === 'Observation') {
      return JSON.stringify(
        {
          resourceType: 'Observation',
          id: `OBS-${currentPatient.id}-VITALS`,
          status: 'final',
          category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
          code: { coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel with all children' }] },
          subject: { reference: `Patient/${currentPatient.id}`, display: currentPatient.name },
          component: [
            { code: { coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }] }, valueQuantity: { value: currentPatient.vitals.hr, unit: 'beats/minute' } },
            { code: { coding: [{ system: 'http://loinc.org', code: '2708-6', display: 'Oxygen saturation' }] }, valueQuantity: { value: currentPatient.vitals.spo2, unit: '%' } },
          ],
        },
        null,
        2
      );
    }
    if (fhirResourceTab === 'MedicationRequest') {
      return JSON.stringify(
        {
          resourceType: 'MedicationRequest',
          id: `MEDREQ-${currentPatient.id}-01`,
          status: 'active',
          intent: 'order',
          subject: { reference: `Patient/${currentPatient.id}`, display: currentPatient.name },
          medicationCodeableConcept: {
            text: currentPatient.medications[0]?.name || 'Chưa kê đơn',
          },
          dosageInstruction: [{ text: currentPatient.medications[0]?.frequency || 'Theo y lệnh' }],
        },
        null,
        2
      );
    }
    return JSON.stringify(
      {
        resourceType: 'DiagnosticReport',
        id: `DIAG-${currentPatient.id}-01`,
        status: 'final',
        code: { text: currentPatient.diagnosis },
        subject: { reference: `Patient/${currentPatient.id}` },
        conclusion: currentPatient.regime,
      },
      null,
      2
    );
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFhirJson());
    setCopiedFhir(true);
    setTimeout(() => setCopiedFhir(false), 2000);
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Command Ribbon */}
      <div className="px-6 py-4 bg-surface-clean border-b border-outline-variant/30 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-[26px]">clinical_notes</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-xl text-primary font-bold">
                Quản Lý Bệnh Nhân & Hồ Sơ EHR Master
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-vital-stable/10 text-vital-stable font-bold text-[10px] tracking-wider uppercase border border-vital-stable/20">
                HL7 / FHIR R4
              </span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Theo dõi lâm sàng thời gian thực, liên thông bệnh án điện tử và tương thích DICOM / RIS / LIS
            </p>
          </div>
        </div>

        {/* Action Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mode Switcher */}
          <div className="p-1 bg-surface-container rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('ehr')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'ehr'
                  ? 'bg-surface-clean text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">folder_shared</span>
              <span>Bệnh Án Master</span>
            </button>
            <button
              onClick={() => setViewMode('telemetry')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'telemetry'
                  ? 'bg-surface-clean text-primary shadow-xs font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">monitor_heart</span>
              <span>Sinh Hiệu Tele-ECG</span>
            </button>
          </div>

          {/* FHIR Inspector Button */}
          <button
            onClick={() => setShowFhirInspector(true)}
            className="h-9 px-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-title-sm text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <span className="material-symbols-outlined text-[16px] text-primary">data_object</span>
            <span>FHIR R4 JSON</span>
          </button>

          {/* Add Patient Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="h-9 px-4 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-title-sm text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">person_add</span>
            <span>Tiếp Nhận Bệnh Nhân</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'ehr' ? (
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 bg-surface">
          {/* Left: Patient List Sidebar */}
          <div className="w-full lg:w-96 border-r border-outline-variant/30 bg-surface-clean p-4 flex flex-col shrink-0">
            {/* Search & Filter */}
            <div className="mb-3">
              <div className="relative mb-2.5">
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Lọc tên, CCCD, chẩn đoán..."
                  className="w-full h-8 pl-8 pr-3 rounded-lg bg-surface-container-low text-xs border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-medium text-on-surface-variant">
                <button
                  onClick={() => setFilterCondition('all')}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    filterCondition === 'all'
                      ? 'bg-primary text-on-primary font-bold'
                      : 'hover:bg-surface-container'
                  }`}
                >
                  Tất cả ({patients.length})
                </button>
                <button
                  onClick={() => setFilterCondition('critical')}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    filterCondition === 'critical'
                      ? 'bg-emergency-red text-white font-bold'
                      : 'hover:bg-surface-container text-emergency-red'
                  }`}
                >
                  Nguy cấp
                </button>
                <button
                  onClick={() => setFilterCondition('warning')}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    filterCondition === 'warning'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'hover:bg-surface-container text-amber-700'
                  }`}
                >
                  Cần theo dõi
                </button>
                <button
                  onClick={() => setFilterCondition('stable')}
                  className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                    filterCondition === 'stable'
                      ? 'bg-vital-stable text-white font-bold'
                      : 'hover:bg-surface-container text-vital-stable'
                  }`}
                >
                  Ổn định
                </button>
              </div>
            </div>

            {/* Patient Cards List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredPatients.map((pat) => {
                const isSelected = pat.id === currentPatient.id;
                return (
                  <div
                    key={pat.id}
                    onClick={() => onSelectPatient(pat.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-primary-container/10 border-primary shadow-xs'
                        : 'bg-surface-clean border-outline-variant/20 hover:border-primary/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={pat.avatar || APP_IMAGES.defaultPatient}
                          alt={pat.name}
                          className="w-9 h-9 rounded-full object-cover border border-outline-variant/30 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                          }}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-on-surface truncate flex items-center gap-1.5">
                            <span>{pat.name}</span>
                            <span className="text-[10px] text-on-surface-variant font-normal">
                              ({pat.age}T - {pat.gender})
                            </span>
                          </div>
                          <div className="text-[10px] text-on-surface-variant font-mono truncate">
                            {pat.id} · {pat.room}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${
                          pat.statusType === 'critical'
                            ? 'bg-emergency-red/10 text-emergency-red'
                            : pat.statusType === 'warning'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pat.statusType === 'critical' ? 'Nguy kịch' : pat.statusType === 'warning' ? 'Theo dõi' : 'Ổn định'}
                      </span>
                    </div>

                    <div className="text-[11px] text-on-surface-variant truncate font-medium mb-2">
                      {pat.diagnosis}
                    </div>

                    {/* Vitals micro strip */}
                    <div className="flex items-center justify-between text-[10px] font-mono tabular-nums pt-1.5 border-t border-outline-variant/20 text-on-surface">
                      <span className="text-primary font-bold">
                        ♥ {pat.vitals.hr} bpm
                      </span>
                      <span>BP {pat.vitals.bp}</span>
                      <span className="text-vital-stable font-semibold">
                        SpO2 {pat.vitals.spo2}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Detailed Patient Record */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {currentPatient ? (
              <>
                {/* Header Profile Card */}
                <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20">
                    <div className="flex items-center gap-4">
                      <img
                        src={currentPatient.avatar || APP_IMAGES.defaultPatient}
                        alt={currentPatient.name}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shadow-xs"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                        }}
                      />
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-headline-sm text-2xl text-on-surface font-bold">
                            {currentPatient.name}
                          </h3>
                          <span
                            className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                              currentPatient.statusType === 'critical'
                                ? 'bg-emergency-red/10 text-emergency-red'
                                : currentPatient.statusType === 'warning'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {currentPatient.status}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-on-surface-variant mt-1">
                          <span>Mã EHR: <strong className="font-mono text-primary">{currentPatient.id}</strong></span>
                          <span>CCCD: <strong className="font-mono">{currentPatient.cccd}</strong></span>
                          <span>Sinh: <strong>{currentPatient.dob} ({currentPatient.age} tuổi)</strong></span>
                          <span>Giới tính: <strong>{currentPatient.gender}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Clinical Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onNavigateToPharmacy(currentPatient.id)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">medication</span>
                        <span>Kê Đơn Thuốc</span>
                      </button>
                      <button
                        onClick={() => onNavigateToTelehealth(currentPatient.id)}
                        className="px-3 py-1.5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold hover:bg-teal-100 transition-colors flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">video_camera_front</span>
                        <span>Hội Chẩn Telehealth</span>
                      </button>
                    </div>
                  </div>

                  {/* Vitals Ribbon */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-surface-clean border border-outline-variant/20">
                      <div className="text-[11px] text-on-surface-variant font-medium">Nhịp Tim (HR)</div>
                      <div className="text-lg font-bold font-mono text-primary tabular-nums mt-0.5">
                        {currentPatient.vitals.hr} <span className="text-xs font-normal text-on-surface-variant">bpm</span>
                      </div>
                      <div className="text-[10px] text-vital-stable font-semibold">Nhịp xoang đều</div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-clean border border-outline-variant/20">
                      <div className="text-[11px] text-on-surface-variant font-medium">Huyết Áp (NIBP)</div>
                      <div className="text-lg font-bold font-mono text-on-surface tabular-nums mt-0.5">
                        {currentPatient.vitals.bp} <span className="text-xs font-normal text-on-surface-variant">mmHg</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant">Huyết áp mục tiêu</div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-clean border border-outline-variant/20">
                      <div className="text-[11px] text-on-surface-variant font-medium">Độ Bão Hòa SpO2</div>
                      <div className="text-lg font-bold font-mono text-vital-stable tabular-nums mt-0.5">
                        {currentPatient.vitals.spo2}%
                      </div>
                      <div className="text-[10px] text-vital-stable font-semibold">Thở khí phòng</div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-clean border border-outline-variant/20">
                      <div className="text-[11px] text-on-surface-variant font-medium">Thân Nhiệt (Temp)</div>
                      <div className="text-lg font-bold font-mono text-on-surface tabular-nums mt-0.5">
                        {currentPatient.vitals.temp}°C
                      </div>
                      <div className="text-[10px] text-vital-stable font-semibold">Bình thường</div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-clean border border-outline-variant/20">
                      <div className="text-[11px] text-on-surface-variant font-medium">Đường Huyết</div>
                      <div className="text-lg font-bold font-mono text-amber-700 tabular-nums mt-0.5">
                        {currentPatient.vitals.glucose || 5.6} <span className="text-xs font-normal text-on-surface-variant">mmol/L</span>
                      </div>
                      <div className="text-[10px] text-on-surface-variant">Kiểm soát tốt</div>
                    </div>

                    <div className="p-3 rounded-xl bg-surface-clean border border-outline-variant/20">
                      <div className="text-[11px] text-on-surface-variant font-medium">Nhịp Thở (RR)</div>
                      <div className="text-lg font-bold font-mono text-on-surface tabular-nums mt-0.5">
                        {currentPatient.vitals.respRate || 18} <span className="text-xs font-normal text-on-surface-variant">lần/phút</span>
                      </div>
                      <div className="text-[10px] text-vital-stable font-semibold">Không khó thở</div>
                    </div>
                  </div>
                </div>

                {/* Navigation Tabs */}
                <div className="border-b border-outline-variant/30 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
                  {[
                    { key: 'overview', label: 'Tổng Quan Lâm Sàng', icon: 'stethoscope' },
                    { key: 'history', label: 'Lịch Sử Khám & Bệnh Án', icon: 'history_edu' },
                    { key: 'labs', label: 'Chỉ Số Xét Nghiệm Sinh Hóa', icon: 'biotechnology' },
                    { key: 'rx', label: 'Đơn Thuốc Đang Dùng', icon: 'medication' },
                    { key: 'dicom', label: 'Chẩn Đoán Hình Ảnh DICOM', icon: 'radiology' },
                    { key: 'hl7', label: 'HL7 / FHIR Event Stream', icon: 'terminal' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center gap-1.5 whitespace-nowrap border-b-2 ${
                        activeTab === tab.key
                          ? 'border-primary text-primary font-bold bg-surface-clean'
                          : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-clean/50'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab 1: Clinical Overview */}
                {activeTab === 'overview' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30">
                        <h4 className="font-title-lg text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">diagnosis</span>
                          <span>Chẩn Đoán Xác Định (ICD-10)</span>
                        </h4>
                        <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 mb-3">
                          <div className="text-xs text-on-surface font-semibold">{currentPatient.diagnosis}</div>
                          <div className="text-[11px] font-mono text-primary font-bold mt-1">
                            Mã ICD-10 Quốc Tế: {currentPatient.icd10}
                          </div>
                        </div>

                        <h5 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2">
                          Tiền Sử Bệnh & Dị Ứng
                        </h5>
                        <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
                          {currentPatient.history}
                        </p>

                        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emergency-red mb-1">
                            <span className="material-symbols-outlined text-[16px]">warning</span>
                            <span>Cảnh Báo Dị Ứng Thuốc</span>
                          </div>
                          <div className="text-xs text-red-900 font-medium">
                            {currentPatient.allergies.join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30">
                        <h4 className="font-title-lg text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                          <span className="material-symbols-outlined text-emerald-deep text-[20px]">assignment</span>
                          <span>Phác Đồ & Kế Hoạch Điều Trị Hiện Tại</span>
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/20 font-medium">
                          {currentPatient.regime}
                        </p>
                      </div>
                    </div>

                    {/* Right summary box */}
                    <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30">
                        <h4 className="font-title-lg text-sm font-bold text-on-surface mb-3">
                          Thông Tin Nhập Viện
                        </h4>
                        <div className="space-y-2.5 text-xs">
                          <div className="flex justify-between py-1 border-b border-outline-variant/20">
                            <span className="text-on-surface-variant">Ngày vào viện:</span>
                            <span className="font-semibold text-on-surface">{currentPatient.admissionDate}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-outline-variant/20">
                            <span className="text-on-surface-variant">Bác sĩ điều trị:</span>
                            <span className="font-semibold text-primary">{currentPatient.doctor}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-outline-variant/20">
                            <span className="text-on-surface-variant">Phòng lưu trú:</span>
                            <span className="font-semibold text-on-surface">{currentPatient.room}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-outline-variant/20">
                            <span className="text-on-surface-variant">Bảo hiểm:</span>
                            <span className="font-semibold text-emerald-800">{currentPatient.insurance}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 rounded-2xl bg-surface-clean border border-outline-variant/30">
                        <h4 className="font-title-lg text-sm font-bold text-on-surface mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-clinical-amber text-[18px]">verified_user</span>
                          <span>Tiêu Chuẩn JCI Hoạt Động</span>
                        </h4>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Hồ sơ được số hóa toàn vẹn với chữ ký số chuyên gia, tích hợp xác thực đa yếu tố và tự động đồng bộ sang cơ sở dữ liệu Bộ Y Tế.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 2: Medical History */}
                {activeTab === 'history' && (
                  <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
                    <h4 className="font-title-lg text-sm font-bold text-on-surface">
                      Diễn Tiến Bệnh Án Theo Mốc Thời Gian
                    </h4>
                    <div className="relative border-l-2 border-primary/20 ml-3 space-y-6 pl-6 py-2">
                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20"></span>
                        <div className="text-xs font-bold text-primary">Hôm nay - 08:30</div>
                        <div className="text-xs text-on-surface font-semibold mt-0.5">
                          Hội đồng chuyên khoa đi buồng lâm sàng sáng
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">
                          Bệnh nhân tỉnh táo, tiếp xúc tốt. Không đau ngực, không khó thở khi nghỉ. Huyết áp ổn định {currentPatient.vitals.bp} mmHg. Duy trì phác đồ điều trị nội khoa kết hợp vật lý trị liệu nhẹ.
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-emerald-600/20"></span>
                        <div className="text-xs font-bold text-emerald-800">Hôm qua - 16:00</div>
                        <div className="text-xs text-on-surface font-semibold mt-0.5">
                          Đánh giá kết quả xét nghiệm sinh hóa và điện giải
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">
                          Chỉ số Troponin T hs trong giới hạn an toàn. Bác sĩ cho phép bổ sung dinh dưỡng chế độ ít natri và dạo bộ có điều dưỡng đi kèm.
                        </div>
                      </div>

                      <div className="relative">
                        <span className="absolute -left-[31px] top-0 w-3 h-3 rounded-full bg-slate-400 ring-4 ring-slate-400/20"></span>
                        <div className="text-xs font-bold text-on-surface-variant">{currentPatient.admissionDate}</div>
                        <div className="text-xs text-on-surface font-semibold mt-0.5">
                          Tiếp nhận bệnh nhân nhập viện nội trú
                        </div>
                        <div className="text-xs text-on-surface-variant mt-1">
                          Hoàn tất thủ tục hồ sơ EHR Master, đo sinh hiệu ban đầu, phân bổ phòng nghỉ dưỡng và thiết lập máy theo dõi không dây.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: Lab Results */}
                {activeTab === 'labs' && (
                  <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-title-lg text-sm font-bold text-on-surface">
                        Bảng Kết Quả Xét Nghiệm Sinh Hóa Tự Động
                      </h4>
                      <span className="text-xs text-on-surface-variant">
                        Nguồn: Máy phân tích Roche Cobas 8000
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                            <th className="py-2.5 px-3">Tên Xét Nghiệm</th>
                            <th className="py-2.5 px-3">Kết Quả</th>
                            <th className="py-2.5 px-3">Đơn Vị</th>
                            <th className="py-2.5 px-3">Khoảng Tham Chiếu</th>
                            <th className="py-2.5 px-3">Đánh Giá</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/20">
                          {currentPatient.labResults.map((lab, i) => (
                            <tr key={i} className="hover:bg-surface-clean transition-colors">
                              <td className="py-3 px-3 font-medium text-on-surface">{lab.test}</td>
                              <td className="py-3 px-3 font-mono font-bold text-primary tabular-nums">
                                {lab.value}
                              </td>
                              <td className="py-3 px-3 text-on-surface-variant">{lab.unit}</td>
                              <td className="py-3 px-3 font-mono text-on-surface-variant tabular-nums">
                                {lab.reference}
                              </td>
                              <td className="py-3 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    lab.status === 'high'
                                      ? 'bg-rose-100 text-rose-800'
                                      : lab.status === 'low'
                                      ? 'bg-amber-100 text-amber-800'
                                      : 'bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  {lab.status === 'high' ? 'Cao ▲' : lab.status === 'low' ? 'Thấp ▼' : 'Bình thường ✓'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tab 4: Medications */}
                {activeTab === 'rx' && (
                  <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-title-lg text-sm font-bold text-on-surface">
                        Đơn Thuốc Đang Dùng Hàng Ngày
                      </h4>
                      <button
                        onClick={() => onNavigateToPharmacy(currentPatient.id)}
                        className="px-3 py-1.5 rounded-xl bg-primary text-on-primary text-xs font-bold hover:bg-emerald-deep transition-all flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Kê Đơn Bổ Sung</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentPatient.medications.map((med, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold text-on-surface">{med.name}</span>
                              <span className="text-[10px] font-mono bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded">
                                {med.dosage}
                              </span>
                            </div>
                            <div className="text-[11px] text-on-surface-variant">
                              Đường dùng: <strong>{med.route}</strong>
                            </div>
                            <div className="text-xs text-primary font-medium mt-1">
                              {med.frequency}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab 5: DICOM */}
                {activeTab === 'dicom' && (
                  <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-title-lg text-sm font-bold text-on-surface">
                        Khảo Sát Hình Ảnh Học DICOM PACS 4K
                      </h4>
                      <span className="text-xs text-on-surface-variant font-mono">
                        Server: GrandCare-PACS-01 (Port 104)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="rounded-xl border border-outline-variant/30 overflow-hidden bg-black flex flex-col items-center justify-center p-4 text-center group cursor-pointer">
                        <div className="w-full h-36 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                          <span className="material-symbols-outlined text-[64px]">radiology</span>
                        </div>
                        <div className="text-xs font-bold text-white">X-Quang Ngực Thẳng (PA)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Bóng tim không to, phế trường sáng</div>
                      </div>

                      <div className="rounded-xl border border-outline-variant/30 overflow-hidden bg-black flex flex-col items-center justify-center p-4 text-center group cursor-pointer">
                        <div className="w-full h-36 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                          <span className="material-symbols-outlined text-[64px]">cardiology</span>
                        </div>
                        <div className="text-xs font-bold text-white">Siêu Âm Tim Doppler Màu</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">EF 58%, hở van 2 lá nhẹ 1/4</div>
                      </div>

                      <div className="rounded-xl border border-outline-variant/30 overflow-hidden bg-black flex flex-col items-center justify-center p-4 text-center group cursor-pointer">
                        <div className="w-full h-36 flex items-center justify-center text-slate-400 group-hover:text-emerald-400 transition-colors">
                          <span className="material-symbols-outlined text-[64px]">neurology</span>
                        </div>
                        <div className="text-xs font-bold text-white">MRI Sọ Não 3.0 Tesla</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">Không xuất huyết mới, thiếu máu cục bộ cũ</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 6: HL7 Event Stream */}
                {activeTab === 'hl7' && (
                  <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-title-lg text-sm font-bold text-on-surface">
                        HL7 v2.5.1 / FHIR R4 Event Stream
                      </h4>
                      <span className="text-xs text-vital-stable font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-vital-stable animate-ping"></span>
                        Listening trên cổng MLLP 2575
                      </span>
                    </div>

                    <div className="font-mono text-xs bg-slate-950 text-emerald-400 p-4 rounded-xl overflow-x-auto space-y-2 border border-slate-800">
                      <div className="text-slate-400 text-[11px]">// Live Pipe-delimited Messages for {currentPatient.name} ({currentPatient.id})</div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-amber-400 text-[10px]"># ADT^A01 (Admit / Visit Notification)</div>
                        <pre className="text-[11px] whitespace-pre-wrap">
{`MSH|^~\\&|GRANDCARE-HIS|CAMPUS-01|HL7-FHIR-CORE|AWS-VN|20260412104215||ADT^A01|MSG-9821|P|2.5.1
PID|1||${currentPatient.id}^^^GC^MR||${currentPatient.name}||${currentPatient.dob.replace(/-/g, '')}|${currentPatient.gender === 'Nam' ? 'M' : 'F'}
PV1|1|I|${currentPatient.room}|CARD|||DOC-01^${currentPatient.doctor}`}
                        </pre>
                      </div>

                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <div className="text-amber-400 text-[10px]"># ORU^R01 (Observation Result / Lab Telemetry)</div>
                        <pre className="text-[11px] whitespace-pre-wrap">
{`MSH|^~\\&|LAB-ROCHE-8000|CENTRAL-LAB|GRANDCARE-EHR|HIS|20260412103800||ORU^R01|LAB-4412|P|2.5.1
OBR|1||LAB-4412|CARDIAC_PANEL^Troponin T hs & NT-proBNP
OBX|1|NM|8867-4^Heart Rate||${currentPatient.vitals.hr}|bpm|60-100|N|||F
OBX|2|NM|2708-6^Oxygen Saturation||${currentPatient.vitals.spo2}|%|>95|N|||F`}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-on-surface-variant">
                Vui lòng chọn bệnh nhân từ danh sách để xem hồ sơ EHR.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* View Mode 2: Live Telemetry Monitor Grid */
        <div className="p-6 space-y-6 flex-1 bg-surface">
          {/* Top Live Waveform Monitor */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">ecg</span>
                <h3 className="font-title-lg text-base font-bold text-on-surface">
                  Sóng Điện Tim ECG Telemetry Đa Kênh (Chuyển Đạo II)
                </h3>
              </div>
              <div className="text-xs text-on-surface-variant font-mono">
                Đang truyền từ Bedside Monitor: <strong className="text-primary">{currentPatient.room}</strong>
              </div>
            </div>
            <div className="w-full h-32 rounded-xl overflow-hidden bg-[#00201e] border border-outline-variant/30 relative">
              <canvas ref={ecgCanvasRef} width={900} height={128} className="w-full h-full block" />
              <div className="absolute top-2 left-3 text-[11px] font-mono text-[#8fd3cd] font-bold">
                LEAD II · 25mm/s · 10mm/mV · HR: {currentPatient.vitals.hr} bpm
              </div>
            </div>
          </div>

          {/* Patient Vital Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((pat) => (
              <div
                key={pat.id}
                onClick={() => {
                  onSelectPatient(pat.id);
                  setViewMode('ehr');
                }}
                className={`p-5 rounded-2xl bg-surface-container-lowest border transition-all cursor-pointer hover:shadow-md ${
                  pat.statusType === 'critical'
                    ? 'border-emergency-red/60 ring-2 ring-emergency-red/10'
                    : pat.statusType === 'warning'
                    ? 'border-amber-400'
                    : 'border-outline-variant/30 hover:border-primary/50'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={pat.avatar || APP_IMAGES.defaultPatient}
                      alt={pat.name}
                      className="w-12 h-12 rounded-xl object-cover border border-outline-variant/30"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                      }}
                    />
                    <div>
                      <h4 className="font-title-md text-sm font-bold text-on-surface">
                        {pat.name}
                      </h4>
                      <div className="text-xs text-on-surface-variant font-mono">
                        {pat.room}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pat.statusType === 'critical'
                        ? 'bg-emergency-red text-white animate-pulse'
                        : pat.statusType === 'warning'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    {pat.status}
                  </span>
                </div>

                <div className="text-xs text-on-surface-variant font-medium mb-4 line-clamp-1">
                  {pat.diagnosis}
                </div>

                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-outline-variant/20 text-center font-mono">
                  <div className="p-2 rounded-lg bg-surface-clean">
                    <div className="text-[10px] text-on-surface-variant">HR</div>
                    <div className="text-sm font-bold text-primary tabular-nums">{pat.vitals.hr}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-clean">
                    <div className="text-[10px] text-on-surface-variant">NIBP</div>
                    <div className="text-xs font-bold text-on-surface tabular-nums">{pat.vitals.bp}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-clean">
                    <div className="text-[10px] text-on-surface-variant">SpO2</div>
                    <div className="text-sm font-bold text-vital-stable tabular-nums">{pat.vitals.spo2}%</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-clean">
                    <div className="text-[10px] text-on-surface-variant">Temp</div>
                    <div className="text-xs font-bold text-on-surface tabular-nums">{pat.vitals.temp}°C</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Tiếp Nhận Bệnh Nhân Mới */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface-clean rounded-2xl max-w-xl w-full p-6 shadow-xl border border-outline-variant/30 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">person_add</span>
                <h3 className="font-headline-sm text-lg text-primary font-bold">
                  Tiếp Nhận & Khởi Tạo Hồ Sơ Bệnh Nhân EHR
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Họ và Tên Bệnh Nhân *</label>
                  <input
                    type="text"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="Ví dụ: GS. Đỗ Văn Tuấn"
                    required
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Số Căn Cước (CCCD) *</label>
                  <input
                    type="text"
                    value={newPatientCccd}
                    onChange={(e) => setNewPatientCccd(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Ngày Sinh (DOB) *</label>
                  <input
                    type="date"
                    value={newPatientDob}
                    onChange={(e) => setNewPatientDob(e.target.value)}
                    required
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Giới Tính *</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Phòng Lưu Trú VIP *</label>
                  <select
                    value={newPatientRoom}
                    onChange={(e) => setNewPatientRoom(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  >
                    <option value="Phòng 301 VIP (Tổng Thống)">Phòng 301 VIP (Tổng Thống)</option>
                    <option value="Phòng 302 VIP (Villa Sen Vàng Sala)">Phòng 302 VIP (Villa Sen Vàng)</option>
                    <option value="Phòng 205 (Premier Bạch Đằng)">Phòng 205 (Premier Bạch Đằng)</option>
                    <option value="Phòng 303 Deluxe (Khu Vườn An Dưỡng)">Phòng 303 Deluxe (Khu Vườn An Dưỡng)</option>
                    <option value="Phòng 108 ICU Sub (Sanctuary Thảo Điền)">Phòng 108 ICU Sub (Sanctuary Thảo Điền)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Bác Sĩ Trưởng Kíp Phụ Trách *</label>
                  <select
                    value={newPatientDoctor}
                    onChange={(e) => setNewPatientDoctor(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30"
                  >
                    <option value="GS.TS Nguyễn Anh Tuấn">GS.TS Nguyễn Anh Tuấn (Tim Mạch)</option>
                    <option value="PGS.TS Trần Hoài Nam">PGS.TS Trần Hoài Nam (Lão Khoa)</option>
                    <option value="TS.BS Lê Thị Minh Châu">TS.BS Lê Thị Minh Châu (ICU)</option>
                    <option value="BSCKII Hoàng Văn Thái">BSCKII Hoàng Văn Thái (Đột Quỵ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Chẩn Đoán Nhập Viện Lâm Sàng *</label>
                <input
                  type="text"
                  value={newPatientDiagnosis}
                  onChange={(e) => setNewPatientDiagnosis(e.target.value)}
                  required
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Mã ICD-10 Chuẩn Hóa *</label>
                <input
                  type="text"
                  value={newPatientIcd10}
                  onChange={(e) => setNewPatientIcd10(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono"
                />
              </div>

              {/* Vitals row */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-on-surface mb-0.5">HR (bpm)</label>
                  <input
                    type="number"
                    value={newPatientHr}
                    onChange={(e) => setNewPatientHr(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-0.5">Huyết Áp</label>
                  <input
                    type="text"
                    value={newPatientBp}
                    onChange={(e) => setNewPatientBp(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-0.5">SpO2 (%)</label>
                  <input
                    type="number"
                    value={newPatientSpo2}
                    onChange={(e) => setNewPatientSpo2(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-on-surface mb-0.5">Thân Nhiệt</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPatientTemp}
                    onChange={(e) => setNewPatientTemp(Number(e.target.value))}
                    className="w-full h-8 px-2 rounded-lg bg-surface-container-low border border-outline-variant/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Cảnh Báo Dị Ứng Thuốc</label>
                <input
                  type="text"
                  value={newPatientAllergies}
                  onChange={(e) => setNewPatientAllergies(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low border border-outline-variant/30"
                />
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-bold shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Tạo Bệnh Án & Phát HL7 ADT^A01</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: FHIR R4 Inspector */}
      {showFhirInspector && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 text-slate-100 rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-800 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-[24px]">data_object</span>
                <div>
                  <h3 className="font-headline-sm text-lg text-white font-bold">
                    HL7® FHIR® R4 Resource Inspector
                  </h3>
                  <div className="text-[11px] text-slate-400">
                    Bệnh nhân: {currentPatient?.name} ({currentPatient?.id})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowFhirInspector(false)}
                className="text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Resource Selector Tabs */}
            <div className="flex items-center gap-1 mb-3 text-xs">
              {(['Patient', 'Observation', 'MedicationRequest', 'DiagnosticReport'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setFhirResourceTab(res)}
                  className={`px-3 py-1.5 rounded-lg font-mono font-medium transition-colors ${
                    fhirResourceTab === res
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            {/* JSON Viewer */}
            <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300">
              <pre className="whitespace-pre-wrap">{getFhirJson()}</pre>
            </div>

            {/* Footer actions */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between mt-3 text-xs">
              <span className="text-slate-400">
                Tuân thủ HL7 FHIR US Core / VN MoH Standards
              </span>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {copiedFhir ? 'done' : 'content_copy'}
                </span>
                <span>{copiedFhir ? 'Đã Sao Chép JSON!' : 'Sao Chép FHIR Payload'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
