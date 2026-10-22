import React, { useState } from 'react';
import { HL7Message, ApiKeyItem } from '../types';
import { INITIAL_HL7_STREAM } from '../data/mockData';

interface ApiGatewayViewProps {
  onTriggerToast?: (title: string, desc: string, type: 'success' | 'warning' | 'emergency') => void;
}

const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'KEY-01',
    name: 'Khóa Master EHR HL7/FHIR (Central Campus)',
    keyPrefix: 'gc_live_hl7_e829fa',
    fullKey: 'gc_live_hl7_e829fa4109b83d1c8f49e02bb147a98',
    createdAt: '15/01/2026',
    lastUsed: '1 phút trước',
    status: 'active',
    scopes: ['EHR:Read', 'EHR:Write', 'FHIR:R4', 'HL7:MLLP'],
    rateLimit: '10,000 req/min',
  },
  {
    id: 'KEY-02',
    name: 'Khóa Liên Kết Phân Hệ Nghỉ Dưỡng Vệ Tinh (Sala/Thảo Điền)',
    keyPrefix: 'gc_resort_v2_9104b2',
    fullKey: 'gc_resort_v2_9104b281f6e07a34cd82110ea381fc2',
    createdAt: '02/02/2026',
    lastUsed: '3 phút trước',
    status: 'active',
    scopes: ['EHR:Read', 'Pharmacy:Order', 'Rooms:IoT'],
    rateLimit: '5,000 req/min',
  },
  {
    id: 'KEY-03',
    name: 'Khóa Cổng Hội Chẩn Quốc Tế Cleveland Clinic',
    keyPrefix: 'gc_cleveland_5c81d2',
    fullKey: 'gc_cleveland_5c81d2001ba924ef84c718a20399d81',
    createdAt: '10/03/2026',
    lastUsed: '18 phút trước',
    status: 'active',
    scopes: ['Telehealth:4K', 'DICOM:Viewer', 'Consult:Sign'],
    rateLimit: '2,000 req/min',
  },
  {
    id: 'KEY-04',
    name: 'Khóa Điều Phối Xe Cứu Thương 115 GPS & Tele-ICU',
    keyPrefix: 'gc_dispatch_77a09d',
    fullKey: 'gc_dispatch_77a09d3b14e628105fcb9201ac44199',
    createdAt: '22/03/2026',
    lastUsed: 'Vừa xong (Live)',
    status: 'active',
    scopes: ['115:Dispatch', 'GPS:Dijkstra', 'Telemetry:Stream'],
    rateLimit: '20,000 req/min',
  },
];

export const ApiGatewayView: React.FC<ApiGatewayViewProps> = ({ onTriggerToast }) => {
  const [messages, setMessages] = useState<HL7Message[]>(INITIAL_HL7_STREAM);
  const [selectedMsgType, setSelectedMsgType] = useState<'ADT^A01' | 'ORU^R01' | 'RDE^O11' | 'MDM^T02'>('ADT^A01');
  const [testPatientName, setTestPatientName] = useState('GS. Nguyễn Văn An');
  const [isSending, setIsSending] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);

  // API Key management state
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>(INITIAL_API_KEYS);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState('5,000 req/min');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['EHR:Read', 'FHIR:R4']);
  const [allLockedEmergency, setAllLockedEmergency] = useState(false);

  const notify = (title: string, desc: string, type: 'success' | 'warning' | 'emergency' = 'success') => {
    if (onTriggerToast) {
      onTriggerToast(title, desc, type);
    }
  };

  // Toggle Lock/Unlock for a single key
  const handleToggleLockKey = (keyId: string) => {
    setApiKeys((prev) =>
      prev.map((k) => {
        if (k.id === keyId) {
          const nextStatus = k.status === 'active' ? 'locked' : 'active';
          if (nextStatus === 'locked') {
            notify(
              'ĐÃ KHÓA API THÀNH CÔNG',
              `Khóa API "${k.name}" đã bị vô hiệu hóa lập tức. Mọi kết nối sử dụng khóa này sẽ bị từ chối truy cập (HTTP 403 Forbidden).`,
              'warning'
            );
          } else {
            notify(
              'ĐÃ MỞ KHÓA API',
              `Khóa API "${k.name}" đã được khôi phục hoạt động bình thường.`,
              'success'
            );
          }
          return { ...k, status: nextStatus };
        }
        return k;
      })
    );
  };

  // Toggle reveal key
  const handleToggleReveal = (keyId: string) => {
    setRevealedKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  // Copy API Key
  const handleCopyKey = (fullKey: string) => {
    navigator.clipboard.writeText(fullKey);
    notify('Đã Sao Chép Khóa API!', 'Khóa bảo mật đã được sao chép vào bộ nhớ tạm (Clipboard).', 'success');
  };

  // Revoke/Delete key
  const handleRevokeKey = (keyId: string, name: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== keyId));
    notify('Đã Thu Hồi Khóa API', `Đã xóa vĩnh viễn khóa API "${name}" khỏi cổng quản trị.`, 'warning');
  };

  // Emergency Kill-Switch: Lock All APIs
  const handleEmergencyKillSwitch = () => {
    if (!allLockedEmergency) {
      setApiKeys((prev) => prev.map((k) => ({ ...k, status: 'locked' })));
      setAllLockedEmergency(true);
      notify(
        'KÍCH HOẠT KHÓA KHẨN CẤP TOÀN BỘ API (KILL-SWITCH)',
        'CẢNH BÁO BẢO MẬT: Đã ngắt kết nối và khóa toàn bộ 100% Khóa API ngoại vi để ngăn ngừa nguy cơ rò rỉ dữ liệu y tế!',
        'emergency'
      );
    } else {
      setApiKeys((prev) => prev.map((k) => ({ ...k, status: 'active' })));
      setAllLockedEmergency(false);
      notify(
        'ĐÃ MỞ KHÓA TOÀN BỘ HỆ THỐNG API',
        'Toàn bộ cổng liên thông API HL7/FHIR đã được mở khóa và tái lập kết nối an toàn.',
        'success'
      );
    }
  };

  // Create New Key
  const handleCreateNewKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const fullKeyGenerated = `gc_sec_${randomHex}`;
    const prefix = fullKeyGenerated.slice(0, 18);

    const newKeyItem: ApiKeyItem = {
      id: `KEY-${Date.now()}`,
      name: newKeyName,
      keyPrefix: prefix,
      fullKey: fullKeyGenerated,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      lastUsed: 'Chưa sử dụng',
      status: 'active',
      scopes: newKeyScopes,
      rateLimit: newKeyRateLimit,
    };

    setApiKeys([newKeyItem, ...apiKeys]);
    setShowNewKeyModal(false);
    setNewKeyName('');
    notify(
      'Khởi Tạo Khóa API Mới Thành Công!',
      `Khóa API "${newKeyName}" đã được cấp phát với quyền: ${newKeyScopes.join(', ')}.`,
      'success'
    );
  };

  const handleToggleScope = (scope: string) => {
    if (newKeyScopes.includes(scope)) {
      if (newKeyScopes.length > 1) {
        setNewKeyScopes(newKeyScopes.filter((s) => s !== scope));
      }
    } else {
      setNewKeyScopes([...newKeyScopes, scope]);
    }
  };

  // Test payload message dispatch
  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if master EHR key is locked
    const masterKey = apiKeys.find((k) => k.id === 'KEY-01');
    if (masterKey?.status === 'locked') {
      notify(
        'Yêu Cầu Bị Từ Chối (HTTP 403)',
        'Khóa API HL7/FHIR Master hiện đang bị KHÓA. Vui lòng mở khóa API trước khi thực hiện truyền nhận gói tin.',
        'emergency'
      );
      return;
    }

    setIsSending(true);
    const time = new Date().toTimeString().split(' ')[0];
    const newMsg: HL7Message = {
      id: `HL7-${Date.now()}`,
      timestamp: time,
      messageType: selectedMsgType,
      description: `Test payload điều hướng liên thông cho ${testPatientName}`,
      sender: 'WEB-PORTAL-CLIENT',
      receiver: 'GRANDCARE-FHIR-SERVER',
      status: 'ACK',
      rawPayload: `MSH|^~\\&|WEB-CLIENT|GATEWAY|GRANDCARE-FHIR|CAMPUS|${Date.now()}||${selectedMsgType}|TEST-${Math.floor(
        1000 + Math.random() * 9000
      )}|P|2.5.1\nPID|1||EHR-TEST-01||${testPatientName}\nPV1|1|I|ROOM-TEST|AUTO-SYNC|||DOC-SYSTEM`,
    };

    setTimeout(() => {
      setMessages([newMsg, ...messages]);
      setIsSending(false);
      setApiFeedback(`Đã truyền tải thành công gói tin ${selectedMsgType} qua cổng MLLP / REST FHIR R4. Trả về mã phản hồi HTTP 200 OK.`);
      setTimeout(() => setApiFeedback(null), 4000);
    }, 600);
  };

  const activeKeysCount = apiKeys.filter((k) => k.status === 'active').length;
  const lockedKeysCount = apiKeys.filter((k) => k.status === 'locked').length;

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="px-6 py-4 bg-surface-clean rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                Interoperability Bridge & Security Vault
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                HL7 v2.5.1 / FHIR R4
              </span>
            </div>
            <h2 className="font-headline-sm text-xl text-primary font-bold mt-1">
              Cổng Quản Trị, Khóa API & Cấu Hình Liên Kết 2-Web
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container font-mono text-on-surface">
              <span className="w-2 h-2 rounded-full bg-vital-stable animate-ping"></span>
              Gateway Uptime: 99.99%
            </span>

            {/* Emergency Kill-Switch Button */}
            <button
              onClick={handleEmergencyKillSwitch}
              className={`h-9 px-3.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                allLockedEmergency
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                  : 'bg-emergency-red hover:bg-red-700 text-white'
              }`}
              title="Khóa khẩn cấp toàn bộ các cổng API ngoại vi"
            >
              <span className="material-symbols-outlined text-[16px]">
                {allLockedEmergency ? 'lock_open' : 'lock_reset'}
              </span>
              <span>{allLockedEmergency ? 'Mở Khóa Toàn Hệ Thống' : 'Khóa Khẩn Cấp Toàn Bộ API'}</span>
            </button>
          </div>
        </div>

        {/* 2-Web Architecture Node Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">apartment</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-title-lg text-sm font-bold text-on-surface">
                  Trụ Sở Chính GrandCare Central Hub
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Primary Node
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-2">
                Trung tâm dữ liệu máy chủ cơ sở dữ liệu lâm sàng Master EHR & Kho Dược tự động (TP. Thủ Đức).
              </p>
              <div className="text-[11px] font-mono text-primary space-y-0.5">
                <div>Endpoint: https://api.grandcare.vn/fhir/r4</div>
                <div className="text-on-surface-variant">Độ trễ ping: 8ms · Đồng bộ 2 chiều (mTLS 1.3)</div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 flex items-start gap-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-secondary-container text-sapphire-dispatch flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[24px]">cottage</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-title-lg text-sm font-bold text-on-surface">
                  Resort An Dưỡng & Trị Liệu Vệ Tinh
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Satellite Node
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mb-2">
                Phân hệ an dưỡng lão khoa cao cấp ven sông, hồ sơ đồng bộ thời gian thực qua kênh VPN mã hoá IPsec.
              </p>
              <div className="text-[11px] font-mono text-secondary space-y-0.5">
                <div>Endpoint: https://resort.grandcare.vn/api/v2</div>
                <div className="text-on-surface-variant">Độ trễ ping: 12ms · Đồng bộ 2 chiều (IPsec)</div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION: Quản Lý Khóa API & Bảo Mật Liên Thông (API Keys & Security Vault) */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/20 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">key</span>
                <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                  Quản Lý Khóa API & Phân Quyền Bảo Mật (API Key Vault)
                </h3>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Cấp phát, thu hồi và kiểm soát khóa bảo mật (API Key) cho các phân hệ bệnh viện, resort vệ tinh và đối tác quốc tế
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                  {activeKeysCount} Đang Hoạt Động
                </span>
                {lockedKeysCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-emergency-red font-bold border border-rose-200 animate-pulse">
                    {lockedKeysCount} Đã Khóa
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowNewKeyModal(true)}
                className="h-9 px-3.5 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Tạo Khóa API Mới</span>
              </button>
            </div>
          </div>

          {/* API Key List Cards */}
          <div className="space-y-3.5">
            {apiKeys.map((item) => {
              const isLocked = item.status === 'locked';
              const isRevealed = !!revealedKeys[item.id];
              const displayKey = isRevealed ? item.fullKey : `${item.keyPrefix}••••••••••••••••••••••••`;

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                    isLocked
                      ? 'bg-rose-50/40 border-emergency-red/40 ring-1 ring-emergency-red/10'
                      : 'bg-surface-clean border-outline-variant/30 hover:border-primary/40'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-title-md text-sm font-bold text-on-surface truncate">
                        {item.name}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isLocked
                            ? 'bg-emergency-red text-white'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {isLocked ? 'lock' : 'check_circle'}
                        </span>
                        <span>{isLocked ? 'ĐÃ KHÓA (BỊ CHẶN)' : 'Đang Hoạt Động'}</span>
                      </span>
                    </div>

                    {/* Key token string display with reveal and copy */}
                    <div className="flex items-center gap-2 mt-1.5 max-w-xl">
                      <div className="px-3 py-1.5 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs flex-1 truncate select-all border border-slate-800">
                        {displayKey}
                      </div>
                      <button
                        onClick={() => handleToggleReveal(item.id)}
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                        title={isRevealed ? 'Ẩn khóa' : 'Hiện khóa'}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isRevealed ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                      <button
                        onClick={() => handleCopyKey(item.fullKey)}
                        className="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors"
                        title="Sao chép khóa API"
                      >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      </button>
                    </div>

                    {/* Metadata & scopes */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-on-surface-variant mt-2 font-medium">
                      <span>Ngày tạo: <strong>{item.createdAt}</strong></span>
                      <span>Lần gọi gần nhất: <strong>{item.lastUsed}</strong></span>
                      <span>Giới hạn: <strong className="font-mono text-primary">{item.rateLimit}</strong></span>
                      <div className="flex items-center gap-1">
                        <span>Phạm vi:</span>
                        {item.scopes.map((sc) => (
                          <span key={sc} className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-mono text-on-surface font-semibold">
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons: Lock/Unlock & Revoke */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-outline-variant/20">
                    <button
                      onClick={() => handleToggleLockKey(item.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        isLocked
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-emergency-red/10 text-emergency-red hover:bg-emergency-red hover:text-white border border-emergency-red/30'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isLocked ? 'lock_open' : 'lock'}
                      </span>
                      <span>{isLocked ? 'Mở Khóa API' : 'Khóa API Này'}</span>
                    </button>

                    <button
                      onClick={() => handleRevokeKey(item.id, item.name)}
                      className="p-2 rounded-xl text-on-surface-variant hover:text-emergency-red hover:bg-rose-50 transition-colors"
                      title="Thu hồi vĩnh viễn khóa API này"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Security Architecture Posture Strip */}
          <div className="mt-5 p-4 rounded-xl bg-surface-clean border border-outline-variant/20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <div className="text-on-surface-variant text-[11px]">Giao Thức Mã Hóa</div>
              <div className="font-bold text-primary mt-0.5">TLS 1.3 / mTLS Chứng Chỉ X.509</div>
            </div>
            <div>
              <div className="text-on-surface-variant text-[11px]">Tiêu Chuẩn Bảo Mật</div>
              <div className="font-bold text-emerald-800 mt-0.5">HIPAA & HL7 Security Tagging</div>
            </div>
            <div>
              <div className="text-on-surface-variant text-[11px]">Chặn IP Lạ (CIDR Whitelist)</div>
              <div className="font-bold text-vital-stable mt-0.5">Đang bật (10.24.0.0/16)</div>
            </div>
            <div>
              <div className="text-on-surface-variant text-[11px]">Cơ Chế Xác Thực</div>
              <div className="font-bold text-on-surface mt-0.5">Bearer Token + HMAC SHA-256</div>
            </div>
          </div>
        </div>

        {/* Section: Test Payload Dispatcher */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-headline-sm text-base text-on-surface font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">send_time_extension</span>
                <span>Kiểm Thử Truyền Nhận Gói Tin HL7 / FHIR</span>
              </h3>
              <p className="text-xs text-on-surface-variant">
                Gửi lệnh mô phỏng tiếp nhận, xuất kết quả xét nghiệm hoặc kê đơn để kiểm tra độ tin cậy liên thông
              </p>
            </div>
          </div>

          <form onSubmit={handleSendTestMessage} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
            <div>
              <label className="block font-bold text-on-surface mb-1">Loại Thông Điệp HL7 *</label>
              <select
                value={selectedMsgType}
                onChange={(e) => setSelectedMsgType(e.target.value as any)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-semibold"
              >
                <option value="ADT^A01">ADT^A01 (Nhập Viện / Tiếp Nhận Bệnh Nhân)</option>
                <option value="ORU^R01">ORU^R01 (Kết Quả Xét Nghiệm Sinh Hóa / Telemetry)</option>
                <option value="RDE^O11">RDE^O11 (Lệnh Cấp Dược Xuất Kho)</option>
                <option value="MDM^T02">MDM^T02 (Biên Bản Hội Chẩn Telehealth)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-on-surface mb-1">Tên Bệnh Nhân Thử Nghiệm *</label>
              <input
                type="text"
                value={testPatientName}
                onChange={(e) => setTestPatientName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
              />
            </div>

            <div className="pt-5">
              <button
                type="submit"
                disabled={isSending}
                className="w-full h-10 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">
                  {isSending ? 'sync' : 'network_ping'}
                </span>
                <span>{isSending ? 'Đang gửi...' : 'Phát Gói Tin Kiểm Thử'}</span>
              </button>
            </div>
          </form>

          {apiFeedback && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
              <span>{apiFeedback}</span>
            </div>
          )}
        </div>

        {/* Section: Live HL7 / FHIR Message Log Table */}
        <div className="rounded-2xl bg-surface-container-lowest p-6 border border-outline-variant/30 shadow-xs">
          <h3 className="font-headline-sm text-base text-on-surface font-bold mb-3">
            Nhật Ký Bản Tin HL7 v2.5.1 Giao Dịch Gần Nhất
          </h3>

          <div className="space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 rounded-xl bg-surface-clean border border-outline-variant/20 font-mono text-xs space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold">
                      {msg.messageType}
                    </span>
                    <span className="font-sans font-semibold text-on-surface">{msg.description}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant">
                    <span>{msg.timestamp}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                      {msg.status}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 text-emerald-400 text-[10px] overflow-x-auto whitespace-pre-wrap border border-slate-900">
                  {msg.rawPayload}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Tạo Khóa API Mới */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-clean rounded-2xl max-w-lg w-full p-6 shadow-xl border border-outline-variant/30">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">key</span>
                <h3 className="font-headline-sm text-base text-primary font-bold">
                  Khởi Tạo Khóa API & Phân Quyền Mới
                </h3>
              </div>
              <button
                onClick={() => setShowNewKeyModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateNewKey} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Tên Hệ Thống / Đối Tác Kết Nối *
                </label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ví dụ: Cổng Liên Thông Sở Y Tế TP.HCM"
                  required
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30"
                />
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1">
                  Giới Hạn Tốc Độ Gọi (Rate Limit) *
                </label>
                <select
                  value={newKeyRateLimit}
                  onChange={(e) => setNewKeyRateLimit(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 font-medium"
                >
                  <option value="1,000 req/min">1,000 req/min (Tiêu chuẩn đối tác)</option>
                  <option value="5,000 req/min">5,000 req/min (Phân hệ nội bộ)</option>
                  <option value="10,000 req/min">10,000 req/min (Trọng điểm Master)</option>
                  <option value="20,000 req/min">20,000 req/min (Cấp cứu thời gian thực 115)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-on-surface mb-1.5">
                  Phạm Vi Quyền Truy Cập (Scopes) *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'EHR:Read',
                    'EHR:Write',
                    'FHIR:R4',
                    'HL7:MLLP',
                    'Pharmacy:Order',
                    'Telehealth:4K',
                    '115:Dispatch',
                    'Rooms:IoT',
                  ].map((sc) => (
                    <label
                      key={sc}
                      className="flex items-center gap-1.5 p-2 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container transition-all"
                    >
                      <input
                        type="checkbox"
                        checked={newKeyScopes.includes(sc)}
                        onChange={() => handleToggleScope(sc)}
                        className="rounded text-primary focus:ring-0"
                      />
                      <span className="font-mono text-[11px] font-bold text-on-surface">{sc}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/20 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewKeyModal(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high font-semibold"
                >
                  Huỷ Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-emerald-deep text-on-primary font-bold shadow-sm flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Phát Hành Khóa Mới</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
