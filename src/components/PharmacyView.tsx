import React, { useState } from 'react';
import { MedicationItem, Prescription, Patient } from '../types';

interface PharmacyViewProps {
  medications: MedicationItem[];
  prescriptions: Prescription[];
  patients: Patient[];
  onTogglePrescriptionStatus: (rxId: string) => void;
  onCreatePrescription: (newRx: Prescription) => void;
  onRestockMedication: (medId: string, addedStock: number) => void;
}

export const PharmacyView: React.FC<PharmacyViewProps> = ({
  medications,
  prescriptions,
  patients,
  onTogglePrescriptionStatus,
  onCreatePrescription,
  onRestockMedication,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rxFilter, setRxFilter] = useState<'all' | 'shipping' | 'delivered'>('all');

  // New Rx form state
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [selectedMedId, setSelectedMedId] = useState(medications[0]?.id || '');
  const [rxDosage, setRxDosage] = useState('1 viên');
  const [rxQuantity, setRxQuantity] = useState(30);
  const [rxInstruction, setRxInstruction] = useState('Uống sau bữa ăn sáng');
  const [rxPriority, setRxPriority] = useState<'Khẩn Cấp' | 'Ưu Tiên' | 'Tiêu Chuẩn'>('Ưu Tiên');
  const [isDispatchingApi, setIsDispatchingApi] = useState(false);
  const [lastDispatchedJson, setLastDispatchedJson] = useState<string | null>(null);

  // Restock modal state
  const [restockMed, setRestockMed] = useState<MedicationItem | null>(null);
  const [restockAmount, setRestockAmount] = useState(50);

  // Filtered medications
  const filteredMeds = medications.filter((m) => {
    const matchesGroup = selectedGroup === 'all' || m.group === selectedGroup;
    const matchesQuery =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.lotNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesQuery;
  });

  // Filtered prescriptions
  const filteredRxs = prescriptions.filter((rx) => {
    if (rxFilter === 'shipping') return rx.deliveryStatus === 'Đang Vận Chuyển' || rx.deliveryStatus === 'Đang Chuẩn Bị';
    if (rxFilter === 'delivered') return rx.deliveryStatus === 'Đã Giao Bệnh Nhân';
    return true;
  });

  // Calculate dynamic stats
  const activeShippingCount = prescriptions.filter(
    (p) => p.deliveryStatus === 'Đang Vận Chuyển' || p.deliveryStatus === 'Đang Chuẩn Bị'
  ).length;
  const completedCount = prescriptions.filter((p) => p.deliveryStatus === 'Đã Giao Bệnh Nhân').length;
  const lowStockCount = medications.filter((m) => m.stock < m.minStock).length;

  const handleDispatchPrescription = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDispatchingApi(true);

    const pat = patients.find((p) => p.id === selectedPatientId) || patients[0];
    const med = medications.find((m) => m.id === selectedMedId) || medications[0];
    const rxNumber = `RX-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPrescription: Prescription = {
      id: `RX-${Date.now()}`,
      rxCode: rxNumber,
      patientId: pat.id,
      patientName: pat.name,
      room: pat.room,
      doctor: pat.doctor,
      prescribedAt: `${new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - Vừa kê`,
      drugs: [
        {
          name: med.name,
          dosage: rxDosage,
          quantity: rxQuantity,
          unit: med.unit,
          instruction: rxInstruction,
        },
      ],
      deliveryStatus: 'Đang Chuẩn Bị',
      deliveryTime: 'API đã tiếp nhận đơn sang robot bốc thuốc tự động',
      priority: rxPriority,
    };

    const simulatedHl7Payload = {
      event: 'RDE^O11_PHARMACY_ORDER',
      prescriptionId: rxNumber,
      patientMrn: pat.id,
      patientName: pat.name,
      doctor: pat.doctor,
      destinationUnit: pat.room,
      medicationCode: med.id,
      medicationName: med.name,
      dispenseQuantity: rxQuantity,
      unit: med.unit,
      dispatchTimestamp: new Date().toISOString(),
      robotTargetBin: 'AUTO-CAROUSEL-BAY-04',
      status: 'TRANSMITTED_ACK_SUCCESS',
    };

    setTimeout(() => {
      setIsDispatchingApi(false);
      onCreatePrescription(newPrescription);
      setLastDispatchedJson(JSON.stringify(simulatedHl7Payload, null, 2));
    }, 800);
  };

  const handleConfirmRestock = () => {
    if (restockMed) {
      onRestockMedication(restockMed.id, restockAmount);
      setRestockMed(null);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top KPI & Operational Telemetry Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                Đang Giao Thuốc Tốc Hành
              </span>
              <span className="p-1.5 rounded-lg bg-secondary-container text-on-secondary-container">
                <span className="material-symbols-outlined text-[18px]">local_shipping</span>
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-display-lg text-3xl text-sapphire-dispatch font-bold tabular-nums">
                {activeShippingCount}
              </span>
              <span className="font-label-md text-xs text-emerald-deep font-semibold">
                Đơn Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-vital-stable text-xs">
              <span className="material-symbols-outlined text-[14px]">bolt</span>
              <span>Trung bình giao: 28 phút nội viện</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                Toa Đã Phát Hoàn Tất
              </span>
              <span className="p-1.5 rounded-lg bg-surface-container-high text-emerald-deep">
                <span className="material-symbols-outlined text-[18px]">task_alt</span>
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-display-lg text-3xl text-emerald-deep font-bold tabular-nums">
                {142 + completedCount}
              </span>
              <span className="font-label-md text-xs text-on-surface-variant">Toa xuất viện</span>
            </div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div className="bg-vital-stable h-1.5 rounded-full" style={{ width: '92%' }}></div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                Đúng Giờ Chuẩn Y Khoa
              </span>
              <span className="p-1.5 rounded-lg bg-primary-fixed text-primary">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-display-lg text-3xl text-primary font-bold tabular-nums">99.4%</span>
              <span className="font-label-sm text-[11px] text-vital-stable font-bold">▲ +0.6%</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-vital-stable">
              <span className="w-2 h-2 rounded-full bg-vital-stable animate-pulse"></span>
              <span>Đạt chuẩn 5 Đúng JCI</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="bg-surface-clean rounded-2xl p-5 shadow-xs border border-outline-variant/30 relative overflow-hidden flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold">
                Cảnh Báo Tồn Kho Thấp
              </span>
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                <span className="material-symbols-outlined text-[18px]">warning</span>
              </span>
            </div>
            <div className="my-2 flex items-baseline gap-2">
              <span className="font-display-lg text-3xl text-amber-700 font-bold tabular-nums">
                {lowStockCount}
              </span>
              <span className="font-label-md text-xs text-on-surface-variant">Mặt hàng</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-on-surface-variant">
              <span>Đề xuất tự động bổ sung kho trung tâm</span>
            </div>
          </div>
        </div>

        {/* Section 1: Kê Đơn Mới & Bắn API Kho Dược */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-outline-variant/20 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">send_time_extension</span>
                <h3 className="font-headline-sm text-lg text-primary font-bold">
                  Kê Đơn & Bắn API Kho Dược Tự Động (HL7 RDE^O11)
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Kê đơn nhanh cho bệnh nhân nội trú, tự động đối chiếu dị ứng thuốc và truyền thẳng tới máy bốc thuốc robot
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full font-bold border border-emerald-200">
              API HL7: Connected 99.98%
            </span>
          </div>

          <form onSubmit={handleDispatchPrescription} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">Chọn Bệnh Nhân *</label>
                <select
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-medium"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} - {p.room}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Chọn Thuốc Từ Kho Dược *</label>
                <select
                  value={selectedMedId}
                  onChange={(e) => setSelectedMedId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-medium"
                >
                  {medications.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (Tồn: {m.stock} {m.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Liều Dùng & Số Lượng *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    placeholder="Liều dùng"
                    className="flex-1 h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                  />
                  <input
                    type="number"
                    value={rxQuantity}
                    onChange={(e) => setRxQuantity(Number(e.target.value))}
                    min="1"
                    className="w-20 h-10 px-2 rounded-xl bg-surface-container-low border border-outline-variant/30 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">Mức Độ Ưu Tiên Cấp Phát *</label>
                <select
                  value={rxPriority}
                  onChange={(e) => setRxPriority(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-medium"
                >
                  <option value="Tiêu Chuẩn">Tiêu Chuẩn (Giao trong 30p)</option>
                  <option value="Ưu Tiên">Ưu Tiên (Giao trong 15p)</option>
                  <option value="Khẩn Cấp">Khẩn Cấp (Cấp cứu - Giao ngay)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 text-xs items-center">
              <div className="lg:col-span-3">
                <label className="block font-bold text-on-surface mb-1">Hướng Dẫn Sử Dụng & Giờ Dùng</label>
                <input
                  type="text"
                  value={rxInstruction}
                  onChange={(e) => setRxInstruction(e.target.value)}
                  placeholder="Ví dụ: 1 viên uống sau ăn sáng, theo dõi huyết áp sau uống 30 phút"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                />
              </div>

              <div className="pt-5">
                <button
                  type="submit"
                  disabled={isDispatchingApi}
                  className="w-full h-10 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-title-sm text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isDispatchingApi ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                      <span>Đang Bắn API Kho...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Bắn API & Đẩy Sang Kho</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Last Dispatched Feedback Strip */}
          {lastDispatchedJson && (
            <div className="mt-4 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-400 font-mono">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span>Payload API HL7 RDE^O11 đã gửi thành công tới Robot Kho Dược:</span>
                <span className="text-emerald-400 font-bold">200 OK</span>
              </div>
              <pre className="text-[10px] overflow-x-auto whitespace-pre-wrap">{lastDispatchedJson}</pre>
            </div>
          )}
        </div>

        {/* Section 2: Prescription Queue with 1-Click Status Toggle */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                Danh Sách Đơn Thuốc Chờ Phát Dược & Liên Kết Tự Động
              </h3>
              <p className="text-xs text-on-surface-variant">
                Chuyển trạng thái 1 chạm để cập nhật tiến độ vận chuyển thuốc lên các phòng nội trú
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setRxFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  rxFilter === 'all' ? 'bg-primary text-white font-bold' : 'bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                Tất cả ({prescriptions.length})
              </button>
              <button
                onClick={() => setRxFilter('shipping')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  rxFilter === 'shipping' ? 'bg-secondary text-white font-bold' : 'bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                Đang giao ({activeShippingCount})
              </button>
              <button
                onClick={() => setRxFilter('delivered')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  rxFilter === 'delivered' ? 'bg-vital-stable text-white font-bold' : 'bg-surface-container hover:bg-surface-container-high'
                }`}
              >
                Đã giao ({completedCount})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRxs.map((rx) => {
              const isDelivered = rx.deliveryStatus === 'Đã Giao Bệnh Nhân';
              return (
                <div
                  key={rx.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isDelivered
                      ? 'bg-surface-clean border-outline-variant/20'
                      : 'bg-surface-container-lowest border-secondary/40 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-primary">{rx.rxCode}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          rx.priority === 'Khẩn Cấp'
                            ? 'bg-rose-100 text-rose-800'
                            : rx.priority === 'Ưu Tiên'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rx.priority}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-on-surface mb-0.5">{rx.patientName}</div>
                    <div className="text-[11px] text-on-surface-variant font-mono mb-2">
                      {rx.room} · {rx.doctor}
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-clean border border-outline-variant/20 space-y-1 mb-3">
                      {rx.drugs.map((d, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-semibold text-on-surface">{d.name}</span>
                          <span className="text-on-surface-variant"> ({d.quantity} {d.unit})</span>
                          <div className="text-[10px] text-on-surface-variant italic">{d.instruction}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          isDelivered ? 'text-vital-stable' : 'text-sapphire-dispatch'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isDelivered ? 'check_circle' : 'local_shipping'}
                        </span>
                        <span>{rx.deliveryStatus}</span>
                      </span>
                      <div className="text-[10px] text-on-surface-variant truncate">
                        {rx.deliveryTime}
                      </div>
                    </div>

                    <button
                      onClick={() => onTogglePrescriptionStatus(rx.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                        isDelivered
                          ? 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                          : 'bg-vital-stable text-white hover:bg-emerald-800 shadow-2xs'
                      }`}
                    >
                      {isDelivered ? 'Đánh Dấu Chưa Nhận' : '1 Chạm: Đã Giao'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Drug Catalog & Inventory Management */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                Danh Mục Thuốc & Tồn Kho Tự Động Kho Dược Bệnh Viện
              </h3>
              <p className="text-xs text-on-surface-variant">
                Quản lý số lô, hạn dùng, cảnh báo ngưỡng an toàn và liên thông dược lâm sàng
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-on-surface-variant text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm tên thuốc, số lô..."
                  className="h-9 pl-8 pr-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Group filter */}
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-xs font-medium"
              >
                <option value="all">Tất Cả Nhóm Thuốc</option>
                <option value="Tim Mạch">Tim Mạch</option>
                <option value="Kháng Sinh">Kháng Sinh</option>
                <option value="Lão Khoa / Thần Kinh">Lão Khoa / Thần Kinh</option>
                <option value="Dịch Truyền">Dịch Truyền</option>
                <option value="Tiêu Hoá">Tiêu Hoá</option>
                <option value="Giảm Đau">Giảm Đau</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 text-on-surface-variant font-semibold">
                  <th className="py-3 px-3">Tên Thuốc & Hoạt Chất</th>
                  <th className="py-3 px-3">Nhóm Dược Lý</th>
                  <th className="py-3 px-3">Tồn Kho Thực Tế</th>
                  <th className="py-3 px-3">Đơn Vị</th>
                  <th className="py-3 px-3">Số Lô & Hạn Dùng</th>
                  <th className="py-3 px-3">Điều Kiện Bảo Quản</th>
                  <th className="py-3 px-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filteredMeds.map((med) => {
                  const isLow = med.stock < med.minStock;
                  return (
                    <tr key={med.id} className="hover:bg-surface-clean transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-on-surface">{med.name}</div>
                        <div className="text-[11px] text-on-surface-variant">{med.activeIngredient}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-bold">
                          {med.group}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono font-bold text-sm tabular-nums ${
                              isLow ? 'text-emergency-red' : 'text-primary'
                            }`}
                          >
                            {med.stock}
                          </span>
                          <span className="text-[10px] text-on-surface-variant">/ min {med.minStock}</span>
                        </div>
                        <div className="w-24 bg-surface-container rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${isLow ? 'bg-emergency-red' : 'bg-vital-stable'}`}
                            style={{ width: `${Math.min(100, (med.stock / (med.minStock * 2)) * 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-on-surface-variant">{med.unit}</td>
                      <td className="py-3.5 px-3 font-mono">
                        <div>{med.lotNumber}</div>
                        <div className="text-[10px] text-on-surface-variant">HSD: {med.expiryDate}</div>
                      </td>
                      <td className="py-3.5 px-3 text-[11px] text-on-surface-variant">
                        {med.storage}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => {
                            setRestockMed(med);
                            setRestockAmount(50);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-surface-container hover:bg-primary hover:text-white transition-all text-[11px] font-semibold"
                        >
                          Nhập Kho
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Nhập Kho Thuốc */}
      {restockMed && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-clean rounded-2xl max-w-md w-full p-6 shadow-xl border border-outline-variant/30">
            <h3 className="font-headline-sm text-base text-primary font-bold mb-2">
              Nhập Thêm Thuốc Vào Kho
            </h3>
            <p className="text-xs text-on-surface-variant mb-4">
              Cập nhật số lượng nhập kho cho: <strong>{restockMed.name}</strong>
            </p>

            <div className="space-y-3 text-xs mb-5">
              <div>
                <label className="block font-bold text-on-surface mb-1">Số Lượng Nhập Thêm ({restockMed.unit})</label>
                <input
                  type="number"
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  min="1"
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-mono text-sm"
                />
              </div>
              <div className="p-3 rounded-xl bg-surface-container-low text-[11px] text-on-surface-variant">
                Tồn hiện tại: <strong>{restockMed.stock}</strong> → Sau khi nhập: <strong>{restockMed.stock + restockAmount}</strong> {restockMed.unit}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setRestockMed(null)}
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-semibold"
              >
                Huỷ Bỏ
              </button>
              <button
                onClick={handleConfirmRestock}
                className="px-4 py-2 rounded-xl bg-primary text-on-primary font-bold hover:bg-emerald-deep"
              >
                Xác Nhận Nhập Kho
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
