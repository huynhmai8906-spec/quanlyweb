import React, { useState } from 'react';
import { Patient, Doctor } from '../types';

interface TelehealthViewProps {
  patients: Patient[];
  doctors: Doctor[];
  selectedPatientId?: string;
}

export const TelehealthView: React.FC<TelehealthViewProps> = ({
  patients,
  doctors,
  selectedPatientId,
}) => {
  const currentPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];

  // Video call controls
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState(
    'Hội chẩn đa chuyên khoa cùng Cleveland Clinic: Bệnh nhân đáp ứng tốt với phác đồ Entresto kết hợp ức chế SGLT2. Khuyến nghị duy trì liều hiện tại, làm lại siêu âm Doppler tim sau 3 tuần.'
  );

  // Modal & Sync state
  const [showDeviceModal, setShowDeviceModal] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [showSyncToast, setShowSyncToast] = useState(false);

  const handleSyncCalendar = () => {
    setIsSyncingCalendar(true);
    setTimeout(() => {
      setIsSyncingCalendar(false);
      setShowSyncToast(true);
      setTimeout(() => setShowSyncToast(false), 3000);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Command Bar & Clinical Context */}
        <div className="px-6 py-4 bg-surface-clean rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                Telehealth 4K Clinical Hub
              </span>
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                Trực Tiếp (Live Room #01)
              </span>
            </div>
            <h2 className="font-headline-sm text-xl text-primary font-bold mt-1">
              Lịch Khám Chuyên Khoa & Hội Chẩn Telehealth Trực Tuyến
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowDeviceModal(true)}
              className="h-9 px-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">settings_video_camera</span>
              <span>Kiểm Tra Thiết Bị</span>
            </button>

            <button
              onClick={handleSyncCalendar}
              disabled={isSyncingCalendar}
              className="h-9 px-4 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span
                className={`material-symbols-outlined text-[18px] ${
                  isSyncingCalendar ? 'animate-spin' : ''
                }`}
              >
                sync
              </span>
              <span>{isSyncingCalendar ? 'Đang Đồng Bộ...' : 'Đồng Bộ Google Calendar'}</span>
            </button>
          </div>
        </div>

        {/* Sync Toast Feedback */}
        {showSyncToast && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[20px]">cloud_done</span>
              <span>Đã đồng bộ thành công 8 lịch hội chẩn Telehealth hôm nay với Google Calendar của đội ngũ chuyên gia!</span>
            </div>
            <button onClick={() => setShowSyncToast(false)} className="text-emerald-700 hover:text-emerald-900">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Center Grid: Virtual Video Room & Consultation Timeline */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Main Video Room: 8 Columns */}
          <div className="xl:col-span-8 flex flex-col gap-4">
            <div className="rounded-2xl bg-slate-950 border border-slate-800 shadow-md overflow-hidden relative">
              {/* Top video room toolbar */}
              <div className="absolute top-0 inset-x-0 z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Grand Round Quốc Tế: Ca {currentPatient.name}</span>
                  <span className="font-mono text-[11px] text-slate-300">({currentPatient.id})</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-600/80 font-bold">4K UHD</span>
                  <span>00:24:18</span>
                </div>
              </div>

              {/* Main Participant Video (Cleveland Clinic Specialist) */}
              <div className="relative w-full h-[380px] lg:h-[460px] bg-slate-900 flex items-center justify-center overflow-hidden">
                {isCamOn ? (
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNccWQrK2-6vrKLBFBCoH3rcaqeTt3TH3W7Vxovxuq-t4PY2"
                    alt="Dr. Robert Miller - Cleveland Clinic"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <span className="material-symbols-outlined text-[64px]">videocam_off</span>
                    <span className="text-xs mt-2 font-medium">Camera chính đang tắt</span>
                  </div>
                )}

                {/* Sub Video Overlays (PIP Gallery) */}
                <div className="absolute bottom-16 right-4 z-20 flex flex-col sm:flex-row gap-2.5">
                  <div className="w-28 sm:w-36 h-20 sm:h-24 rounded-xl bg-slate-800 border-2 border-slate-700 overflow-hidden shadow-lg relative">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxNACeICO56gGjqBv1W_kAQVSgWdC99MNl2-qYQXJeVytau3"
                      alt="Dr. Sarah Jenkins"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 left-1.5 text-[9px] bg-black/60 px-1 rounded text-white font-medium truncate max-w-[90%]">
                      Dr. Jenkins (Johns Hopkins)
                    </div>
                  </div>

                  <div className="w-28 sm:w-36 h-20 sm:h-24 rounded-xl bg-slate-800 border-2 border-primary/80 overflow-hidden shadow-lg relative">
                    <img
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuArPJuzJJIJYZtT1C8UMC99NpOtBa-8fVDDumr91jByAE1VGO"
                      alt="PGS.TS Trần Vinh Quang"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-1 left-1.5 text-[9px] bg-black/60 px-1 rounded text-emerald-300 font-bold truncate max-w-[90%]">
                      PGS.TS Trần Vinh Quang (GC)
                    </div>
                  </div>
                </div>

                {/* Video controls bar at bottom */}
                <div className="absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black/90 to-transparent flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
                      isMicOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title={isMicOn ? 'Tắt mic' : 'Bật mic'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isMicOn ? 'mic' : 'mic_off'}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsCamOn(!isCamOn)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
                      isCamOn ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'
                    }`}
                    title={isCamOn ? 'Tắt camera' : 'Bật camera'}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isCamOn ? 'videocam' : 'videocam_off'}
                    </span>
                  </button>

                  <button
                    onClick={() => setIsScreenSharing(!isScreenSharing)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition-colors ${
                      isScreenSharing ? 'bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                    title="Chia sẻ màn hình"
                  >
                    <span className="material-symbols-outlined text-[20px]">screen_share</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Đã lưu biên bản và hoàn tất phiên hội chẩn Telehealth.');
                    }}
                    className="h-10 px-4 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors ml-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">call_end</span>
                    <span>Kết Thúc</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Clinical Notes & Consensus Scratchpad */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-title-lg text-sm font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">edit_note</span>
                  <span>Biên Bản Kết Luận Hội Chẩn Đa Chuyên Khoa</span>
                </h4>
                <span className="text-[11px] text-on-surface-variant font-mono">Tự động lưu vào EHR Master</span>
              </div>
              <textarea
                value={consultationNotes}
                onChange={(e) => setConsultationNotes(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-xl bg-surface-clean border border-outline-variant/30 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Right Sidebar: Timeline & On-duty doctors (4 Columns) */}
          <div className="xl:col-span-4 space-y-6">
            {/* Today Appointments */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs">
              <h4 className="font-title-lg text-sm font-bold text-on-surface mb-3 flex items-center justify-between">
                <span>Lịch Khám Telehealth Hôm Nay</span>
                <span className="text-xs text-primary font-bold">4 ca</span>
              </h4>

              <div className="space-y-3">
                {[
                  {
                    time: '09:00 - 09:45',
                    patient: 'Nguyễn Văn An',
                    doctor: 'Dr. Robert Miller & PGS.TS Quang',
                    type: 'Hội Chẩn Quốc Tế',
                    status: 'Đang diễn ra',
                    active: true,
                  },
                  {
                    time: '10:30 - 11:15',
                    patient: 'Trần Thị Mai',
                    doctor: 'TS.BS Lê Hồng Hùng',
                    type: 'Rung Nhĩ / Tim Mạch',
                    status: 'Chờ kết nối',
                    active: false,
                  },
                  {
                    time: '14:00 - 14:45',
                    patient: 'Hoàng Quốc Tuấn',
                    doctor: 'PGS.TS Trần Hoài Nam',
                    type: 'Phục Hồi Thần Kinh',
                    status: 'Đã xác nhận',
                    active: false,
                  },
                  {
                    time: '15:30 - 16:15',
                    patient: 'GS. Đặng Văn Nam',
                    doctor: 'TS.BS Nguyễn Phương Lan',
                    type: 'Tái Khám CRT-D',
                    status: 'Đã xác nhận',
                    active: false,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      item.active
                        ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                        : 'bg-surface-clean border-outline-variant/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-primary">{item.time}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.active
                            ? 'bg-rose-100 text-rose-800 animate-pulse'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="font-bold text-on-surface">{item.patient}</div>
                    <div className="text-[11px] text-on-surface-variant">{item.doctor}</div>
                    <div className="text-[10px] text-primary font-semibold mt-1">● {item.type}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctors on Duty Today */}
            <div className="p-5 rounded-2xl bg-surface-clean border border-outline-variant/30 shadow-xs">
              <h4 className="font-title-lg text-sm font-bold text-on-surface mb-3">
                Bác Sĩ Trực Ca Sáng Nay
              </h4>
              <div className="space-y-3">
                {doctors.slice(0, 3).map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 text-xs">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-10 h-10 rounded-xl object-cover border border-outline-variant/30 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-on-surface truncate">{doc.name}</div>
                      <div className="text-[11px] text-primary truncate">{doc.specialty}</div>
                      <div className="text-[10px] text-vital-stable font-semibold">● {doc.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Kiểm Tra Thiết Bị & Camera */}
      {showDeviceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-clean rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant/30">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">tune</span>
                <h3 className="font-headline-sm text-base text-primary font-bold">
                  Kiểm Tra Thiết Bị & Camera / Microphone
                </h3>
              </div>
              <button
                onClick={() => setShowDeviceModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Camera Preview Simulation */}
              <div className="h-44 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                <span className="material-symbols-outlined text-[48px] text-slate-600 mb-1">videocam</span>
                <span>Logitech Brio 4K Ultra HD (Đang hoạt động 60fps)</span>
                <span className="text-[10px] text-emerald-400 font-mono mt-1">Độ phân giải: 3840 x 2160 @ 60Hz</span>
              </div>

              {/* Mic volume meter simulation */}
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Đo Độ Nhạy Microphone (Jabra Speak 750)
                </label>
                <div className="w-full bg-surface-container rounded-full h-2.5 overflow-hidden flex">
                  <div className="bg-vital-stable h-full rounded-full transition-all" style={{ width: '74%' }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 font-mono">
                  <span>Mức âm lượng đầu vào: -12 dB</span>
                  <span className="text-vital-stable font-bold">Rõ nét / Khử ồn AI</span>
                </div>
              </div>

              {/* Network latency test */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Độ trễ WebRTC RTT:</span>
                  <span className="text-vital-stable font-bold">14 ms (Tuyệt vời)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Mất gói (Packet Loss):</span>
                  <span className="text-vital-stable font-bold">0.00%</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 flex items-center justify-end gap-2 mt-4 text-xs">
              <button
                onClick={() => setShowDeviceModal(false)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-bold shadow-sm"
              >
                Xác Nhận Thiết Bị Sẵn Sàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
