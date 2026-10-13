import React, { useState } from 'react';
import { RoomBed } from '../types';

interface RoomsViewProps {
  rooms: RoomBed[];
  onUpdateRoom: (updatedRoom: RoomBed) => void;
  onNavigateToPatientEhr: (patientId: string) => void;
}

export const RoomsView: React.FC<RoomsViewProps> = ({
  rooms,
  onUpdateRoom,
  onNavigateToPatientEhr,
}) => {
  const [selectedWing, setSelectedWing] = useState<'all' | 'wing1' | 'wing2' | 'wing3'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'occupied' | 'available' | 'cleaning'>('all');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(rooms[0]?.id || 'ROOM-301');

  // Currently selected room
  const activeRoom = rooms.find((r) => r.id === selectedRoomId) || rooms[0];

  // Filtering
  const filteredRooms = rooms.filter((r) => {
    if (selectedWing !== 'all' && r.wing !== selectedWing) return false;
    if (statusFilter !== 'all' && r.occupancyStatus !== statusFilter) return false;
    return true;
  });

  const handleTempChange = (delta: number) => {
    if (!activeRoom) return;
    const newTemp = Math.round((activeRoom.temperature + delta) * 10) / 10;
    if (newTemp >= 18 && newTemp <= 28) {
      onUpdateRoom({ ...activeRoom, temperature: newTemp });
    }
  };

  const handleHepaChange = (status: 'Hoạt động 100%' | 'Chế độ êm' | 'Tối đa') => {
    if (!activeRoom) return;
    onUpdateRoom({ ...activeRoom, hepaStatus: status });
  };

  const handleBedHeadAngle = (angle: number) => {
    if (!activeRoom) return;
    onUpdateRoom({
      ...activeRoom,
      bedAngle: { ...activeRoom.bedAngle, head: angle },
    });
  };

  const handleBedFeetAngle = (angle: number) => {
    if (!activeRoom) return;
    onUpdateRoom({
      ...activeRoom,
      bedAngle: { ...activeRoom.bedAngle, feet: angle },
    });
  };

  const handleToggleStatus = (newStatus: 'occupied' | 'available' | 'cleaning') => {
    if (!activeRoom) return;
    onUpdateRoom({ ...activeRoom, occupancyStatus: newStatus });
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Clinical Control Bar */}
        <div className="px-6 py-4 bg-surface-clean rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                Smart In-Patient Suites & Stryker Beds
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                IoT Realtime Sensors
              </span>
            </div>
            <h2 className="font-headline-sm text-xl text-primary font-bold mt-1">
              Sơ Đồ Phòng Nghỉ Dưỡng & Giường Bệnh Y Tế Cao Cấp
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-9 px-3 rounded-xl bg-surface-container border border-outline-variant/30 text-xs font-medium"
            >
              <option value="all">Tất Cả Trạng Thái</option>
              <option value="occupied">Đang Có Bệnh Nhân</option>
              <option value="available">Đang Trống (Sẵn Sàng)</option>
              <option value="cleaning">Đang Tiệt Trùng / Vệ Sinh</option>
            </select>
          </div>
        </div>

        {/* Wing Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          {[
            { key: 'all', label: 'Tất Cả Khu Giường', icon: 'domain' },
            { key: 'wing1', label: 'Khu Đông VIP (Tổng Thống & Suite)', icon: 'hotel' },
            { key: 'wing2', label: 'Khu Tây Lão Khoa (An Dưỡng)', icon: 'nature_people' },
            { key: 'wing3', label: 'Khu Cấp Cứu ICU (Hồi Sức Cấp 1)', icon: 'emergency' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedWing(tab.key as any)}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                selectedWing === tab.key
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'bg-surface-clean text-on-surface-variant hover:bg-surface-container border border-outline-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Grid: Left Room Cards (8 Cols) & Right Environmental Controller (4 Cols) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Room Cards: 8 Columns */}
          <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRooms.map((room) => {
              const isSelected = room.id === activeRoom.id;
              const isOccupied = room.occupancyStatus === 'occupied';
              const isCleaning = room.occupancyStatus === 'cleaning';

              return (
                <div
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary/20'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-title-lg text-base font-bold text-on-surface">
                          {room.roomNumber}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant">
                          {room.wingLabel}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isOccupied
                            ? 'bg-primary/10 text-primary'
                            : isCleaning
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOccupied ? 'Đang nằm' : isCleaning ? 'Đang tiệt trùng' : 'Sẵn sàng'}
                      </span>
                    </div>

                    <div className="text-xs text-on-surface-variant font-medium mb-3 truncate">
                      {room.name}
                    </div>

                    {/* Patient block if occupied */}
                    {isOccupied && room.patientName && (
                      <div className="p-2.5 rounded-xl bg-surface-clean border border-outline-variant/20 mb-3 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-on-surface">{room.patientName}</div>
                          <div className="text-[10px] text-on-surface-variant font-mono">{room.patientId}</div>
                        </div>
                        {room.patientId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigateToPatientEhr(room.patientId!);
                            }}
                            className="text-primary hover:underline font-bold text-[11px] flex items-center gap-0.5"
                          >
                            <span>EHR</span>
                            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Sensors Ribbon */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono pt-1">
                      <div className="p-2 rounded-xl bg-surface-clean border border-outline-variant/20">
                        <div className="text-[10px] text-on-surface-variant font-sans">Nhiệt độ</div>
                        <div className="font-bold text-primary tabular-nums mt-0.5">
                          {room.temperature}°C
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-clean border border-outline-variant/20">
                        <div className="text-[10px] text-on-surface-variant font-sans">Độ ẩm</div>
                        <div className="font-bold text-on-surface tabular-nums mt-0.5">
                          {room.humidity}%
                        </div>
                      </div>
                      <div className="p-2 rounded-xl bg-surface-clean border border-outline-variant/20">
                        <div className="text-[10px] text-on-surface-variant font-sans">SpO2 MT</div>
                        <div className="font-bold text-vital-stable tabular-nums mt-0.5">
                          {room.ambientSpo2}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Foot metadata */}
                  <div className="pt-3 border-t border-outline-variant/20 mt-3 flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-primary">air</span>
                      <span>HEPA: {room.hepaStatus}</span>
                    </span>
                    <span className="font-mono text-[10px]">{room.pressure}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Environmental Controller Panel: 4 Columns */}
          <div className="xl:col-span-4 rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold">
                  <span className="material-symbols-outlined text-[18px]">thermostat</span>
                  <span>Khí Quyển & Điều Khiển VIP</span>
                </div>
                <h3 className="font-headline-sm text-base text-on-surface font-bold mt-0.5">
                  {activeRoom.name}
                </h3>
              </div>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                {activeRoom.roomNumber}
              </span>
            </div>

            {/* Thermostat Controls */}
            <div className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20 text-center">
              <div className="text-xs text-on-surface-variant font-medium mb-1">
                Nhiệt Độ Điều Hòa Vi Khí Hậu
              </div>
              <div className="text-4xl font-bold font-mono text-primary tabular-nums my-2">
                {activeRoom.temperature}°C
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleTempChange(-0.5)}
                  className="w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-lg flex items-center justify-center transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-semibold text-on-surface-variant">Chỉnh 0.5°C</span>
                <button
                  onClick={() => handleTempChange(0.5)}
                  className="w-10 h-10 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-lg flex items-center justify-center transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            {/* HEPA Filtration Rate */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-2">
                Chế Độ Lọc Không Khí Khử Khuẩn HEPA H14
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['Chế độ êm', 'Hoạt động 100%', 'Tối đa'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => handleHepaChange(mode)}
                    className={`py-2 px-1 rounded-xl font-medium text-center transition-all ${
                      activeRoom.hepaStatus === mode
                        ? 'bg-primary text-white font-bold shadow-2xs'
                        : 'bg-surface-clean text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Medical Gas Monitoring */}
            <div className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20 space-y-2">
              <div className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-clinical-amber text-[18px]">gas_meter</span>
                <span>Hệ Thống Khí Y Tế Trung Tâm</span>
              </div>
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-sans">Oxy Lâm Sàng (O2):</span>
                  <span className="text-vital-stable font-bold">{activeRoom.medicalGas.oxygenBar} bar (Chuẩn)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-sans">Khí Nén Y Tế (Air):</span>
                  <span className="text-on-surface font-bold">{activeRoom.medicalGas.airBar} bar</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant font-sans">Hút Chân Không (Vac):</span>
                  <span className="text-on-surface font-bold">{activeRoom.medicalGas.vacuumBar} bar</span>
                </div>
              </div>
            </div>

            {/* Stryker Motorized Bed Angle */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-on-surface">
                Góc Nâng Giường Cơ Điện Stryker In-Touch
              </label>
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>Đầu giường (Fowler):</span>
                  <span className="font-mono font-bold text-primary">{activeRoom.bedAngle.head}°</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 text-xs">
                  {[0, 15, 30, 45].map((ang) => (
                    <button
                      key={ang}
                      onClick={() => handleBedHeadAngle(ang)}
                      className={`py-1 rounded-lg font-mono text-[11px] ${
                        activeRoom.bedAngle.head === ang
                          ? 'bg-emerald-deep text-white font-bold'
                          : 'bg-surface-clean border border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      {ang}°
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>Chân giường:</span>
                  <span className="font-mono font-bold text-primary">{activeRoom.bedAngle.feet}°</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  {[0, 10, 20].map((ang) => (
                    <button
                      key={ang}
                      onClick={() => handleBedFeetAngle(ang)}
                      className={`py-1 rounded-lg font-mono text-[11px] ${
                        activeRoom.bedAngle.feet === ang
                          ? 'bg-emerald-deep text-white font-bold'
                          : 'bg-surface-clean border border-outline-variant/30 hover:bg-surface-container'
                      }`}
                    >
                      {ang}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Occupancy Status Controls */}
            <div className="pt-3 border-t border-outline-variant/20">
              <label className="block text-xs font-bold text-on-surface mb-2">
                Trạng Thái Lưu Trú Phòng
              </label>
              <div className="grid grid-cols-3 gap-1.5 text-xs">
                <button
                  onClick={() => handleToggleStatus('occupied')}
                  className={`py-2 rounded-xl text-center font-bold ${
                    activeRoom.occupancyStatus === 'occupied'
                      ? 'bg-primary text-white shadow-2xs'
                      : 'bg-surface-clean border border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  Đang nằm
                </button>
                <button
                  onClick={() => handleToggleStatus('available')}
                  className={`py-2 rounded-xl text-center font-bold ${
                    activeRoom.occupancyStatus === 'available'
                      ? 'bg-vital-stable text-white shadow-2xs'
                      : 'bg-surface-clean border border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  Sẵn sàng
                </button>
                <button
                  onClick={() => handleToggleStatus('cleaning')}
                  className={`py-2 rounded-xl text-center font-bold ${
                    activeRoom.occupancyStatus === 'cleaning'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-surface-clean border border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  Khử khuẩn
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
