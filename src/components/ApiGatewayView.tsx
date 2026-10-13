import React, { useState } from 'react';
import { HL7Message } from '../types';
import { INITIAL_HL7_STREAM } from '../data/mockData';

export const ApiGatewayView: React.FC = () => {
  const [messages, setMessages] = useState<HL7Message[]>(INITIAL_HL7_STREAM);
  const [selectedMsgType, setSelectedMsgType] = useState<'ADT^A01' | 'ORU^R01' | 'RDE^O11' | 'MDM^T02'>('ADT^A01');
  const [testPatientName, setTestPatientName] = useState('GS. Nguyễn Văn An');
  const [isSending, setIsSending] = useState(false);
  const [apiFeedback, setApiFeedback] = useState<string | null>(null);

  const handleSendTestMessage = (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface">
      <div className="px-6 py-4 bg-surface flex flex-col gap-6 max-w-7xl mx-auto w-full">
        {/* Top Header */}
        <div className="px-6 py-4 bg-surface-clean rounded-2xl shadow-xs border border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-label-sm text-xs font-bold text-primary uppercase tracking-wider">
                Interoperability Bridge & 2-Web Sync
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                HL7 v2.5.1 / FHIR R4
              </span>
            </div>
            <h2 className="font-headline-sm text-xl text-primary font-bold mt-1">
              Cổng Quản Trị & Cấu Hình API Liên Kết 2-Web
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface">
              <span className="w-2 h-2 rounded-full bg-vital-stable animate-ping"></span>
              Gateway Uptime: 99.99%
            </span>
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
                <div className="text-on-surface-variant">Độ trễ ping: 8ms · Đồng bộ 2 chiều</div>
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
                <div className="text-on-surface-variant">Độ trễ ping: 12ms · Đồng bộ 2 chiều</div>
              </div>
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
    </div>
  );
};
