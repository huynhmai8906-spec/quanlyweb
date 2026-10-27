import React, { useState, useEffect } from 'react';
import { NavigationTab } from '../types';

interface TopHeaderProps {
  currentTab: NavigationTab;
  onNavigateTab: (tab: NavigationTab) => void;
  onSearch: (query: string) => void;
  onTriggerEmergency: () => void;
}

const TAB_TITLES: Record<NavigationTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Tổ Hợp Y Tế Quốc Tế & Nghỉ Dưỡng Lão Khoa',
    subtitle: 'Trung Tâm Điều Hành Tổng Thể & Nhịp Sống Lâm Sàng Trực Tiếp',
  },
  patients: {
    title: 'Quản Lý Bệnh Nhân & Hồ Sơ EHR Master',
    subtitle: 'HL7 v2.5.1 / FHIR R4 Interoperability Clinical Records',
  },
  pharmacy: {
    title: 'Kho Dược & Đơn Thuốc Liên Kết',
    subtitle: 'Quản Trị Dược Lâm Sàng, Tồn Kho Tự Động & Đẩy API Kê Đơn',
  },
  doctors: {
    title: 'Hội Đồng Y Khoa Quản Trị Lâm Sàng',
    subtitle: 'Chuyên Gia Cố Vấn, Lịch Trực Tuần & Phê Duyệt Phác Đồ',
  },
  telehealth: {
    title: 'Lịch Khám & Hội Chẩn Telehealth Trực Tuyến',
    subtitle: 'Phòng Họp Ảo Grand Round Quốc Tế & Đồng Bộ Lịch Google',
  },
  rooms: {
    title: 'Sơ Đồ Phòng Nghỉ Dưỡng & Giường Bệnh Cao Cấp',
    subtitle: 'Hệ Thống Cảm Biến Môi Trường IoT, Khí Y Tế & Điều Khiển VIP',
  },
  emergency: {
    title: 'Trung Tâm Điều Phối Cấp Cứu 115 & Dijkstra GPS',
    subtitle: 'Cấp Cứu Thời Gian Vàng - Tối Ưu Lộ Trình Xe Cứu Thương Ngoại Viện',
  },
  online_orders: {
    title: 'Đơn Đặt Từ Web Khách Hàng',
    subtitle: 'Đồng Bộ Thời Gian Thực Qua Database Supabase Dùng Chung',
  },
  api_gateway: {
    title: 'Cổng Liên Kết 2-Web & HL7/FHIR API Gateway',
    subtitle: 'Giao Thức Đồng Bộ Hai Chiều GoCare Central Hub & Resort Vệ Tinh',
  },
};

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentTab,
  onNavigateTab,
  onSearch,
  onTriggerEmergency,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [searchVal, setSearchVal] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('vi-VN', {
          weekday: 'long',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const meta = TAB_TITLES[currentTab] || TAB_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-40 bg-surface-clean/95 backdrop-blur-md border-b border-outline-variant/30 px-6 py-3.5 flex items-center justify-between shadow-xs">
      {/* Title & subtitle */}
      <div className="flex items-center gap-3 min-w-0">
        <img
          src="/assets/aistudio/image_8e7aadb2.png"
          alt="GoCare"
          className="h-9 w-auto object-contain hidden sm:block bg-white rounded-lg p-1 border border-outline-variant/30 shadow-xs shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-[11px] font-bold text-[#0066CC] tracking-wider uppercase">
              GoCare System
            </span>
            <span className="text-on-surface-variant/40">/</span>
            <span className="font-label-sm text-[11px] font-medium text-on-surface-variant truncate">
              {meta.title}
            </span>
          </div>
          <h2 className="font-headline-sm text-lg lg:text-xl text-primary font-bold tracking-tight truncate">
            {meta.title}
          </h2>
        </div>
      </div>

      {/* Center search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            type="text"
            value={searchVal}
            onChange={(e) => {
              setSearchVal(e.target.value);
              onSearch(e.target.value);
            }}
            placeholder="Tìm bệnh nhân (Tên, CCCD), mã thuốc, bác sĩ..."
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface text-xs focus:bg-surface-clean focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {searchVal && (
            <button
              onClick={() => {
                setSearchVal('');
                onSearch('');
              }}
              className="absolute right-2.5 top-2.5 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Realtime clock */}
        <div className="hidden xl:flex flex-col text-right">
          <span className="text-[11px] font-mono tabular-nums font-semibold text-on-surface">
            {currentTime}
          </span>
          <span className="text-[10px] text-emerald-deep font-medium flex items-center justify-end gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-vital-stable animate-ping"></span>
            Máy chủ: TP. Hồ Chí Minh
          </span>
        </div>

        {/* 115 Emergency Hotline Action */}
        <button
          onClick={onTriggerEmergency}
          className="px-3.5 py-1.5 rounded-xl bg-emergency-red hover:bg-red-700 text-white font-title-sm text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all animate-pulse"
          title="Kích hoạt báo động điều phối cấp cứu 115"
        >
          <span className="material-symbols-outlined text-[18px]">e911_emergency</span>
          <span className="hidden sm:inline">Báo Động 115</span>
        </button>

        {/* Quick link to rooms */}
        <button
          onClick={() => onNavigateTab('rooms')}
          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
          title="Xem sơ đồ giường bệnh"
        >
          <span className="material-symbols-outlined text-[20px]">single_bed</span>
        </button>

        {/* Quick link to telehealth */}
        <button
          onClick={() => onNavigateTab('telehealth')}
          className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
          title="Vào phòng họp Telehealth"
        >
          <span className="material-symbols-outlined text-[20px]">video_call</span>
        </button>
      </div>
    </header>
  );
};
