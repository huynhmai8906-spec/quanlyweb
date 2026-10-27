import React from 'react';
import { NavigationTab, Patient } from '../types';
import { APP_IMAGES, SAFE_FALLBACK_AVATAR } from '../assets/images';

interface DashboardViewProps {
  onNavigateTab: (tab: NavigationTab) => void;
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  pendingRxCount: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  patients,
  onSelectPatient,
  pendingRxCount,
}) => {
  return (
    <div className="p-gutter lg:p-margin flex flex-col gap-space-xl max-w-7xl mx-auto w-full">
      {/* Hero Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest shadow-md border border-outline-variant/30 flex flex-col lg:flex-row">
        <div className="lg:w-7/12 relative min-h-[320px] lg:min-h-[440px] overflow-hidden bg-slate-900">
          <img
            src={APP_IMAGES.hospitalResortHero}
            alt="Tổ Hợp Y Tế Quốc Tế GoCare"
            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.opacity = '0.7';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent lg:hidden flex flex-col justify-end p-6 text-white">
            <span className="text-xs uppercase tracking-widest text-emerald-300 font-bold mb-1">
              Tiêu Chuẩn JCI Hoa Kỳ & Nghỉ Dưỡng 5 Sao
            </span>
            <h3 className="text-2xl font-bold font-serif leading-tight">
              Viện Quốc Tế GoCare
            </h3>
          </div>
        </div>

        <div className="lg:w-5/12 p-6 lg:p-8 flex flex-col justify-between bg-surface-clean">
          <div>
            <div className="flex items-center gap-2 text-xs text-primary font-bold uppercase tracking-wider mb-2">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Tổ Hợp Y Khoa Lâm Sàng Đa Mô Thức</span>
            </div>
            <h2 className="font-display-lg text-2xl lg:text-3xl text-primary font-bold leading-snug tracking-tight mb-3">
              Tổ Hợp Y Tế Quốc Tế & Nghỉ Dưỡng Lão Khoa GoCare
            </h2>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed mb-4">
              Tiên phong mô hình kết hợp bệnh viện đa khoa chuyên sâu chuẩn JCI và khu an dưỡng trị liệu 5 sao ven sông Sài Gòn. Hệ thống số hoá toàn diện với chuẩn liên thông dữ liệu lâm sàng HL7 v2.5.1 và FHIR R4.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2 mb-6 border-t border-outline-variant/20">
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="text-[11px] text-on-surface-variant font-medium">Công suất giường</div>
                <div className="text-xl font-bold font-mono text-primary tabular-nums mt-0.5">
                  388 / 450
                </div>
                <div className="text-[10px] text-vital-stable font-semibold">86.2% Đang điều trị</div>
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                <div className="text-[11px] text-on-surface-variant font-medium">Hội đồng Cố vấn</div>
                <div className="text-xl font-bold font-mono text-emerald-deep tabular-nums mt-0.5">
                  48 GS / BS
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">14 Giáo sư trực tuần</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-outline-variant/20">
            <button
              onClick={() => onNavigateTab('patients')}
              className="flex-1 h-11 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-title-sm text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
              <span>Mở Hồ Sơ Bệnh Nhân EHR</span>
            </button>
            <button
              onClick={() => onNavigateTab('emergency')}
              className="flex-1 h-11 rounded-xl bg-emergency-red hover:bg-red-700 text-white font-title-sm text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">emergency</span>
              <span>Điều Phối Cấp Cứu 115</span>
            </button>
          </div>
        </div>
      </div>

      {/* Facilities Showcase: 3 Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="font-label-sm text-xs uppercase text-primary font-bold tracking-wider">
              Hạ Tầng Y Tế Đạt Chuẩn JCI
            </span>
            <h3 className="font-headline-md text-xl lg:text-2xl text-on-surface font-bold">
              Không Gian Trị Liệu & Năng Lực Cấp Cứu Thực Tế
            </h3>
          </div>
          <button
            onClick={() => onNavigateTab('rooms')}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span>Xem toàn bộ sơ đồ phòng</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Facility 1 */}
          <div
            onClick={() => onNavigateTab('rooms')}
            className="group rounded-2xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src={APP_IMAGES.vipHospitalSuite}
                alt="Phòng Tổng Thống VIP"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.7';
                }}
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-bold">
                Khu Đông VIP
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-title-lg text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-1.5">
                  Phòng Tổng Thống VIP & Suite Lão Khoa
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Thiết kế biệt lập ven sông, trang bị giường cơ điện Stryker In-Touch, hệ thống áp suất buồng dương và điều hòa khí sạch HEPA H14.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-bold">● Đang hoạt động 12 phòng</span>
                <span className="text-primary font-semibold flex items-center gap-0.5">
                  Điều khiển IoT <span className="material-symbols-outlined text-[14px]">sensors</span>
                </span>
              </div>
            </div>
          </div>

          {/* Facility 2 */}
          <div
            onClick={() => onNavigateTab('rooms')}
            className="group rounded-2xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src={APP_IMAGES.hospitalIcuRoom}
                alt="ICU Cấp Độ 1"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.7';
                }}
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-bold">
                Khu Cấp Cứu ICU
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-title-lg text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-1.5">
                  Trung Tâm Hồi Sức Tích Cực ICU Cấp Độ 1
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Hạ tầng kỹ thuật hỗ trợ ECMO, bóng đối xung động mạch chủ IABP, máy lọc máu liên tục CRRT và hệ thống monitor trung tâm Mindray BeneVision.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-rose-600 font-bold">● 24 Giường sẵn sàng 24/7</span>
                <span className="text-primary font-semibold flex items-center gap-0.5">
                  Khí y tế tự động <span className="material-symbols-outlined text-[14px]">tune</span>
                </span>
              </div>
            </div>
          </div>

          {/* Facility 3 */}
          <div
            onClick={() => onNavigateTab('telehealth')}
            className="group rounded-2xl bg-surface-container-lowest border border-outline-variant/30 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-slate-900">
              <img
                src={APP_IMAGES.hospitalZenGarden}
                alt="Vườn Thiền Trị Liệu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.opacity = '0.7';
                }}
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-bold">
                Khu Tây Lão Khoa
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h4 className="font-title-lg text-base font-bold text-on-surface group-hover:text-primary transition-colors mb-1.5">
                  Vườn Thiền Nhật Bản & Thuỷ Trị Liệu
                </h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Hệ sinh thái an dưỡng phục hồi chức năng thần kinh, hỗ trợ bệnh nhân sa sút trí tuệ, sau tai biến mạch máu não và trị liệu âm ngữ.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-outline-variant/20 flex items-center justify-between text-xs">
                <span className="text-vital-stable font-bold">● Trị liệu vận động cá thể hoá</span>
                <span className="text-primary font-semibold flex items-center gap-0.5">
                  Lịch trị liệu <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Clinical Pulse Section */}
      <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-vital-stable animate-ping"></span>
              <span className="font-label-sm text-xs uppercase text-emerald-deep font-bold tracking-wider">
                Nhịp Sống Lâm Sàng & Hoạt Động Trực Tiếp (Live Clinical Pulse)
              </span>
            </div>
            <h3 className="font-headline-sm text-lg text-on-surface font-bold mt-1">
              Thông Số Vận Hành Toàn Viện Hôm Nay
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant">Cập nhật theo chu kỳ 5 giây</span>
            <button
              onClick={() => onNavigateTab('emergency')}
              className="px-3 py-1.5 rounded-lg bg-sapphire-dispatch text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-slate-800 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">navigation</span>
              <span>Giám sát 115 GPS</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20">
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-medium">Bệnh Nhân Đang Nằm Viện</span>
              <span className="material-symbols-outlined text-[18px] text-primary">personal_injury</span>
            </div>
            <div className="text-2xl font-bold font-mono text-primary tabular-nums">388</div>
            <div className="text-[11px] text-vital-stable mt-1">▲ Tăng 4 ca so với hôm qua</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20">
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-medium">Phẫu Thuật & Can Thiệp Tim</span>
              <span className="material-symbols-outlined text-[18px] text-clinical-amber">cardiology</span>
            </div>
            <div className="text-2xl font-bold font-mono text-on-surface tabular-nums">14</div>
            <div className="text-[11px] text-amber-700 mt-1">4 ca đang diễn ra tại DSA & OR</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20">
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-medium">Đơn Dược Chờ & Đang Giao</span>
              <span className="material-symbols-outlined text-[18px] text-secondary">local_shipping</span>
            </div>
            <div className="text-2xl font-bold font-mono text-secondary tabular-nums">
              {pendingRxCount}
            </div>
            <div className="text-[11px] text-primary mt-1">Chuẩn giao tốc hành nội viện</div>
          </div>

          <div className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20">
            <div className="flex items-center justify-between text-on-surface-variant mb-1">
              <span className="text-xs font-medium">Xe Cứu Thương Mobile ICU</span>
              <span className="material-symbols-outlined text-[18px] text-emergency-red">ambulance</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emergency-red tabular-nums">4 / 4</div>
            <div className="text-[11px] text-emerald-700 mt-1">1 xe đang cấp cứu ngoại viện</div>
          </div>
        </div>

        {/* Real-time Patient Telemetry Preview Strip */}
        <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                Bệnh Nhân Đang Theo Dõi Trọng Điểm
              </span>
              <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                EHR Real-Time
              </span>
            </div>
            <button
              onClick={() => onNavigateTab('patients')}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
            >
              <span>Xem tất cả hồ sơ</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {patients.slice(0, 3).map((pat) => (
              <div
                key={pat.id}
                onClick={() => {
                  onSelectPatient(pat.id);
                  onNavigateTab('patients');
                }}
                className="p-3 rounded-xl bg-surface-clean border border-outline-variant/30 hover:border-primary/50 transition-all cursor-pointer shadow-2xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={pat.avatar || APP_IMAGES.defaultPatient}
                    alt={pat.name}
                    className="w-10 h-10 rounded-full object-cover border border-outline-variant/30 shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                    }}
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-on-surface truncate">{pat.name}</div>
                    <div className="text-[11px] text-on-surface-variant truncate">{pat.room}</div>
                    <div className="text-[10px] text-primary font-medium truncate">{pat.doctor}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-mono font-bold text-primary tabular-nums">
                    {pat.vitals.hr} bpm
                  </div>
                  <div className="text-[11px] font-mono text-on-surface-variant tabular-nums">
                    {pat.vitals.bp}
                  </div>
                  <div className="text-[10px] font-semibold text-vital-stable">
                    SpO2 {pat.vitals.spo2}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Launch Grid */}
      <div>
        <h4 className="font-title-lg text-base font-bold text-on-surface mb-3">
          Truy Cập Nhanh Phân Hệ Quản Trị Y Khoa
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { key: 'patients', label: 'Hồ Sơ EHR Master', icon: 'clinical_notes', color: 'text-primary bg-primary/10' },
            { key: 'pharmacy', label: 'Kho Dược & API', icon: 'medication', color: 'text-amber-800 bg-amber-100' },
            { key: 'doctors', label: 'Hội Đồng Y Khoa', icon: 'badge', color: 'text-emerald-800 bg-emerald-100' },
            { key: 'telehealth', label: 'Telehealth 4K', icon: 'video_camera_front', color: 'text-teal-800 bg-teal-100' },
            { key: 'rooms', label: 'Sơ Đồ Phòng IoT', icon: 'single_bed', color: 'text-blue-800 bg-blue-100' },
            { key: 'emergency', label: 'Cấp Cứu 115 GPS', icon: 'emergency', color: 'text-rose-800 bg-rose-100' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => onNavigateTab(item.key as NavigationTab)}
              className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 hover:shadow-sm hover:border-primary/40 transition-all text-left flex flex-col justify-between group"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${item.color}`}>
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </div>
              <span className="font-title-sm text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
