import React from 'react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  patientCount: number;
  pendingRxCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  patientCount,
  pendingRxCount,
}) => {
  const navItems: {
    key: NavigationTab;
    label: string;
    icon: string;
    badge?: string | number;
    badgeColor?: string;
  }[] = [
    {
      key: 'dashboard',
      label: 'Tổng quan & Dashboard',
      icon: 'space_dashboard',
    },
    {
      key: 'patients',
      label: 'Hồ Sơ Bệnh Nhân EHR',
      icon: 'clinical_notes',
      badge: patientCount,
      badgeColor: 'bg-primary/10 text-primary',
    },
    {
      key: 'pharmacy',
      label: 'Kho Dược & Đơn Thuốc',
      icon: 'medication',
      badge: `${pendingRxCount} đơn`,
      badgeColor: 'bg-amber-100 text-amber-900',
    },
    {
      key: 'doctors',
      label: 'Bác Sĩ & Hội Đồng Y Khoa',
      icon: 'badge',
      badge: '48 GS/BS',
      badgeColor: 'bg-emerald-50 text-emerald-800',
    },
    {
      key: 'telehealth',
      label: 'Lịch Khám & Telehealth',
      icon: 'video_camera_front',
      badge: 'LIVE',
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      key: 'rooms',
      label: 'Sơ Đồ Phòng & Giường',
      icon: 'single_bed',
      badge: '388/450',
      badgeColor: 'bg-secondary-fixed text-sapphire-dispatch',
    },
    {
      key: 'emergency',
      label: 'Cấp Cứu 115 & Dijkstra GPS',
      icon: 'emergency',
      badge: 'SOS 115',
      badgeColor: 'bg-emergency-red/10 text-emergency-red',
    },
    {
      key: 'api_gateway',
      label: 'Cổng Liên Kết 2-Web & API',
      icon: 'hub',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-72 bg-surface-clean shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-r border-outline-variant/30 z-50 flex flex-col justify-between overflow-y-auto">
      <div className="p-space-lg">
        {/* Brand header */}
        <div className="flex items-center gap-space-sm mb-space-lg">
          <div className="w-10 h-10 rounded-xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl shadow-md shrink-0">
            G+
          </div>
          <div className="min-w-0">
            <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight truncate">
              Viện Quốc Tế GrandCare
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
              Tổ Hợp Y Tế & Nghỉ Dưỡng Lão Khoa
            </p>
          </div>
        </div>

        {/* HL7 standard badge */}
        <div className="mb-4 px-3 py-2 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-vital-stable animate-pulse"></span>
            HL7 v2.5.1 / FHIR R4
          </span>
          <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            Online
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group ${
                  isActive
                    ? 'bg-primary text-on-primary shadow-sm font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 transition-transform ${
                      isActive ? 'text-on-primary scale-110' : 'text-on-surface-variant group-hover:text-primary'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span className="font-title-sm text-title-sm truncate">
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-on-primary'
                        : item.badgeColor || 'bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile / bottom bar */}
      <div className="p-space-lg border-t border-outline-variant/20 bg-surface-container-lowest/70">
        <div className="flex items-center gap-3">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkpudh7rAZ96_KIFzvg_Nc-ekqvtyXCIscm3rdlHkrVZ6zoU"
            alt="BSCKI Huỳnh Mai"
            className="w-10 h-10 rounded-full object-cover border border-outline-variant/40 shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 flex-1">
            <div className="font-title-sm text-title-sm text-on-surface font-bold truncate">
              BSCKI. Huỳnh Mai
            </div>
            <div className="text-[11px] text-on-surface-variant truncate">
              Trưởng Kíp Điều Hành Lâm Sàng
            </div>
            <div className="text-[10px] text-primary font-medium">
              CCHN: 019283/BYT-CCHN
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
