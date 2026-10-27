import React, { useState } from 'react';
import { Doctor } from '../types';
import { APP_IMAGES, SAFE_FALLBACK_AVATAR } from '../assets/images';

interface DoctorsViewProps {
  doctors: Doctor[];
  onAddDoctor: (newDoctor: Doctor) => void;
  onConsultDoctor: (doctorId: string) => void;
}

export const DoctorsView: React.FC<DoctorsViewProps> = ({
  doctors,
  onAddDoctor,
  onConsultDoctor,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [searchDocQuery, setSearchDocQuery] = useState('');

  // Form states for adding doctor
  const [docName, setDocName] = useState('');
  const [docDegree, setDocDegree] = useState<'GS.TS' | 'PGS.TS' | 'TS.BS' | 'BSCKII' | 'ThS.BS' | 'BSCKI'>('TS.BS');
  const [docSpecialty, setDocSpecialty] = useState('Tim Mạch Can Thiệp');
  const [docLicense, setDocLicense] = useState('019842/BYT-CCHN');
  const [docAffiliation, setDocAffiliation] = useState('Bệnh viện Đại học Y Dược TP.HCM');
  const [docShifts, setDocShifts] = useState<('Sáng' | 'Chiều' | 'Đêm C/C')[]>(['Sáng']);
  const [addNotice, setAddNotice] = useState(false);

  // Filtered doctors
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSpec = selectedSpecialty === 'all' || doc.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesQuery =
      doc.name.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
      doc.licenseNumber.toLowerCase().includes(searchDocQuery.toLowerCase());
    return matchesSpec && matchesQuery;
  });

  const handleToggleShift = (shift: 'Sáng' | 'Chiều' | 'Đêm C/C') => {
    if (docShifts.includes(shift)) {
      if (docShifts.length > 1) {
        setDocShifts(docShifts.filter((s) => s !== shift));
      }
    } else {
      setDocShifts([...docShifts, shift]);
    }
  };

  const handleAddDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName.trim()) return;

    const newDoc: Doctor = {
      id: `DOC-${Date.now()}`,
      name: `${docDegree} ${docName}`,
      degree: docDegree,
      specialty: docSpecialty,
      position: `Chuyên gia Cố vấn ${docSpecialty}`,
      department: `Khoa ${docSpecialty} & Nghiên Cứu Lâm Sàng`,
      hospitalAffiliation: docAffiliation,
      licenseNumber: docLicense,
      status: 'Sẵn sàng hội chẩn',
      shifts: docShifts,
      rating: 4.95,
      consultationCount: 1,
      avatar: APP_IMAGES.doctorVietnameseMale,
    };

    onAddDoctor(newDoc);
    setAddNotice(true);
    setDocName('');
    setTimeout(() => setAddNotice(false), 3500);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Analytical & Status Stream */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
              <span>Tổng Chuyên Gia Cố Vấn</span>
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[18px]">school</span>
              </span>
            </div>
            <div className="my-2 text-3xl font-bold font-display-lg text-primary tabular-nums">
              {doctors.length}
            </div>
            <div className="text-xs text-vital-stable font-semibold">
              100% Học hàm Giáo sư, Tiến sĩ, CKII
            </div>
          </div>

          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
              <span>Trực Tuần Này</span>
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800">
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              </span>
            </div>
            <div className="my-2 text-3xl font-bold font-display-lg text-emerald-deep tabular-nums">
              14
            </div>
            <div className="text-xs text-on-surface-variant font-medium">
              Phân bổ 3 ca trực liên tục 24/7
            </div>
          </div>

          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
              <span>Thường Trực Cấp 1</span>
              <span className="p-1.5 rounded-lg bg-amber-50 text-amber-800">
                <span className="material-symbols-outlined text-[18px]">medical_services</span>
              </span>
            </div>
            <div className="my-2 text-3xl font-bold font-display-lg text-amber-700 tabular-nums">
              8
            </div>
            <div className="text-xs text-amber-800 font-semibold">
              Kích hoạt Báo Động Đỏ trong 5 phút
            </div>
          </div>

          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 flex flex-col justify-between">
            <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold uppercase tracking-wider">
              <span>Hội Chẩn Đa Mô Thức</span>
              <span className="p-1.5 rounded-lg bg-secondary-fixed text-sapphire-dispatch">
                <span className="material-symbols-outlined text-[18px]">diversity_3</span>
              </span>
            </div>
            <div className="my-2 text-3xl font-bold font-display-lg text-sapphire-dispatch tabular-nums">
              24
            </div>
            <div className="text-xs text-vital-stable font-semibold">
              Liên kết Cleveland Clinic & Chợ Rẫy
            </div>
          </div>
        </div>

        {/* Section 1: Specialists Directory */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                Danh Sách Giáo Sư & Chuyên Gia Cố Vấn Hội Đồng
              </h3>
              <p className="text-xs text-on-surface-variant">
                Chuyên gia đầu ngành lâm sàng chịu trách nhiệm thẩm định phác đồ điều trị và bảo trợ chuyên môn
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchDocQuery}
                  onChange={(e) => setSearchDocQuery(e.target.value)}
                  placeholder="Tìm bác sĩ, CCHN..."
                  className="h-9 pl-8 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Specialty filter buttons */}
              <div className="flex items-center gap-1 overflow-x-auto text-xs">
                {[
                  { key: 'all', label: 'Tất Cả' },
                  { key: 'Tim Mạch', label: 'Tim Mạch' },
                  { key: 'Lão Khoa', label: 'Lão Khoa' },
                  { key: 'ICU', label: 'Hồi Sức ICU' },
                  { key: 'Nội Tiết', label: 'Nội Tiết' },
                  { key: 'Cấp Cứu', label: 'Cấp Cứu 115' },
                ].map((spec) => (
                  <button
                    key={spec.key}
                    onClick={() => setSelectedSpecialty(spec.key)}
                    className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      selectedSpecialty === spec.key
                        ? 'bg-primary text-white font-bold'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {spec.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl bg-surface-clean border border-outline-variant/30 hover:border-primary/50 transition-all flex flex-col justify-between shadow-2xs group"
              >
                <div>
                  <div className="flex items-start gap-4 mb-3">
                    <img
                      src={doc.avatar || APP_IMAGES.defaultDoctor}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-primary/20 shrink-0 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = SAFE_FALLBACK_AVATAR;
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                        {doc.degree}
                      </span>
                      <h4 className="font-title-lg text-base font-bold text-on-surface truncate mt-1">
                        {doc.name}
                      </h4>
                      <div className="text-xs text-primary font-semibold truncate">
                        {doc.specialty}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant font-medium leading-relaxed mb-2 line-clamp-2">
                    {doc.position}
                  </p>
                  <p className="text-[11px] text-on-surface-variant/80 italic mb-3">
                    {doc.hospitalAffiliation}
                  </p>

                  <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-1 mb-4 text-xs font-mono">
                    <div className="flex justify-between text-on-surface-variant">
                      <span>CCHN:</span>
                      <span className="text-on-surface font-bold">{doc.licenseNumber}</span>
                    </div>
                    <div className="flex justify-between text-on-surface-variant">
                      <span>Ca trực:</span>
                      <span className="text-emerald-800 font-semibold">{doc.shifts.join(' · ')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-amber-500 font-bold">★ {doc.rating}</span>
                    <span className="text-[11px] text-on-surface-variant">({doc.consultationCount} ca)</span>
                  </div>

                  <button
                    onClick={() => onConsultDoctor(doc.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">video_call</span>
                    <span>Hội Chẩn Telehealth</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Ma Trận Lịch Trực Tuần Hội Đồng */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                Ma Trận Lịch Trực Tuần Hội Đồng Y Khoa
              </h3>
              <p className="text-xs text-on-surface-variant">
                Lịch phân công trực chuyên khoa cấp 1 & hỗ trợ hội chẩn trực tuyến 24/7
              </p>
            </div>
            <span className="text-xs text-primary font-bold">Tuần 15 (12/04 - 18/04/2026)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-outline-variant/20 rounded-xl overflow-hidden">
              <thead>
                <tr className="bg-surface-clean border-b border-outline-variant/30 text-on-surface-variant font-bold">
                  <th className="py-3 px-3">Ca Trực / Ngày</th>
                  {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((day) => (
                    <th key={day} className="py-3 px-3">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                <tr>
                  <td className="py-3 px-3 font-bold text-primary bg-surface-container-low">
                    Ca Sáng (07:00 - 13:00)
                  </td>
                  <td className="py-3 px-3">GS.TS Nguyễn Anh Tuấn</td>
                  <td className="py-3 px-3">PGS.TS Trần Hoài Nam</td>
                  <td className="py-3 px-3">GS.TS Nguyễn Anh Tuấn</td>
                  <td className="py-3 px-3">PGS.TS Đặng Quỳnh Nga</td>
                  <td className="py-3 px-3">BSCKII Hoàng Văn Thái</td>
                  <td className="py-3 px-3">BSCKI Vũ Đức Thịnh</td>
                  <td className="py-3 px-3">GS.TS Nguyễn Anh Tuấn</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-emerald-deep bg-surface-container-low">
                    Ca Chiều (13:00 - 19:00)
                  </td>
                  <td className="py-3 px-3">TS.BS Lê Thị Minh Châu</td>
                  <td className="py-3 px-3">BSCKII Hoàng Văn Thái</td>
                  <td className="py-3 px-3">PGS.TS Trần Hoài Nam</td>
                  <td className="py-3 px-3">TS.BS Lê Thị Minh Châu</td>
                  <td className="py-3 px-3">PGS.TS Đặng Quỳnh Nga</td>
                  <td className="py-3 px-3">TS.BS Lê Thị Minh Châu</td>
                  <td className="py-3 px-3">BSCKI Vũ Đức Thịnh</td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-bold text-emergency-red bg-surface-container-low">
                    Đêm C/C (19:00 - 07:00)
                  </td>
                  <td className="py-3 px-3 font-semibold text-emergency-red">BSCKI Vũ Đức Thịnh</td>
                  <td className="py-3 px-3 font-semibold text-emergency-red">TS.BS Lê Thị Minh Châu</td>
                  <td className="py-3 px-3 font-semibold text-emergency-red">BSCKI Vũ Đức Thịnh</td>
                  <td className="py-3 px-3 font-semibold text-emergency-red">GS.TS Nguyễn Anh Tuấn</td>
                  <td className="py-3 px-3 font-semibold text-emergency-red">TS.BS Lê Thị Minh Châu</td>
                  <td className="py-3 px-3 font-semibold text-emergency-red">BSCKI Vũ Đức Thịnh</td>
                  <td className="py-3 px-3 font-semibold text-emergency-red">TS.BS Lê Thị Minh Châu</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Form Thêm Bác Sĩ Mới & Clinical Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
            <h3 className="font-headline-sm text-lg text-primary font-bold mb-1">
              Thêm Bác Sĩ & Chuyên Gia Cố Vấn Mới
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Điền hồ sơ y khoa để hội đồng thẩm định và phân bổ lịch trực lâm sàng
            </p>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Họ và Tên Bác Sĩ *</label>
                  <input
                    type="text"
                    value={docName}
                    onChange={(e) => setDocName(e.target.value)}
                    placeholder="Ví dụ: Nguyễn Minh Đức"
                    required
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                  />
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Học Hàm / Học Vị *</label>
                  <select
                    value={docDegree}
                    onChange={(e) => setDocDegree(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-medium"
                  >
                    <option value="GS.TS">Giáo Sư, Tiến Sĩ (GS.TS)</option>
                    <option value="PGS.TS">Phó Giáo Sư, Tiến Sĩ (PGS.TS)</option>
                    <option value="TS.BS">Tiến Sĩ, Bác Sĩ (TS.BS)</option>
                    <option value="BSCKII">Bác Sĩ Chuyên Khoa II (BSCKII)</option>
                    <option value="ThS.BS">Thạc Sĩ, Bác Sĩ (ThS.BS)</option>
                    <option value="BSCKI">Bác Sĩ Chuyên Khoa I (BSCKI)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-on-surface mb-1">Chuyên Khoa Cố Vấn *</label>
                  <select
                    value={docSpecialty}
                    onChange={(e) => setDocSpecialty(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-medium"
                  >
                    <option value="Tim Mạch Can Thiệp">Tim Mạch Can Thiệp</option>
                    <option value="Lão Khoa & Sa Sút Trí Tuệ">Lão Khoa & Sa Sút Trí Tuệ</option>
                    <option value="Hồi Sức Tích Cực (ICU)">Hồi Sức Tích Cực (ICU)</option>
                    <option value="Nội Tiết & Chuyển Hoá">Nội Tiết & Chuyển Hoá</option>
                    <option value="Cấp Cứu Ngoại Viện & Telehealth">Cấp Cứu Ngoại Viện & Telehealth</option>
                    <option value="Chấn Thương Chỉnh Hình Lão Khoa">Chấn Thương Chỉnh Hình Lão Khoa</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-on-surface mb-1">Số CCHN Bộ Y Tế *</label>
                  <input
                    type="text"
                    value={docLicense}
                    onChange={(e) => setDocLicense(e.target.value)}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Đơn Vị Công Tác / Bệnh Viện Trực Thuộc</label>
                <input
                  type="text"
                  value={docAffiliation}
                  onChange={(e) => setDocAffiliation(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1.5">Ca Trực Đăng Ký Cố Vấn *</label>
                <div className="flex items-center gap-3">
                  {(['Sáng', 'Chiều', 'Đêm C/C'] as const).map((shift) => (
                    <label
                      key={shift}
                      className="flex items-center gap-1.5 p-2 px-3 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={docShifts.includes(shift)}
                        onChange={() => handleToggleShift(shift)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span className="font-bold text-on-surface">{shift}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-title-sm text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Xác Nhận Lưu Vào Hội Đồng Y Khoa</span>
                </button>
              </div>

              {addNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-2 font-medium">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Đã tiếp nhận hồ sơ vào danh sách xét duyệt của Hội đồng y khoa GrandCare!</span>
                </div>
              )}
            </form>
          </div>

          {/* Quick Access: Clinical Board Guidelines */}
          <div className="rounded-2xl bg-surface-clean p-6 border border-outline-variant/30 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-clinical-amber text-[22px]">policy</span>
                <h4 className="font-title-lg text-base font-bold text-on-surface">
                  Quy Chế Hội Chẩn Đột Xuất
                </h4>
              </div>
              <ul className="flex flex-col gap-3 text-xs text-on-surface-variant leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-vital-stable shrink-0 mt-0.5">check</span>
                  <span>Túc trực cấp 1 có mặt trong vòng 5 phút khi kích hoạt Báo Động Đỏ.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-vital-stable shrink-0 mt-0.5">check</span>
                  <span>Hội đồng phê duyệt phác đồ đa mô thức phải có ít nhất 02 chuyên gia hàm PGS/TS ký duyệt số.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[16px] text-vital-stable shrink-0 mt-0.5">check</span>
                  <span>Bảo mật dữ liệu hội chẩn Telehealth tuân thủ cấp độ HIPAA & HL7 FHIR.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-outline-variant/20 mt-4">
              <div className="text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer">
                <span>Xem Sổ Tay Vận Hành Y Khoa 2026</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
